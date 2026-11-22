import { describe, expect, it } from 'vitest'
import { InventoryDataError, loadFromPayload } from './repository'
import { parseInventoryCatalog } from './dto'

const valid = {
  units: [{ code: 'und', name: 'Unidad', symbol: 'und', allowsFractions: false }],
  categories: [{ id: 1, name: 'Abarrotes' }],
  suppliers: [{ id: 1, name: 'Proveedor Demo' }],
  products: [{ id: 1, code: 'DEMO-1', name: 'Producto', brand: null, categoryId: 1, unitCode: 'und', supplierId: null, purchasePrice: null, salePrice: '2.50' }],
  stock: [{ productId: 1, quantity: '5', referenceLevel: '10', updatedAt: '2026-01-01T00:00:00' }],
}

describe('parseInventoryCatalog', () => {
  it('acepta una carga válida', () => {
    const result = parseInventoryCatalog(valid)
    expect(result.ok).toBe(true)
  })

  it('rechaza cargas que no son objetos o no tienen listas', () => {
    expect(parseInventoryCatalog(null).ok).toBe(false)
    expect(parseInventoryCatalog([]).ok).toBe(false)
    const result = parseInventoryCatalog({})
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues.map((issue) => issue.path)).toEqual(['units', 'categories', 'suppliers', 'products', 'stock'])
  })

  it('rechaza números JSON en campos decimales (pérdida de precisión) y los reporta con su ruta', () => {
    const result = parseInventoryCatalog({ ...valid, stock: [{ productId: 1, quantity: 5.5, referenceLevel: '10', updatedAt: '2026-01-01T00:00:00' }] })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues).toEqual([expect.objectContaining({ path: 'stock[0].quantity' })])
  })

  it('rechaza tipos incorrectos en identificadores y textos', () => {
    const result = parseInventoryCatalog({ ...valid, products: [{ ...valid.products[0], id: '1', name: 12, categoryId: 1.5 }] })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues.map((issue) => issue.path)).toEqual(['products[0].id', 'products[0].name', 'products[0].categoryId'])
  })

  it('trata los campos opcionales ausentes como nulos', () => {
    const partial = { id: 1, code: 'DEMO-1', name: 'Producto', categoryId: 1, unitCode: 'und', purchasePrice: null, salePrice: '2.50' }
    const result = parseInventoryCatalog({ ...valid, products: [partial] })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.catalog.products[0]).toMatchObject({ brand: null, supplierId: null })
  })
})

describe('loadFromPayload', () => {
  it('lanza InventoryDataError si la estructura es inválida', () => {
    expect(() => loadFromPayload('texto')).toThrow(InventoryDataError)
  })

  it('lanza InventoryDataError si hay errores de coherencia, con el detalle', () => {
    const broken = { ...valid, products: [{ ...valid.products[0], unitCode: 'zz' }] }
    try {
      loadFromPayload(broken)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(InventoryDataError)
      expect((error as InventoryDataError).issues).toEqual([expect.objectContaining({ code: 'missing-unit' })])
    }
  })

  it('devuelve los avisos (stock negativo) sin bloquear la carga', () => {
    const negative = { ...valid, stock: [{ ...valid.stock[0], quantity: '-2' }] }
    const load = loadFromPayload(negative)
    expect(load.items).toHaveLength(1)
    expect(load.warnings.map((warning) => warning.code)).toEqual(['negative-stock'])
  })
})
