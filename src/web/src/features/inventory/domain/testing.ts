import type { InventoryItem, UnitOfMeasure } from './model'

/** Fábricas mínimas para pruebas de dominio. No se importan desde código de producción. */
export const UNIT_UND: UnitOfMeasure = { code: 'und', name: 'Unidad', symbol: 'und', allowsFractions: false }
export const UNIT_KG: UnitOfMeasure = { code: 'kg', name: 'Kilogramo', symbol: 'kg', allowsFractions: true }

export function makeItem(overrides: Partial<InventoryItem> & { id: number }): InventoryItem {
  return {
    code: `DEMO-${overrides.id}`,
    name: `Producto ${overrides.id}`,
    brand: null,
    category: { id: 1, name: 'Abarrotes' },
    unit: UNIT_UND,
    supplier: { id: 1, name: 'Proveedor Demo' },
    stock: '20',
    referenceLevel: '10',
    purchasePrice: '1.00',
    salePrice: '2.00',
    updatedAt: '2026-01-01T00:00:00',
    ...overrides,
  }
}
