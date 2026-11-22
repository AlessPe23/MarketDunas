/** Los cuatro estados demostrativos. El stock negativo NO es un quinto estado (ver `classifyStock`). */
export type StockState = 'in-stock' | 'low' | 'out' | 'unknown'

export const STOCK_STATE_ORDER: readonly StockState[] = ['in-stock', 'low', 'out', 'unknown']

export const STOCK_STATE_LABEL: Record<StockState, string> = {
  'in-stock': 'En stock',
  low: 'Stock bajo',
  out: 'Agotado',
  unknown: 'Sin dato',
}

export type SortKey = 'name' | 'stock' | 'state' | 'price' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'
