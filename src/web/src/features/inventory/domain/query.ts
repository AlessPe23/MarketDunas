import { compareDecimal } from '@/shared/lib/decimal'
import { collapseSpaces, normalizeText } from '@/shared/lib/text'
import type { CategoryId, InventoryItem } from './model'
import { QUANTITY_SCALE, classifyStock } from './stock'
import { STOCK_STATE_ORDER } from './types'
import type { SortDirection, SortKey, StockState } from './types'

/** Escala de los precios (DECIMAL(18,2), propuesta no aprobada). */
const PRICE_SCALE = 2

export interface InventoryFilters {
  query: string
  states: ReadonlySet<StockState>
  /** Nombre exacto del proveedor; vacío = todos. */
  supplier: string
  /** Categoría; `null` = todas. */
  categoryId: CategoryId | null
}

export const EMPTY_FILTERS: InventoryFilters = { query: '', states: new Set(), supplier: '', categoryId: null }

export function hasActiveFilters(filters: InventoryFilters): boolean {
  return normalizeText(filters.query) !== '' || filters.states.size > 0 || filters.supplier !== '' || filters.categoryId !== null
}

/** Búsqueda por nombre, código o proveedor: recorta y colapsa espacios; una consulta solo con espacios equivale a vacía. */
export function matchesSearch(item: InventoryItem, query: string): boolean {
  const normalized = normalizeText(query)
  if (!normalized) return true
  return [item.name, item.code, item.supplier?.name].some((field) => normalizeText(field).includes(normalized))
}

/** Aplica búsqueda + proveedor + categoría (base de los conteos del indicador de estados). */
export function filterBase(items: readonly InventoryItem[], filters: InventoryFilters): InventoryItem[] {
  return items.filter(
    (item) =>
      (!filters.supplier || item.supplier?.name === filters.supplier) &&
      (filters.categoryId === null || item.category?.id === filters.categoryId) &&
      matchesSearch(item, filters.query),
  )
}

/** Aplica además el filtro por estado. Un stock negativo (sin estado) nunca coincide con un estado. */
export function filterItems(items: readonly InventoryItem[], filters: InventoryFilters): InventoryItem[] {
  return filterBase(items, filters).filter((item) => {
    if (filters.states.size === 0) return true
    const state = classifyStock(item)
    return state !== null && filters.states.has(state)
  })
}

export type StateCounts = Record<StockState, number> & { inconsistent: number }

/** Conteos de los cuatro estados; los datos inconsistentes se cuentan aparte y NO forman parte de los cuatro. */
export function countByState(items: readonly InventoryItem[]): StateCounts {
  const counts: StateCounts = { 'in-stock': 0, low: 0, out: 0, unknown: 0, inconsistent: 0 }
  for (const item of items) {
    const state = classifyStock(item)
    if (state === null) counts.inconsistent += 1
    else counts[state] += 1
  }
  return counts
}

export interface CategoryCount {
  categoryId: CategoryId | null
  name: string
  count: number
}

/** Productos por categoría (ordenadas por nombre; los productos sin categoría se agrupan al final). */
export function countByCategory(items: readonly InventoryItem[]): CategoryCount[] {
  const groups = new Map<CategoryId | null, CategoryCount>()
  for (const item of items) {
    const key = item.category?.id ?? null
    const group = groups.get(key) ?? { categoryId: key, name: item.category?.name ?? 'Sin categoría', count: 0 }
    group.count += 1
    groups.set(key, group)
  }
  return [...groups.values()].sort((a, b) => (a.categoryId === null ? 1 : b.categoryId === null ? -1 : a.name.localeCompare(b.name, 'es')))
}

const stateRank = (item: InventoryItem): number => {
  const state = classifyStock(item)
  return state === null ? STOCK_STATE_ORDER.length : STOCK_STATE_ORDER.indexOf(state)
}

function compareDates(a: string | null, b: string | null): number {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a < b ? -1 : 1
}

/** Orden estable. Los nulos de stock, precio y fecha quedan siempre al final, sea cual sea la dirección. */
export function sortItems(items: readonly InventoryItem[], key: SortKey, direction: SortDirection): InventoryItem[] {
  const sign = direction === 'asc' ? 1 : -1
  const byName = (a: InventoryItem, b: InventoryItem) => collapseSpaces(a.name).localeCompare(collapseSpaces(b.name), 'es', { sensitivity: 'base' })
  return [...items].sort((a, b) => {
    let result = 0
    switch (key) {
      case 'stock':
        if (a.stock === null || b.stock === null) return compareDecimal(a.stock, b.stock, QUANTITY_SCALE)
        result = compareDecimal(a.stock, b.stock, QUANTITY_SCALE)
        break
      case 'price':
        if (a.salePrice === null || b.salePrice === null) return compareDecimal(a.salePrice, b.salePrice, PRICE_SCALE)
        result = compareDecimal(a.salePrice, b.salePrice, PRICE_SCALE)
        break
      case 'updatedAt':
        if (a.updatedAt === null || b.updatedAt === null) return compareDates(a.updatedAt, b.updatedAt)
        result = compareDates(a.updatedAt, b.updatedAt)
        break
      case 'state':
        result = stateRank(a) - stateRank(b)
        break
      case 'name':
        result = byName(a, b)
        break
    }
    return result * sign || byName(a, b) || a.id - b.id
  })
}

export interface PageSlice<T> {
  items: T[]
  page: number
  pageCount: number
  total: number
  from: number
  to: number
}

/** Pagina y reajusta la página al rango válido. */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): PageSlice<T> {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  const start = (current - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageCount,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  }
}
