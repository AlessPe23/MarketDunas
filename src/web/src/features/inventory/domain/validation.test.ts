import { describe, expect, it } from 'vitest'
import { assembleInventory } from './assemble'
import type { InventoryCatalog } from './model'
import { isValidWallDateTime, validateCatalog } from './validation'

const base = (): InventoryCatalog => ({
  units: [{ code: 'und', name: 'Unidad', symbol: 'und', allowsFractions: false }],
  categories: [{ id: 1, name: 'Abarrotes' }],
  suppliers: [{ id: 1, name: 'Proveedor Demo' }],
  products: [{ id: 1, code: 'DEMO-1', name: 'Producto', brand: null, categoryId: 1, unitCode: 'und', supplierId: 1, purchasePrice: '1.00', salePrice: '2.00' }],
  stock: [{ productId: 1, quantity: '5', referenceLevel: '10', updatedAt: '2026-01-01T00:00:00' }],
})

const codes = (catalog: InventoryCatalog) => validateCatalog(catalog).map((issue) => `${issue.severity}:${issue.code}`)

describe('validateCatalog', () => {
  it('un catálogo coherente no genera avisos', () => {
    expect(validateCatalog(base())).toEqual([])
  })

  it('detecta duplicados, referencias rotas y existencias huérfanas como errores', () => {
    const catalog = base()
    const dup = { ...catalog.products[0]!, id: 1 }
    const broken = { ...catalog, products: [...catalog.products, dup, { ...dup, id: 2, code: 'demo-1', unitCode: 'xx', categoryId: 99, supplierId: 99 }], stock: [...catalog.stock, { productId: 77, quantity: '1', referenceLevel: '1', updatedAt: '2026-01-01T00:00:00' }] }
    expect(codes(broken)).toEqual(expect.arrayContaining(['error:duplicate-id', 'error:duplicate-code', 'error:missing-unit', 'error:missing-category', 'error:missing-supplier', 'error:orphan-stock']))
  })

  it('detecta decimales y fechas inválidos', () => {
    const catalog = base()
    const bad = { ...catalog, stock: [{ productId: 1, quantity: '1e3', referenceLevel: 'abc', updatedAt: '2026-02-30T00:00:00' }] }
    expect(codes(bad)).toEqual(expect.arrayContaining(['error:invalid-decimal', 'error:invalid-date']))
  })

  it('el stock negativo es un AVISO (pendiente PR-19), no un error', () => {
    const catalog = base()
    const negative = { ...catalog, stock: [{ ...catalog.stock[0]!, quantity: '-3' }] }
    expect(codes(negative)).toEqual(['warning:negative-stock'])
  })

  it('las reglas provisionales solo generan avisos (límites D7, fracciones en unidades enteras, escala)', () => {
    const catalog = base()
    const provisional: InventoryCatalog = {
      ...catalog,
      products: [{ ...catalog.products[0]!, name: 'x'.repeat(151), code: 'C'.repeat(31), salePrice: '1.005' }],
      stock: [{ ...catalog.stock[0]!, quantity: '2.5' }],
    }
    expect(codes(provisional).sort()).toEqual(['warning:code-too-long', 'warning:fraction-on-integer-unit', 'warning:name-too-long', 'warning:scale-exceeded'])
  })

  it('no exige existencia para cada producto ni categoría o proveedor', () => {
    const catalog = base()
    const sparse = { ...catalog, products: [{ ...catalog.products[0]!, categoryId: null, supplierId: null, purchasePrice: null, salePrice: null }], stock: [] }
    expect(validateCatalog(sparse)).toEqual([])
    const [item] = assembleInventory(sparse)
    expect(item).toMatchObject({ category: null, supplier: null, stock: null, referenceLevel: null, updatedAt: null, salePrice: null })
  })
})

describe('isValidWallDateTime', () => {
  it.each([
    ['1970-01-01T00:00:00', true],
    ['1989-12-31T23:59:59', true],
    ['2026-02-29T00:00:00', false],
    ['2028-02-29T12:00:00', true],
    ['2026-11-20T24:00:00', false],
    ['2026-11-20', false],
    ['2026-11-20T00:00:00Z', false],
  ])('%s → %s', (value, expected) => {
    expect(isValidWallDateTime(value)).toBe(expected)
  })
})

describe('assembleInventory', () => {
  it('une producto, categoría, unidad, proveedor y existencia', () => {
    const [item] = assembleInventory(base())
    expect(item).toMatchObject({ id: 1, code: 'DEMO-1', category: { name: 'Abarrotes' }, unit: { symbol: 'und' }, supplier: { name: 'Proveedor Demo' }, stock: '5', referenceLevel: '10', salePrice: '2.00' })
  })

  it('descarta productos con unidad inexistente y deja en null categorías/proveedores rotos', () => {
    const catalog = base()
    const items = assembleInventory({ ...catalog, products: [{ ...catalog.products[0]!, categoryId: 9, supplierId: 9 }, { ...catalog.products[0]!, id: 2, unitCode: 'zz' }] })
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ category: null, supplier: null })
  })
})
