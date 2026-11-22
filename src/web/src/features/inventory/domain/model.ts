import type { DecimalString } from '@/shared/lib/decimal'

/**
 * Modelo de dominio de inventario.
 *
 * Respaldo documental: la tesis documenta el registro/consulta de inventario (existencias), productos, proveedores y
 * pedidos como funciones PROPUESTAS (F-02, F-03). NO define campos, categorías, unidades, precios ni reglas
 * (PR-04, PR-05, PR-09, PR-19 abiertos). Todo lo que sigue es una PROPUESTA de trabajo (marcada en `PROVISIONAL`
 * dentro de `provisional.ts`), no un requisito aprobado.
 *
 * Producto (catálogo) y existencia (registro de stock) son conceptos relacionados pero separados: el stock cambia
 * con movimientos que la documentación aún no define (PR-19); el producto no.
 */

export type ProductId = number
export type CategoryId = number
export type SupplierId = number

/** Unidad de medida. `allowsFractions` es una propiedad provisional de la unidad, no una regla aprobada. */
export interface UnitOfMeasure {
  code: string
  name: string
  symbol: string
  allowsFractions: boolean
}

export interface Category {
  id: CategoryId
  name: string
}

export interface Supplier {
  id: SupplierId
  name: string
}

/** Identidad y datos de catálogo del producto. Los campos opcionales pueden faltar sin invalidar el registro. */
export interface Product {
  id: ProductId
  /** Código interno. Los de demostración empiezan por «DEMO-». */
  code: string
  name: string
  brand: string | null
  categoryId: CategoryId | null
  unitCode: string
  supplierId: SupplierId | null
  /** DECIMAL(18,2) como cadena. No se asume cuál de los dos precios usará el negocio. */
  purchasePrice: DecimalString | null
  salePrice: DecimalString | null
}

/** Existencia de un producto. `quantity === null` significa «sin dato» (distinto de "0"). */
export interface StockRecord {
  productId: ProductId
  /** DECIMAL(18,3) como cadena. Puede ser negativa en los datos recibidos; su tratamiento está pendiente (PR-19). */
  quantity: DecimalString | null
  /** Nivel de referencia DEMOSTRATIVO usado para «Stock bajo». No es stock mínimo ni punto de reorden (PR-04). */
  referenceLevel: DecimalString
  /** DATETIME2 sin zona horaria (YYYY-MM-DDTHH:mm:ss). */
  updatedAt: string
}

/** Instantánea normalizada del inventario (forma que devolvería una fuente de datos). */
export interface InventoryCatalog {
  units: readonly UnitOfMeasure[]
  categories: readonly Category[]
  suppliers: readonly Supplier[]
  products: readonly Product[]
  stock: readonly StockRecord[]
}

/** Vista de lectura que consume la interfaz: producto + categoría + unidad + proveedor + existencia ya unidos. */
export interface InventoryItem {
  id: ProductId
  code: string
  name: string
  brand: string | null
  category: Category | null
  unit: UnitOfMeasure
  supplier: Supplier | null
  stock: DecimalString | null
  referenceLevel: DecimalString | null
  purchasePrice: DecimalString | null
  salePrice: DecimalString | null
  /** `null` si el producto no tiene registro de existencia. */
  updatedAt: string | null
}
