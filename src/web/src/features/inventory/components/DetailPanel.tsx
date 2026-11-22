import { useEffect, useRef } from 'react'
import { Badge, Button, Dialog, IconButton, useToast } from '@/design-system'
import { ChevronDown, ChevronUp, X } from '@/design-system/icons'
import { useScrollable } from '@/shared/hooks/useScrollable'
import { cx } from '@/shared/lib/cx'
import { formatMoney, formatQuantity, NBSP } from '@/shared/lib/decimal'
import { formatWallDate, isFutureWallDate } from '@/shared/lib/dates'
import { collapseSpaces } from '@/shared/lib/text'
import { classifyStock } from '../domain/stock'
import type { InventoryItem } from '../domain/model'
import { useDockedFit } from '../hooks/useDockedFit'
import { InconsistentStockNote, StockStateBadge } from './StockStateBadge'
import styles from './DetailPanel.module.css'

interface DetailPanelProps {
  product: InventoryItem
  position: number
  total: number
  /** `docked`: columna fija junto a la tabla (≥1440 px). `sheet`: hoja modal (<1440 px). */
  mode: 'docked' | 'sheet'
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}

function DetailBody({ product }: { product: InventoryItem }) {
  const name = collapseSpaces(product.name)
  const future = product.updatedAt !== null && isFutureWallDate(product.updatedAt)
  return (
    <>
      <dl className={styles.list}>
        {name.length > 60 ? (
          <div className={styles.wide}>
            <dt>Nombre completo</dt>
            <dd>{name}</dd>
          </div>
        ) : null}
        <div>
          <dt>Stock</dt>
          <dd className="num">{product.stock === null ? 'Sin dato' : `${formatQuantity(product.stock)}${NBSP}${product.unit.symbol.replace(/ /g, NBSP)}`}</dd>
        </div>
        <div>
          <dt>Precio de venta</dt>
          <dd className="num">{product.salePrice === null ? 'Sin precio' : formatMoney(product.salePrice)}</dd>
        </div>
        <div>
          <dt>Precio de compra</dt>
          <dd className="num">{product.purchasePrice === null ? 'Sin precio' : formatMoney(product.purchasePrice)}</dd>
        </div>
        <div>
          <dt>Referencia de demostración</dt>
          <dd className="num">{product.referenceLevel === null ? 'Sin dato' : `${formatQuantity(product.referenceLevel)}${NBSP}${product.unit.symbol.replace(/ /g, NBSP)}`}</dd>
        </div>
        <div>
          <dt>Actualizado</dt>
          <dd className="num">
            {product.updatedAt === null ? 'Sin fecha' : formatWallDate(product.updatedAt)}
            {future ? (
              <Badge tone="warning" className={styles.future}>
                Fecha futura · Revisar
              </Badge>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Categoría</dt>
          <dd>{product.category?.name ?? 'Sin categoría'}</dd>
        </div>
        <div>
          <dt>Marca</dt>
          <dd>{product.brand ?? 'Sin marca'}</dd>
        </div>
        <div className={styles.wide}>
          <dt>Proveedor</dt>
          <dd>{product.supplier?.name ?? 'Sin proveedor'}</dd>
        </div>
      </dl>
      <p className={styles.note}>El estado se calcula con un umbral ficticio, solo para esta demostración. Los precios y las categorías también son de demostración.</p>
    </>
  )
}

function DetailActions({ product }: { product: InventoryItem }) {
  const { notify } = useToast()
  const demo = (what: string) => {
    notify({ title: `Demostración: ${what} · ${product.code}`, description: 'Acción provisional: no modifica datos.' })
  }
  return (
    <>
      <Button
        onClick={() => {
          demo('añadir a pedido')
        }}
      >
        Añadir a pedido
      </Button>
      <Button
        onClick={() => {
          demo('editar producto')
        }}
      >
        Editar producto
      </Button>
      <Button
        variant="danger"
        onClick={() => {
          demo('desactivar producto')
        }}
      >
        Desactivar producto
      </Button>
    </>
  )
}

/**
 * Detalle opcional del producto. Acoplado (≥1440 px) o como hoja modal (<1440 px).
 * El contenido hace scroll interno y el pie con acciones permanece visible. En pantallas estrechas las acciones
 * de fila están únicamente aquí.
 */
export function DetailPanel({ product, position, total, mode, onPrevious, onNext, onClose }: DetailPanelProps) {
  const asideRef = useRef<HTMLElement>(null)
  const [bodyRef, bodyScrolls] = useScrollable<HTMLDivElement>()
  const name = collapseSpaces(product.name)
  const state = classifyStock(product)

  useDockedFit(asideRef, mode === 'docked')

  // Panel acoplado: Escape lo cierra (la hoja modal lo gestiona Radix). El foco de apertura por teclado lo mueve el menú de la fila.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })
  useEffect(() => {
    if (mode !== 'docked') return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      if (document.querySelector('[role="menu"], [role="dialog"]')) return
      onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mode])

  const navigation = (
    <div className={styles.navigation}>
      <span className={cx(styles.position, 'num')}>
        {position > 0 ? `${position} de ${total}` : 'Fuera del filtro'}
      </span>
      <IconButton label="Producto anterior" icon={<ChevronUp size={16} />} disabled={position <= 1} onClick={onPrevious} />
      <IconButton label="Producto siguiente" icon={<ChevronDown size={16} />} disabled={position === 0 || position >= total} onClick={onNext} />
    </div>
  )

  if (mode === 'sheet') {
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
        variant="sheet"
        title={name}
        description={`Detalle del producto ${product.code}`}
        footer={<DetailActions product={product} />}
        returnFocus={() => document.querySelector<HTMLElement>(`[data-opener="${product.id}"]`)}
      >
        <div className={styles.sheetStack}>
          {navigation}
          {state === null ? <InconsistentStockNote /> : <StockStateBadge state={state} />}
          <DetailBody product={product} />
        </div>
      </Dialog>
    )
  }

  return (
    <aside ref={asideRef} className={styles.panel} aria-labelledby="detail-title">
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={cx(styles.code, 'num')}>{product.code}</p>
          <h2 id="detail-title" className={styles.title}>
            {name}
          </h2>
          <div className={styles.state}>{state === null ? <InconsistentStockNote /> : <StockStateBadge state={state} />}</div>
        </div>
        <div className={styles.headerButtons}>
          {navigation}
          <IconButton data-detail-focus label="Cerrar detalle" icon={<X size={16} />} onClick={onClose} />
        </div>
      </header>
      <div ref={bodyRef} className={styles.body} tabIndex={bodyScrolls ? 0 : undefined} role={bodyScrolls ? 'region' : undefined} aria-label={bodyScrolls ? 'Detalle del producto (desplazable)' : undefined}>
        <DetailBody product={product} />
      </div>
      <div className={styles.footer}>
        <DetailActions product={product} />
      </div>
    </aside>
  )
}
