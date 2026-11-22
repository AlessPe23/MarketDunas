import { useRef } from 'react'
import type { MouseEvent } from 'react'
import { Checkbox, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, IconButton, useToast } from '@/design-system'
import { AlertTriangle, ChevronDown, ChevronUp, ChevronsUpDown, MoreVertical } from '@/design-system/icons'
import { cx } from '@/shared/lib/cx'
import { formatMoney, formatQuantity, NBSP } from '@/shared/lib/decimal'
import { formatWallDate, isFutureWallDate } from '@/shared/lib/dates'
import { collapseSpaces } from '@/shared/lib/text'
import { classifyStock } from '../domain/stock'
import type { InventoryItem } from '../domain/model'
import type { SortKey } from '../domain/types'
import type { InventoryView } from '../hooks/useInventoryView'
import { InconsistentStockNote, StockStateBadge } from './StockStateBadge'
import styles from './ProductsTable.module.css'

interface ProductsTableProps {
  rows: readonly InventoryItem[]
  view: InventoryView
  /** Menos de 768 px: sin menú ⋮ en la fila; el nombre es el control que abre el detalle y las acciones viven en el panel. */
  compact: boolean
  activeId: number | null
  onOpen: (id: number) => void
}

function Quantity({ product }: { product: InventoryItem }) {
  if (product.stock === null) {
    return (
      <>
        <span aria-hidden="true" className={styles.muted}>
          —
        </span>
        <span className="sr-only">Sin dato</span>
      </>
    )
  }
  return (
    <span className={styles.nowrap}>
      {formatQuantity(product.stock)}
      {NBSP}
      <span className={styles.unit}>{product.unit.symbol.replace(/ /g, NBSP)}</span>
    </span>
  )
}

function Money({ product }: { product: InventoryItem }) {
  if (product.salePrice === null) {
    return (
      <>
        <span aria-hidden="true" className={styles.muted}>
          —
        </span>
        <span className="sr-only">Sin precio</span>
      </>
    )
  }
  return <span className={styles.nowrap}>{formatMoney(product.salePrice)}</span>
}

function FutureDateFlag({ value }: { value: string | null }) {
  if (value === null || !isFutureWallDate(value)) return null
  return (
    <span className={styles.future}>
      <AlertTriangle size={12} aria-hidden="true" />
      Fecha futura · Revisar
    </span>
  )
}

function SortHeader({ label, sortKey, view, align }: { label: string; sortKey: SortKey; view: InventoryView; align?: 'end' }) {
  const active = view.sort.key === sortKey
  const Icon = !active ? ChevronsUpDown : view.sort.direction === 'asc' ? ChevronUp : ChevronDown
  return (
    <th scope="col" aria-sort={active ? (view.sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={cx(align === 'end' && styles.end)}>
      <button
        type="button"
        className={styles.sort}
        onClick={() => {
          view.actions.toggleSort(sortKey)
        }}
      >
        {label}
        <Icon size={14} aria-hidden="true" />
      </button>
    </th>
  )
}

function RowActions({ product, onOpen }: { product: InventoryItem; onOpen: ProductsTableProps['onOpen'] }) {
  const { notify } = useToast()
  const skipFocusRestore = useRef(false)
  const demo = (what: string) => {
    notify({ title: `Demostración: ${what} · ${product.code}`, description: 'Acción provisional: no modifica datos.' })
  }
  return (
    <DropdownMenu
      label={`Acciones para ${product.code}`}
      onCloseAutoFocus={(event) => {
        // «Ver detalle» mueve el foco al panel (no al botón). Se hace al terminar de cerrarse el menú, que retiene el foco mientras está montado.
        if (skipFocusRestore.current) {
          event.preventDefault()
          skipFocusRestore.current = false
          requestAnimationFrame(() => {
            document.querySelector<HTMLElement>('[data-detail-focus]')?.focus()
          })
        }
      }}
      trigger={<IconButton data-opener={product.id} label={`Acciones para ${product.code}`} icon={<MoreVertical size={16} />} className={styles.kebab} />}
    >
      <DropdownMenuItem
        onSelect={() => {
          skipFocusRestore.current = true
          onOpen(product.id)
        }}
      >
        Ver detalle
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => {
          demo('editar producto')
        }}
      >
        Editar producto
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => {
          demo('añadir a pedido')
        }}
      >
        Añadir a pedido
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        tone="danger"
        onSelect={() => {
          demo('desactivar producto')
        }}
      >
        Desactivar producto
      </DropdownMenuItem>
    </DropdownMenu>
  )
}

