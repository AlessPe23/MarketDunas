import { describe, expect, it } from 'vitest'
import { assembleInventory } from '../../domain/assemble'
import { classifyStock } from '../../domain/stock'
import { validateCatalog } from '../../domain/validation'
import { decimalPlaces, toScaled } from '@/shared/lib/decimal'
import { createSyntheticRepository, loadFromPayload } from '../repository'
import { DATASET_IDS, buildCatalog } from './datasets'
import { MAX_UNIQUE_PRODUCTS, generateProducts } from './generate'
import { SYNTHETIC_CATEGORIES, SYNTHETIC_UNITS } from './reference'

const TODAY = new Date(2026, 10, 21)

describe('integridad estructural de los datos sintéticos', () => {
  it.each(DATASET_IDS)('«%s» no tiene errores de validación', (id) => {
    const errors = validateCatalog(buildCatalog(id, TODAY)).filter((issue) => issue.severity === 'error')
    expect(errors).toEqual([])
  })

  it.each(['demo', 'large'] as const)('«%s» no tiene siquiera avisos (no usa casos extremos)', (id) => {
    expect(validateCatalog(buildCatalog(id, TODAY))).toEqual([])
  })

  it('«peor caso» solo produce los avisos esperados y documentados', () => {
    const warnings = validateCatalog(buildCatalog('worst-case', TODAY)).map((issue) => `${issue.code}:${issue.id}`)
    expect(warnings.sort()).toEqual(['fraction-on-integer-unit:9017', 'negative-stock:9003', 'negative-stock:9015'])
  })

  it('los identificadores y códigos son únicos y los nombres no se repiten (demo y 1 200)', () => {
    for (const id of ['demo', 'large'] as const) {
      const { products } = buildCatalog(id, TODAY)
      expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
      expect(new Set(products.map((p) => p.code)).size).toBe(products.length)
      expect(new Set(products.map((p) => p.name.replace(/ \(.*\)$/, ''))).size).toBe(products.length)
    }
  })

  it('los códigos son de demostración y respetan el límite propuesto', () => {
    const { products } = buildCatalog('large', TODAY)
    expect(products.every((p) => p.code.startsWith('DEMO-') && p.code.length <= 30)).toBe(true)
  })

  it('el generador soporta al menos 1 200 combinaciones únicas y falla si se piden más', () => {
    expect(MAX_UNIQUE_PRODUCTS).toBeGreaterThanOrEqual(1200)
    expect(() => generateProducts({ count: MAX_UNIQUE_PRODUCTS + 1, startId: 1, seed: 1, today: TODAY })).toThrow()
  })
})

