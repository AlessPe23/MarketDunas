import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, EmptyState, ErrorState, LoadingState, MEDIA, useToast } from '@/design-system'
import { Plus, RefreshCw } from '@/design-system/icons'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/lib/cx'
import { pluralize } from '@/shared/lib/plural'
import { createSyntheticRepository } from './data/repository'
import type { InventoryRepository } from './data/repository'
import type { DatasetId } from './data/synthetic/datasets'
import { DemoNotice } from './components/DemoNotice'
import type { SimulatedState } from './components/DemoNotice'
import { DetailPanel } from './components/DetailPanel'
import { InventoryToolbar } from './components/InventoryToolbar'
import { Pager } from './components/Pager'
import { ProductsTable } from './components/ProductsTable'
import { SelectionBar } from './components/SelectionBar'
import { StatusStrip } from './components/StatusStrip'
import { useInventory } from './hooks/useInventory'
import { useInventoryView } from './hooks/useInventoryView'
import type { InventoryItem } from './domain/model'
import styles from './InventoryScreen.module.css'

type Content = { kind: 'loading' } | { kind: 'error'; message: string; description: string } | { kind: 'ready'; items: readonly InventoryItem[]; suppliers: readonly string[] }

interface InventoryContentProps {
  content: Content
  header: ReactNode
  onRetry: () => void
}

function InventoryContent({ content, header, onRetry }: InventoryContentProps) {
  const items = useMemo(() => (content.kind === 'ready' ? content.items : []), [content])
  const view = useInventoryView(items)
  const compact = !useMediaQuery(MEDIA.compact)
  const docked = useMediaQuery(MEDIA.detailDocked)
  const [detail, setDetail] = useState<number | null>(null)
  const openerRef = useRef<number | null>(null)
  const figures = content.kind === 'ready'

  const active = detail === null ? null : (items.find((item) => item.id === detail) ?? null)
  const activeIndex = active ? view.results.findIndex((item) => item.id === active.id) : -1

  // Devuelve el foco al control que abrió el detalle cuando éste se cierra.
  useEffect(() => {
    if (detail === null && openerRef.current !== null) {
      const id = openerRef.current
      openerRef.current = null
      document.querySelector<HTMLElement>(`[data-opener="${id}"]`)?.focus()
    }
  }, [detail])

  const open = (id: number) => {
    openerRef.current = id
    setDetail(id)
  }
  const step = (delta: number) => {
    const target = view.results[activeIndex + delta]
    if (!target) return
    openerRef.current = target.id
    setDetail(target.id)
    view.actions.setPage(Math.floor((activeIndex + delta) / view.pageSize) + 1)
  }

  const hasProducts = items.length > 0
  const noResults = figures && hasProducts && view.results.length === 0

  let body: ReactNode
  if (content.kind === 'loading') body = <LoadingState label="Cargando productos" rows={8} />
  else if (content.kind === 'error')
    body = (
      <ErrorState
        title={content.message}
        description={content.description}
        action={
          <Button variant="primary" icon={<RefreshCw size={14} />} onClick={onRetry}>
            Reintentar
          </Button>
        }
      />
    )
  else if (!hasProducts) body = <EmptyState title="Todavía no hay productos" description="Agregar el primer producto para empezar a controlar existencias." />
  else if (noResults)
    body = (
      <EmptyState
        title="No hay productos para esta búsqueda"
        description="Ningún producto cumple la búsqueda o los filtros activos. Revisar la ortografía o quitar filtros."
        action={
          <Button variant="primary" onClick={view.actions.clearFilters}>
            Quitar filtros
          </Button>
        }
      />
    )
  else body = <ProductsTable rows={view.slice.items} view={view} compact={compact} activeId={active?.id ?? null} onOpen={open} />

  const showDetail = active !== null && figures

  return (
    <>
      {header}
      <StatusStrip counts={view.counts} selected={view.filters.states} figuresAvailable={figures && hasProducts} onToggle={view.actions.toggleState} />
      <InventoryToolbar
        query={view.filters.query}
        supplier={view.filters.supplier}
        suppliers={content.kind === 'ready' ? content.suppliers : []}
        categories={view.categories}
        categoryId={view.filters.categoryId}
        disabled={!figures || !hasProducts}
        filtersActive={view.filtersActive}
        onQueryChange={view.actions.setQuery}
        onSupplierChange={view.actions.setSupplier}
        onCategoryChange={view.actions.setCategory}
        onClear={view.actions.clearFilters}
      />
      <div className={cx(styles.layout, showDetail && docked && styles.docked)}>
        <div className={styles.main}>
          <div className={styles.card}>
            {figures ? (
              <p className={styles.resultsLine} aria-live="polite">
                {pluralize(view.results.length, 'resultado', 'resultados')}
                {view.counts.inconsistent > 0 ? (
                  <span className={styles.inconsistent}> · {pluralize(view.counts.inconsistent, 'producto con dato inconsistente', 'productos con dato inconsistente')} (fuera de los cuatro estados)</span>
                ) : null}
              </p>
            ) : null}
            <SelectionBar
              count={view.selection.count}
              outsideFilter={view.selection.outsideFilter}
              totalResults={view.results.length}
              allResultsSelected={view.selection.outsideFilter === 0 && view.results.every((item) => view.selection.isSelected(item.id))}
              onSelectAllResults={view.actions.selectAllResults}
              onClearOutside={view.actions.clearSelectionOutsideFilter}
              onClear={view.actions.clearSelection}
            />
            {body}
          </div>
          {figures && hasProducts && !noResults ? (
            <Pager
              page={view.slice.page}
              pageCount={view.slice.pageCount}
              from={view.slice.from}
              to={view.slice.to}
              total={view.slice.total}
              pageSize={view.pageSize}
              disabled={false}
              onPageChange={view.actions.setPage}
              onPageSizeChange={view.actions.setPageSize}
            />
          ) : null}
        </div>
        {showDetail ? (
          <DetailPanel
            product={active}
            position={activeIndex + 1}
            total={view.results.length}
            mode={docked ? 'docked' : 'sheet'}
            onPrevious={() => {
              step(-1)
            }}
            onNext={() => {
              step(1)
            }}
            onClose={() => {
              setDetail(null)
            }}
          />
        ) : null}
      </div>
    </>
  )
}

