import { AlertTriangle, CheckCircle2, CircleSlash, MinusCircle } from '@/design-system/icons'
import { cx } from '@/shared/lib/cx'
import { STOCK_STATE_LABEL, STOCK_STATE_ORDER } from '../domain/types'
import type { StockState } from '../domain/types'
import type { StateCounts } from '../domain/query'
import styles from './StatusStrip.module.css'

const ICON: Record<StockState, typeof CheckCircle2> = { 'in-stock': CheckCircle2, low: AlertTriangle, out: CircleSlash, unknown: MinusCircle }
const TONE: Record<StockState, string> = { 'in-stock': styles.success ?? '', low: styles.warning ?? '', out: styles.danger ?? '', unknown: styles.neutral ?? '' }

interface StatusStripProps {
  counts: StateCounts
  selected: ReadonlySet<StockState>
  /** Mientras se carga o hay error NO se muestran cifras: se usan guiones. */
  figuresAvailable: boolean
  onToggle: (state: StockState) => void
}

/** Franja compacta de cuatro estados: único mecanismo visual de filtrado por estado. Cada tarjeta es un botón de alternancia. */
export function StatusStrip({ counts, selected, figuresAvailable, onToggle }: StatusStripProps) {
  const nf = new Intl.NumberFormat('es-PE')
  return (
    <div className={styles.strip} role="group" aria-label="Filtrar por estado de stock">
      {STOCK_STATE_ORDER.map((state) => {
        const Icon = ICON[state]
        const pressed = selected.has(state)
        return (
          <button
            key={state}
            type="button"
            className={cx(styles.card, pressed && styles.pressed)}
            aria-pressed={pressed}
            disabled={!figuresAvailable}
            onClick={() => {
              onToggle(state)
            }}
          >
            <span className={cx(styles.label, TONE[state])}>
              <Icon size={14} aria-hidden="true" />
              {STOCK_STATE_LABEL[state]}
            </span>
            <span className={cx(styles.value, 'num')}>
              {figuresAvailable ? nf.format(counts[state]) : <><span aria-hidden="true">—</span><span className="sr-only">sin datos</span></>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
