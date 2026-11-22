import { compareDecimal, toScaled } from '@/shared/lib/decimal'
import type { InventoryItem } from './model'
import type { StockState } from './types'

/** Texto de la advertencia para stock negativo (dato inconsistente, clasificación pendiente de PR-19). */
export const INCONSISTENT_STOCK_LABEL = 'Dato inconsistente · Clasificación pendiente'

/** Escala de las cantidades (DECIMAL(18,3), propuesta no aprobada). */
export const QUANTITY_SCALE = 3

/**
 * Clasifica el stock en uno de los CUATRO estados demostrativos. Función pura.
 *  - sin dato (null) → `unknown`
 *  - 0 → `out`
 *  - menor que el nivel de referencia demostrativo → `low`
 *  - en otro caso → `in-stock`
 *  - NEGATIVO → `null`: no es un estado; se muestra con una advertencia independiente. Su tratamiento queda
 *    pendiente de la decisión PR-19 y NO debe asumirse aquí.
 * El nivel de referencia es ficticio (PR-04 abierto): sin nivel, un stock positivo se considera «en stock».
 */
export function classifyStock(item: Pick<InventoryItem, 'stock' | 'referenceLevel'>): StockState | null {
  const stock = toScaled(item.stock, QUANTITY_SCALE)
  if (stock === null) return 'unknown'
  if (stock < 0n) return null
  if (stock === 0n) return 'out'
  return item.referenceLevel !== null && compareDecimal(item.stock, item.referenceLevel, QUANTITY_SCALE) < 0 ? 'low' : 'in-stock'
}
