import { Button } from '@/design-system'
import { useToast } from '@/design-system'
import { pluralize } from '@/shared/lib/plural'
import styles from './SelectionBar.module.css'

interface SelectionBarProps {
  count: number
  outsideFilter: number
  totalResults: number
  /** Verdadero si todos los resultados filtrados ya están seleccionados. */
  allResultsSelected: boolean
  onSelectAllResults: () => void
  onClearOutside: () => void
  onClear: () => void
}

/**
 * Barra de selección. Las acciones masivas operan sobre TODA la selección, incluidos productos que el filtro
 * actual no muestra; la barra lo indica de forma explícita. Las acciones son demostrativas (provisionales).
 */
export function SelectionBar({ count, outsideFilter, totalResults, allResultsSelected, onSelectAllResults, onClearOutside, onClear }: SelectionBarProps) {
  const { notify } = useToast()
  const nf = new Intl.NumberFormat('es-PE')
  const announce = (what: string) => {
    notify({
      title: `Demostración: ${what} · ${pluralize(count, 'seleccionado', 'seleccionados')}${outsideFilter > 0 ? ` (incluye ${nf.format(outsideFilter)} fuera del filtro)` : ''}`,
      description: 'Acción provisional: no modifica datos.',
    })
  }
  if (count === 0) return null
  return (
    <section className={styles.bar} aria-label="Acciones sobre la selección">
      <div className={styles.lead}>
        <strong className="num">{pluralize(count, 'producto seleccionado', 'productos seleccionados')}</strong>
        {outsideFilter > 0 ? (
          <>
            <span className={styles.out}>{nf.format(outsideFilter)} fuera del filtro actual</span>
            <Button variant="ghost" size="sm" onClick={onClearOutside}>
              Quitar los {nf.format(outsideFilter)} fuera del filtro
            </Button>
          </>
        ) : null}
        {!allResultsSelected && totalResults > 0 ? (
          <Button variant="ghost" size="sm" onClick={onSelectAllResults}>
            Seleccionar los {nf.format(totalResults)} resultados
          </Button>
        ) : null}
      </div>
      <div className={styles.actions}>
        <Button
          onClick={() => {
            announce('exportar selección')
          }}
        >
          Exportar selección ({nf.format(count)})
        </Button>
        <Button
          onClick={() => {
            announce('desactivar productos')
          }}
        >
          Desactivar productos ({nf.format(count)})
        </Button>
        <Button variant="ghost" onClick={onClear}>
          Quitar selección
        </Button>
      </div>
      {outsideFilter > 0 ? (
        <p className={styles.hint}>
          Las acciones incluyen los {nf.format(outsideFilter)} seleccionados que no están visibles con los filtros actuales.
        </p>
      ) : null}
    </section>
  )
}
