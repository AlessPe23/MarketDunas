import { isDecimalString } from '@/shared/lib/decimal'
import type { Category, InventoryCatalog, Product, StockRecord, Supplier, UnitOfMeasure } from '../domain/model'

/**
 * Frontera de datos: convierte una carga sin tipar (JSON de una API o de los datos sintéticos) en el modelo de dominio.
 * Hoy el contrato de red NO existe; esta forma (campos en camelCase y decimales como cadenas) es la propuesta de
 * trabajo. Cuando exista el backend, solo debería cambiar este módulo (renombrar campos, adaptar identificadores).
 *
 * Solo comprueba la ESTRUCTURA y los tipos. La coherencia entre entidades se revisa en `validateCatalog`.
 */

export interface DtoIssue {
  path: string
  message: string
}

export type ParseResult = { ok: true; catalog: InventoryCatalog } | { ok: false; issues: DtoIssue[] }

type Raw = Record<string, unknown>
const isRecord = (value: unknown): value is Raw => typeof value === 'object' && value !== null && !Array.isArray(value)

class Reader {
  readonly issues: DtoIssue[] = []

  string(source: Raw, key: string, path: string): string {
    const value = source[key]
    if (typeof value === 'string') return value
    this.issues.push({ path: `${path}.${key}`, message: 'Se esperaba texto.' })
    return ''
  }

  nullableString(source: Raw, key: string, path: string): string | null {
    const value = source[key]
    if (value === null || value === undefined) return null
    if (typeof value === 'string') return value
    this.issues.push({ path: `${path}.${key}`, message: 'Se esperaba texto o nulo.' })
    return null
  }

  integer(source: Raw, key: string, path: string): number {
    const value = source[key]
    if (typeof value === 'number' && Number.isSafeInteger(value)) return value
    this.issues.push({ path: `${path}.${key}`, message: 'Se esperaba un entero.' })
    return 0
  }

  nullableInteger(source: Raw, key: string, path: string): number | null {
    const value = source[key]
    if (value === null || value === undefined) return null
    if (typeof value === 'number' && Number.isSafeInteger(value)) return value
    this.issues.push({ path: `${path}.${key}`, message: 'Se esperaba un entero o nulo.' })
    return null
  }

  boolean(source: Raw, key: string, path: string): boolean {
    const value = source[key]
    if (typeof value === 'boolean') return value
    this.issues.push({ path: `${path}.${key}`, message: 'Se esperaba verdadero o falso.' })
    return false
  }

  decimal(source: Raw, key: string, path: string): string {
    const value = source[key]
    if (isDecimalString(value)) return value
    this.issues.push({ path: `${path}.${key}`, message: 'Se esperaba un decimal como texto (p. ej. "12.50"); los números JSON no se admiten por pérdida de precisión.' })
    return '0'
  }

  nullableDecimal(source: Raw, key: string, path: string): string | null {
    const value = source[key]
    if (value === null || value === undefined) return null
    if (isDecimalString(value)) return value
    this.issues.push({ path: `${path}.${key}`, message: 'Se esperaba un decimal como texto o nulo.' })
    return null
  }

  list<T>(source: Raw, key: string, build: (item: Raw, path: string) => T): T[] {
    const value = source[key]
    if (!Array.isArray(value)) {
      this.issues.push({ path: key, message: 'Se esperaba una lista.' })
      return []
    }
    const items: unknown[] = value
    return items.flatMap((item, index) => {
      const path = `${key}[${index}]`
      if (!isRecord(item)) {
        this.issues.push({ path, message: 'Se esperaba un objeto.' })
        return []
      }
      return [build(item, path)]
    })
  }
}

export function parseInventoryCatalog(input: unknown): ParseResult {
  if (!isRecord(input)) return { ok: false, issues: [{ path: '', message: 'La carga no es un objeto.' }] }
  const read = new Reader()

  const units = read.list<UnitOfMeasure>(input, 'units', (item, path) => ({
    code: read.string(item, 'code', path),
    name: read.string(item, 'name', path),
    symbol: read.string(item, 'symbol', path),
    allowsFractions: read.boolean(item, 'allowsFractions', path),
  }))
  const categories = read.list<Category>(input, 'categories', (item, path) => ({ id: read.integer(item, 'id', path), name: read.string(item, 'name', path) }))
  const suppliers = read.list<Supplier>(input, 'suppliers', (item, path) => ({ id: read.integer(item, 'id', path), name: read.string(item, 'name', path) }))
  const products = read.list<Product>(input, 'products', (item, path) => ({
    id: read.integer(item, 'id', path),
    code: read.string(item, 'code', path),
    name: read.string(item, 'name', path),
    brand: read.nullableString(item, 'brand', path),
    categoryId: read.nullableInteger(item, 'categoryId', path),
    unitCode: read.string(item, 'unitCode', path),
    supplierId: read.nullableInteger(item, 'supplierId', path),
    purchasePrice: read.nullableDecimal(item, 'purchasePrice', path),
    salePrice: read.nullableDecimal(item, 'salePrice', path),
  }))
  const stock = read.list<StockRecord>(input, 'stock', (item, path) => ({
    productId: read.integer(item, 'productId', path),
    quantity: read.nullableDecimal(item, 'quantity', path),
    referenceLevel: read.decimal(item, 'referenceLevel', path),
    updatedAt: read.string(item, 'updatedAt', path),
  }))

  return read.issues.length > 0 ? { ok: false, issues: read.issues } : { ok: true, catalog: { units, categories, suppliers, products, stock } }
}