/** Pantalla de referencia de inventario (datos sintéticos). Demuestra el sistema de diseño; no implementa la lógica definitiva. */
export function InventoryScreen() {
  const { notify } = useToast()
  const [dataset, setDataset] = useState<DatasetId>('demo')
  const [simulated, setSimulated] = useState<SimulatedState>('normal')
  const [attempt, setAttempt] = useState(0)
  const repository: InventoryRepository = useMemo(() => createSyntheticRepository(dataset), [dataset])
  const resource = useInventory(repository, attempt)
  const retryTimer = useRef<number>(0)
  useEffect(
    () => () => {
      window.clearTimeout(retryTimer.current)
    },
    [],
  )

  const content: Content = useMemo(() => {
    if (simulated === 'loading' || resource.status === 'loading') return { kind: 'loading' }
    if (simulated === 'error') return { kind: 'error', message: 'No se pudo cargar el inventario', description: 'La conexión falló o el servicio no respondió. Los datos no se perdieron.' }
    if (resource.status === 'error') return { kind: 'error', message: 'Los datos de inventario no son válidos', description: resource.error.message }
    const names = [...new Set(resource.load.items.flatMap((item) => (item.supplier ? [item.supplier.name] : [])))].sort((a, b) => a.localeCompare(b, 'es'))
    return { kind: 'ready', items: resource.load.items, suppliers: names }
  }, [simulated, resource])

  const header = (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Productos e inventario</h1>
          <p className={styles.sub}>{content.kind === 'ready' ? pluralize(content.items.length, 'producto', 'productos') : 'Sin datos disponibles'}</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            notify({ title: 'Función provisional: agregar producto', description: 'Aún no está implementada.' })
          }}
        >
          Agregar producto
        </Button>
      </div>
      <DemoNotice
        dataset={dataset}
        simulated={simulated}
        onDatasetChange={(next) => {
          setDataset(next)
          setSimulated('normal')
        }}
        onSimulatedChange={setSimulated}
      />
    </>
  )

  return (
    <div className={styles.screen}>
      <InventoryContent
        key={dataset}
        content={content}
        header={header}
        onRetry={() => {
          if (simulated === 'error') {
            setSimulated('loading')
            retryTimer.current = window.setTimeout(() => {
              setSimulated('normal')
            }, 700)
          } else {
            setAttempt((current) => current + 1)
          }
        }}
      />
    </div>
  )
}