describe('tamaño y variedad', () => {
  it('tiene los tamaños anunciados', () => {
    expect(buildCatalog('demo', TODAY).products).toHaveLength(186)
    expect(buildCatalog('large', TODAY).products).toHaveLength(1200)
    expect(buildCatalog('empty', TODAY).products).toHaveLength(0)
    expect(buildCatalog('worst-case', TODAY).products).toHaveLength(19 + 24)
  })

  it('cubre todas las categorías y varias unidades en el conjunto de demostración', () => {
    const items = assembleInventory(buildCatalog('demo', TODAY))
    expect(new Set(items.map((item) => item.category?.id)).size).toBe(SYNTHETIC_CATEGORIES.length)
    expect(new Set(items.map((item) => item.unit.code)).size).toBeGreaterThanOrEqual(4)
  })

  it('incluye stock cero, sin dato, bajo, normal y datos opcionales ausentes', () => {
    const items = assembleInventory(buildCatalog('demo', TODAY))
    const states = new Set(items.map((item) => classifyStock(item)))
    expect(states).toEqual(new Set(['in-stock', 'low', 'out', 'unknown']))
    expect(items.some((item) => item.supplier === null)).toBe(true)
    expect(items.some((item) => item.salePrice === null)).toBe(true)
    expect(items.some((item) => item.purchasePrice === null)).toBe(true)
    expect(items.some((item) => item.brand === null)).toBe(true)
  })

  it('el demo no contiene stock negativo; el peor caso sí', () => {
    const negatives = (id: 'demo' | 'worst-case') => assembleInventory(buildCatalog(id, TODAY)).filter((item) => (toScaled(item.stock, 3) ?? 0n) < 0n)
    expect(negatives('demo')).toHaveLength(0)
    expect(negatives('worst-case').map((item) => item.id)).toEqual([9003, 9015])
  })

  it('las unidades fraccionables tienen cantidades con decimales y las enteras no (datos generados)', () => {
    const items = assembleInventory(buildCatalog('large', TODAY))
    const fractional = items.filter((item) => item.unit.allowsFractions && item.stock !== null)
    const whole = items.filter((item) => !item.unit.allowsFractions && item.stock !== null)
    expect(fractional.length).toBeGreaterThan(0)
    expect(fractional.some((item) => decimalPlaces(item.stock ?? '0') > 0)).toBe(true)
    expect(whole.every((item) => decimalPlaces(item.stock ?? '0') === 0)).toBe(true)
  })

  it('los precios cumplen la escala propuesta y el precio de compra no supera al de venta', () => {
    const items = assembleInventory(buildCatalog('large', TODAY))
    for (const item of items) {
      for (const price of [item.salePrice, item.purchasePrice]) if (price !== null) expect(decimalPlaces(price)).toBeLessThanOrEqual(2)
      if (item.salePrice !== null && item.purchasePrice !== null) expect(toScaled(item.purchasePrice, 2) ?? 0n).toBeLessThanOrEqual(toScaled(item.salePrice, 2) ?? 0n)
    }
  })

  it('las unidades del catálogo son únicas y todas las usadas existen', () => {
    expect(new Set(SYNTHETIC_UNITS.map((unit) => unit.code)).size).toBe(SYNTHETIC_UNITS.length)
  })
})

describe('casos extremos (peor caso)', () => {
  const items = assembleInventory(buildCatalog('worst-case', TODAY))
  const byId = (id: number) => items.find((item) => item.id === id)

  it('conserva los límites DECIMAL(18,3) y DECIMAL(18,2) como cadenas exactas', () => {
    expect(byId(9014)).toMatchObject({ stock: '999999999999999.999', salePrice: '9999999999999999.99' })
    expect(byId(9018)).toMatchObject({ stock: '1284000.500', salePrice: '12345678.90' })
    expect(byId(9015)?.stock).toBe('-999999999999999.999')
  })

  it('el nombre más largo mide exactamente 150 caracteres (límite propuesto)', () => {
    expect(byId(9001)?.name).toHaveLength(150)
  })

  it('incluye fechas límite sin desplazarlas', () => {
    expect(byId(9012)?.updatedAt).toBe('1970-01-01T00:00:00')
    expect(byId(9013)?.updatedAt).toBe('1989-12-31T23:59:59')
  })

  it('incluye un producto sin existencia, sin categoría, sin proveedor y sin precios', () => {
    expect(byId(9006)).toMatchObject({ stock: null, category: null, supplier: null, salePrice: null, purchasePrice: null })
  })

  it('incluye un producto sin registro de existencia: sin stock, nivel ni fecha', () => {
    expect(byId(9019)).toMatchObject({ stock: null, referenceLevel: null, updatedAt: null })
  })

  it('el stock en el nivel de referencia es «en stock» y cero es «agotado»', () => {
    expect(classifyStock(byId(9016) ?? { stock: null, referenceLevel: null })).toBe('in-stock')
    expect(classifyStock(byId(9007) ?? { stock: null, referenceLevel: null })).toBe('out')
  })
})

describe('repositorio sintético', () => {
  it('carga y ensambla el conjunto de demostración', async () => {
    const load = await createSyntheticRepository('demo', TODAY).load()
    expect(load.items).toHaveLength(186)
    expect(load.warnings).toEqual([])
  })

  it('los datos generados superan la frontera de validación igual que lo haría una API', () => {
    for (const id of DATASET_IDS) expect(() => loadFromPayload(JSON.parse(JSON.stringify(buildCatalog(id, TODAY))))).not.toThrow()
  })

  it('es determinista para un mismo día de referencia', () => {
    expect(buildCatalog('demo', TODAY)).toEqual(buildCatalog('demo', TODAY))
  })
})
