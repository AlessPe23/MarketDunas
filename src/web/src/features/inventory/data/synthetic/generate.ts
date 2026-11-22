import { toWallDateTime } from '@/shared/lib/dates'
import type { Product, StockRecord, UnitOfMeasure } from '../../domain/model'
import { SYNTHETIC_BRANDS, SYNTHETIC_SUPPLIERS, SYNTHETIC_UNITS } from './reference'
import { TEMPLATES } from './templates'
import type { Presentation, ProductTemplate } from './templates'

/** PRNG determinista (mulberry32): mismos parámetros → mismos datos. */
export function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const UNBRANDED = /^(a granel|al corte|al peso)/
const VARIANTS = ['', ' · empaque económico', ' · empaque familiar'] as const
const LONG_SUFFIXES = [' (paquete institucional para bodegas y restaurantes)', ' (presentación institucional, edición limitada)'] as const

interface Combo {
  template: ProductTemplate
  presentation: Presentation
  brand: string | null
  variant: (typeof VARIANTS)[number]
}

/** Todas las combinaciones únicas plantilla × presentación × marca × variante, ordenadas de forma determinista. */
function buildCombos(random: () => number): Combo[] {
  const combos: Combo[] = []
  for (const variant of VARIANTS) {
    const round: Combo[] = []
    for (const template of TEMPLATES) {
      for (const presentation of template.presentations) {
        if (UNBRANDED.test(presentation.label)) {
          if (variant === '') round.push({ template, presentation, brand: null, variant })
          continue
        }
        for (const brand of SYNTHETIC_BRANDS) round.push({ template, presentation, brand, variant })
      }
    }
    // Barajado Fisher–Yates determinista: cada ronda mezcla categorías y marcas.
    for (let i = round.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      const swap = round[i] as Combo
      round[i] = round[j] as Combo
      round[j] = swap
    }
    combos.push(...round)
  }
  return combos
}

export const MAX_UNIQUE_PRODUCTS = buildCombos(() => 0.5).length

const money = (value: number) => value.toFixed(2)
const slug = (label: string) => label.replace(/[^A-Za-z0-9]+/g, '').toUpperCase().slice(0, 12)

export interface GenerateOptions {
  count: number
  startId: number
  seed: number
  /** Día de referencia para las fechas de actualización (por defecto, hoy). */
  today?: Date
}

export interface GeneratedProducts {
  products: Product[]
  stock: StockRecord[]
}

/** Genera productos y existencias sintéticos coherentes (categoría, unidad, precio y cantidad acordes). */
export function generateProducts({ count, startId, seed, today = new Date() }: GenerateOptions): GeneratedProducts {
  if (count > MAX_UNIQUE_PRODUCTS) throw new Error(`Se solicitaron ${count} productos; el generador solo produce ${MAX_UNIQUE_PRODUCTS} combinaciones únicas.`)
  const random = createRandom(seed)
  const units = new Map<string, UnitOfMeasure>(SYNTHETIC_UNITS.map((unit) => [unit.code, unit]))
  const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))
  const combos = buildCombos(random).slice(0, count)

  const products: Product[] = []
  const stock: StockRecord[] = []
  combos.forEach(({ template, presentation, brand, variant }, index) => {
    const id = startId + index
    const unit = units.get(presentation.unitCode) as UnitOfMeasure
    const suffix = random() < 0.08 ? (LONG_SUFFIXES[between(0, LONG_SUFFIXES.length - 1)] as string) : ''
    const name = [template.stem, brand, presentation.label].filter(Boolean).join(' ') + variant + suffix

    const [minPrice, maxPrice] = presentation.price
    const sale = Math.round((minPrice + random() * (maxPrice - minPrice)) * 100) / 100
    const salePrice = random() < 0.05 ? null : money(sale)
    const purchasePrice = random() < 0.1 ? null : money(Math.round(sale * (0.6 + random() * 0.25) * 100) / 100)

    products.push({
      id,
      code: `DEMO-${template.codePrefix}-${slug(presentation.label)}-${String(id).padStart(4, '0')}`,
      name,
      brand,
      categoryId: template.categoryId,
      unitCode: unit.code,
      supplierId: random() < 0.08 ? null : (SYNTHETIC_SUPPLIERS[between(0, SYNTHETIC_SUPPLIERS.length - 1)]?.id ?? null),
      purchasePrice,
      salePrice,
    })

    const reference = between(10, 200)
    const roll = random()
    let quantity: string | null
    if (roll < 0.07) quantity = null
    else if (roll < 0.17) quantity = '0'
    else {
      const raw = roll < 0.4 ? random() * reference * 0.95 : reference * (1 + random() * 3)
      quantity = unit.allowsFractions ? (Math.round(raw * 10) / 10).toFixed(1) : String(Math.round(raw))
    }
    const updated = new Date(today.getFullYear(), today.getMonth(), today.getDate() - between(0, 75))
    stock.push({ productId: id, quantity, referenceLevel: String(reference), updatedAt: toWallDateTime(updated) })
  })
  return { products, stock }
}
