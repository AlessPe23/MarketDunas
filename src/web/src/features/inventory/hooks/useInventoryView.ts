import { useMemo, useState } from 'react'
import { EMPTY_FILTERS, countByCategory, countByState, filterBase, filterItems, hasActiveFilters, paginate, sortItems } from '../domain/query'
import type { InventoryFilters } from '../domain/query'
import type { CategoryId, InventoryItem } from '../domain/model'
import type { SortDirection, SortKey, StockState } from '../domain/types'

export const PAGE_SIZES = [10, 25, 50] as const

/**
 * Estado de vista del inventario: filtros, orden, paginación y selección.
 * La selección persiste al cambiar filtros o páginas y puede incluir productos que ya no están visibles.
 */
export function useInventoryView(items: readonly InventoryItem[]) {
  const [filters, setFilters] = useState<InventoryFilters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0])
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set())

  const base = useMemo(() => filterBase(items, filters), [items, filters])
  const counts = useMemo(() => countByState(base), [base])
  const categories = useMemo(() => countByCategory(items), [items])
  const filtered = useMemo(() => filterItems(items, filters), [items, filters])
  const sorted = useMemo(() => sortItems(filtered, sort.key, sort.direction), [filtered, sort])
  const slice = useMemo(() => paginate(sorted, page, pageSize), [sorted, page, pageSize])

  const visibleIds = useMemo(() => new Set(filtered.map((item) => item.id)), [filtered])
  const outsideFilter = useMemo(() => [...selected].filter((id) => !visibleIds.has(id)).length, [selected, visibleIds])
  const pageIds = slice.items.map((item) => item.id)
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length

  const changeFilters = (next: Partial<InventoryFilters>) => {
    setFilters((current) => ({ ...current, ...next }))
    setPage(1)
  }

  return {
    filters,
    filtersActive: hasActiveFilters(filters),
    counts,
    total: items.length,
    categories,
    results: sorted,
    slice,
    sort,
    pageSize,
    selection: {
      ids: selected,
      count: selected.size,
      outsideFilter,
      pageState: selectedOnPage === 0 ? ('none' as const) : selectedOnPage === pageIds.length ? ('all' as const) : ('some' as const),
      isSelected: (id: number) => selected.has(id),
    },
    actions: {
      setQuery: (query: string) => {
        changeFilters({ query })
      },
      setSupplier: (supplier: string) => {
        changeFilters({ supplier })
      },
      setCategory: (categoryId: CategoryId | null) => {
        changeFilters({ categoryId })
      },
      toggleState: (state: StockState) => {
        const next = new Set(filters.states)
        if (next.has(state)) next.delete(state)
        else next.add(state)
        changeFilters({ states: next })
      },
      clearFilters: () => {
        setFilters(EMPTY_FILTERS)
        setPage(1)
      },
      toggleSort: (key: SortKey) => {
        setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : key === 'updatedAt' && current.key !== key ? 'desc' : 'asc' }))
        setPage(1)
      },
      setPage,
      setPageSize: (size: number) => {
        setPageSize(size)
        setPage(1)
      },
      toggleRow: (id: number) => {
        setSelected((current) => {
          const next = new Set(current)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      },
      togglePage: () => {
        setSelected((current) => {
          const next = new Set(current)
          const everySelected = pageIds.length > 0 && pageIds.every((id) => next.has(id))
          for (const id of pageIds) {
            if (everySelected) next.delete(id)
            else next.add(id)
          }
          return next
        })
      },
      selectAllResults: () => {
        setSelected((current) => new Set([...current, ...filtered.map((item) => item.id)]))
      },
      clearSelection: () => {
        setSelected(new Set())
      },
      clearSelectionOutsideFilter: () => {
        setSelected((current) => new Set([...current].filter((id) => visibleIds.has(id))))
      },
    },
  }
}

export type InventoryView = ReturnType<typeof useInventoryView>
