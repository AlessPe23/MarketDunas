import type { InventoryCatalog, InventoryItem } from './model'

/**
 * Une el catálogo normalizado en elementos de lectura. Función pura.
 * Las referencias que no se resuelven (categoría o proveedor inexistentes) quedan en `null`; la unidad inexistente
 * descarta el producto porque no puede mostrarse con coherencia. `validateCatalog` informa de ambos casos.
 */
export function assembleInventory(catalog: InventoryCatalog): InventoryItem[] {
  const units = new Map(catalog.units.map((unit) => [unit.code, unit]))
  const categories = new Map(catalog.categories.map((category) => [category.id, category]))
  const suppliers = new Map(catalog.suppliers.map((supplier) => [supplier.id, supplier]))
  const stock = new Map(catalog.stock.map((record) => [record.productId, record]))

  const items: InventoryItem[] = []
  for (const product of catalog.products) {
    const unit = units.get(product.unitCode)
    if (!unit) continue
    const record = stock.get(product.id)
    items.push({
      id: product.id,
      code: product.code,
      name: product.name,
      brand: product.brand,
      category: product.categoryId === null ? null : (categories.get(product.categoryId) ?? null),
      unit,
      supplier: product.supplierId === null ? null : (suppliers.get(product.supplierId) ?? null),
      stock: record?.quantity ?? null,
      referenceLevel: record?.referenceLevel ?? null,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      updatedAt: record?.updatedAt ?? null,
    })
  }
  return items
}