function ProductRow({ product, view, compact, active, onOpen }: { product: InventoryItem; view: InventoryView; compact: boolean; active: boolean; onOpen: ProductsTableProps['onOpen'] }) {
  const name = collapseSpaces(product.name)
  const state = classifyStock(product)
  const selected = view.selection.isSelected(product.id)

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
    // Conveniencia de puntero: clic/toque en la fila abre el detalle, salvo sobre controles o al seleccionar texto.
    if ((event.target as HTMLElement).closest('input,button,label,a,[role="menuitem"]')) return
    if (window.getSelection()?.toString()) return
    onOpen(product.id)
  }

  return (
    <tr className={cx(selected && styles.selected, active && styles.active)} onClick={handleRowClick}>
      <td className={styles.selectCell}>
        <Checkbox
          label={`Seleccionar ${name}`}
          checked={selected}
          onChange={() => {
            view.actions.toggleRow(product.id)
          }}
        />
      </td>
      <td>
        <div className={styles.productCell}>
          <div className={styles.productText}>
            {compact ? (
              <button
                type="button"
                className={styles.nameButton}
                data-opener={product.id}
                aria-label={`Ver detalle de ${name}`}
                aria-haspopup="dialog"
                onClick={() => {
                  onOpen(product.id)
                }}
              >
                <span className={styles.name} title={name}>
                  {name}
                </span>
              </button>
            ) : (
              <div className={styles.name} title={name}>
                {name}
              </div>
            )}
            <div className={cx(styles.code, 'num')}>{product.code}</div>
            {product.supplier ? (
              <div className={styles.supplierNarrow} title={product.supplier.name}>
                {product.supplier.name}
              </div>
            ) : null}
            <div className={styles.futureNarrow}>
              <FutureDateFlag value={product.updatedAt} />
            </div>
          </div>
          {compact ? null : <RowActions product={product} onOpen={onOpen} />}
        </div>
      </td>
      <td className={styles.colSupplier}>
        {product.supplier ? (
          <span className={styles.supplier} title={product.supplier.name}>
            {product.supplier.name}
          </span>
        ) : (
          <>
            <span aria-hidden="true" className={styles.muted}>
              —
            </span>
            <span className="sr-only">Sin proveedor</span>
          </>
        )}
      </td>
      <td className={cx(styles.end, 'num')}>
        <Quantity product={product} />
      </td>
      <td>{state === null ? <InconsistentStockNote /> : <StockStateBadge state={state} />}</td>
      <td className={cx(styles.end, 'num')}>
        <Money product={product} />
      </td>
      <td className={cx(styles.colUpdated, 'num')}>
        {product.updatedAt === null ? (
          <>
            <span aria-hidden="true" className={styles.muted}>
              —
            </span>
            <span className="sr-only">Sin fecha</span>
          </>
        ) : (
          formatWallDate(product.updatedAt)
        )}
        <FutureDateFlag value={product.updatedAt} />
      </td>
    </tr>
  )
}

/** Tabla tipo «Libro» de productos. Semántica de tabla nativa (sin ARIA grid); dos controles por fila: selección y acciones/nombre. */
export function ProductsTable({ rows, view, compact, activeId, onOpen }: ProductsTableProps) {
  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <caption className="sr-only">Productos e inventario (datos de demostración)</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.selectCell}>
              <Checkbox
                label="Seleccionar los productos de esta página"
                checked={view.selection.pageState === 'all'}
                indeterminate={view.selection.pageState === 'some'}
                onChange={view.actions.togglePage}
              />
            </th>
            <SortHeader label="Producto" sortKey="name" view={view} />
            <th scope="col" className={styles.colSupplier}>
              Proveedor
            </th>
            <SortHeader label="Stock" sortKey="stock" view={view} align="end" />
            <SortHeader label="Estado" sortKey="state" view={view} />
            <SortHeader label="Precio" sortKey="price" view={view} align="end" />
            <th scope="col" className={styles.colUpdated} aria-sort={view.sort.key === 'updatedAt' ? (view.sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <button
                type="button"
                className={styles.sort}
                onClick={() => {
                  view.actions.toggleSort('updatedAt')
                }}
              >
                Actualizado
                {view.sort.key === 'updatedAt' ? view.sort.direction === 'asc' ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" /> : <ChevronsUpDown size={14} aria-hidden="true" />}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((product) => (
            <ProductRow key={product.id} product={product} view={view} compact={compact} active={activeId === product.id} onOpen={onOpen} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
