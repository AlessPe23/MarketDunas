import { describe, expect, it } from 'vitest'
import { EMPTY_FILTERS, countByCategory, countByState, filterBase, filterItems, hasActiveFilters, matchesSearch, paginate, sortItems } from './query'
import { makeItem } from './testing'

const sugar = makeItem({ id: 1, name: 'Azúcar   rubia\nHuerta Sol', stock: '20', code: 'DEMO-AZU-0001' })
const aji = makeItem({ id: 2, name: 'AJÍ PANCA ÑAÑA', stock: '0', supplier: null, category: { id: 2, name: 'Condimentos' } })
const tea = makeItem({ id: 3, name: 'Té', stock: '-3', supplier: { id: 2, name: 'Comercial Demo Andina' } })
const unknown = makeItem({ id: 4, name: 'Sin dato', stock: null, referenceLevel: null, category: null })
const all = [sugar, aji, tea, unknown]

describe('búsqueda', () => {
  it('ignora tildes, mayúsculas y espacios repetidos o saltos de línea', () => {
    expect(matchesSearch(sugar, '  azucar     rubia ')).toBe(true)
    expect(matchesSearch(aji, 'aji panca')).toBe(true)
    expect(matchesSearch(aji, 'nana')).toBe(true)
    expect(matchesSearch(sugar, 'azucar\n\trubia')).toBe(true)
  })

  it('busca por código y por nombre de proveedor, pero no por categoría', () => {
    expect(matchesSearch(sugar, 'azu-0001')).toBe(true)
    expect(matchesSearch(tea, 'andina')).toBe(true)
    expect(matchesSearch(aji, 'condimentos')).toBe(false)
  })

  it('una consulta solo con espacios equivale a vacía; caracteres especiales no rompen la búsqueda', () => {
    expect(filterItems(all, { ...EMPTY_FILTERS, query: ' \n\t ' })).toHaveLength(4)
    expect(matchesSearch(sugar, '([*\\')).toBe(false)
    expect(matchesSearch(makeItem({ id: 9, name: 'Gaseosa <b>zero</b> & **limón**' }), '<b>zero')).toBe(true)
  })
})

describe('filtros', () => {
  it('el filtro «Agotado» excluye los negativos; los conteos no incluyen inconsistentes', () => {
    const out = filterItems(all, { ...EMPTY_FILTERS, states: new Set(['out']) })
    expect(out.map((item) => item.id)).toEqual([2])
    const counts = countByState(all)
    expect(counts).toEqual({ 'in-stock': 1, low: 0, out: 1, unknown: 1, inconsistent: 1 })
  })

  it('combina búsqueda, proveedor y categoría', () => {
    expect(filterBase(all, { ...EMPTY_FILTERS, supplier: 'Proveedor Demo' }).map((item) => item.id)).toEqual([1, 4])
    expect(filterBase(all, { ...EMPTY_FILTERS, categoryId: 2 }).map((item) => item.id)).toEqual([2])
    expect(filterItems(all, { ...EMPTY_FILTERS, query: 'sin dato', states: new Set(['unknown']) }).map((item) => item.id)).toEqual([4])
  })

  it('detecta filtros activos', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, query: '   ' })).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, categoryId: 1 })).toBe(true)
  })
})

describe('agrupación por categoría', () => {
  it('cuenta por categoría, ordena por nombre y deja «Sin categoría» al final', () => {
    expect(countByCategory(all)).toEqual([
      { categoryId: 1, name: 'Abarrotes', count: 2 },
      { categoryId: 2, name: 'Condimentos', count: 1 },
      { categoryId: null, name: 'Sin categoría', count: 1 },
    ])
  })
})

describe('orden', () => {
  const big = makeItem({ id: 1, stock: '999999999999999.999' })
  const nearBig = makeItem({ id: 2, stock: '999999999999999.998' })
  const none = makeItem({ id: 3, stock: null })
  const lowest = makeItem({ id: 4, stock: '-999999999999999.999' })
  const items = [big, none, lowest, nearBig]

  it('ordena exactamente por stock y deja los nulos al final en ambas direcciones', () => {
    expect(sortItems(items, 'stock', 'asc').map((item) => item.id)).toEqual([4, 2, 1, 3])
    expect(sortItems(items, 'stock', 'desc').map((item) => item.id)).toEqual([1, 2, 4, 3])
  })

  it('ordena por precio de venta con nulos al final', () => {
    const cheap = makeItem({ id: 1, salePrice: '0.01' })
    const costly = makeItem({ id: 2, salePrice: '9999999999999999.99' })
    const free = makeItem({ id: 3, salePrice: null })
    expect(sortItems([free, costly, cheap], 'price', 'asc').map((item) => item.id)).toEqual([1, 2, 3])
    expect(sortItems([free, costly, cheap], 'price', 'desc').map((item) => item.id)).toEqual([2, 1, 3])
  })

  it('ordena por fecha con nulos al final y conserva el 1 de enero de 1970', () => {
    const epoch = makeItem({ id: 1, updatedAt: '1970-01-01T00:00:00' })
    const recent = makeItem({ id: 2, updatedAt: '2026-11-20T23:59:59' })
    const none = makeItem({ id: 3, updatedAt: null })
    expect(sortItems([recent, none, epoch], 'updatedAt', 'asc').map((item) => item.id)).toEqual([1, 2, 3])
    expect(sortItems([recent, none, epoch], 'updatedAt', 'desc').map((item) => item.id)).toEqual([2, 1, 3])
  })

  it('ordena por nombre normalizando espacios sin alterar el texto y desempata por id', () => {
    const a = makeItem({ id: 2, name: '  zeta  ' })
    const b = makeItem({ id: 1, name: 'Zeta' })
    const c = makeItem({ id: 3, name: 'alfa' })
    expect(sortItems([a, b, c], 'name', 'asc').map((item) => item.id)).toEqual([3, 1, 2])
    expect(a.name).toBe('  zeta  ')
  })

  it('ordena por estado con los inconsistentes al final', () => {
    const states = [tea, unknown, aji, sugar]
    expect(sortItems(states, 'state', 'asc').map((item) => item.id)).toEqual([1, 2, 4, 3])
  })

  it('no modifica el arreglo de entrada', () => {
    const copy = [...items]
    sortItems(items, 'stock', 'asc')
    expect(items).toEqual(copy)
  })
})

describe('paginación', () => {
  it.each([
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [10, 1, 10, 1, 10],
    [11, 2, 1, 11, 11],
    [25, 3, 5, 21, 25],
    [26, 3, 6, 21, 26],
    [186, 19, 6, 181, 186],
    [1200, 120, 10, 1191, 1200],
  ])('con %i registros y 10 por página, la última página (%i) tiene %i filas y va de %i a %i', (total, pages, lastCount, from, to) => {
    const items = Array.from({ length: total }, (_, index) => index)
    const last = paginate(items, 9999, 10)
    expect(last.pageCount).toBe(Math.max(1, pages))
    expect(last.page).toBe(Math.max(1, pages))
    expect(last.items).toHaveLength(lastCount)
    expect(last.from).toBe(from)
    expect(last.to).toBe(to)
    expect(paginate(items, 0, 10).page).toBe(1)
  })

  it('recorre todos los elementos sin repetirlos', () => {
    const items = Array.from({ length: 26 }, (_, index) => index)
    const seen = [1, 2, 3].flatMap((page) => paginate(items, page, 10).items)
    expect(seen).toEqual(items)
  })
})
