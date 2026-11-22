import { AlertTriangle, CheckCircle2, CircleSlash, MinusCircle } from '@/design-system/icons'
import { Badge } from '@/design-system'
import type { BadgeTone } from '@/design-system'
import { INCONSISTENT_STOCK_LABEL } from '../domain/stock'
import { STOCK_STATE_LABEL } from '../domain/types'
import type { StockState } from '../domain/types'
import styles from './StockStateBadge.module.css'

const TONE: Record<StockState, BadgeTone> = { 'in-stock': 'success', low: 'warning', out: 'danger', unknown: 'neutral' }
const ICON: Record<StockState, typeof CheckCircle2> = { 'in-stock': CheckCircle2, low: AlertTriangle, out: CircleSlash, unknown: MinusCircle }

/** Estado demostrativo de stock. Icono + texto + color: nunca solo color. */
export function StockStateBadge({ state }: { state: StockState }) {
  const Icon = ICON[state]
  return (
    <Badge tone={TONE[state]} icon={<Icon size={12} />}>
      {STOCK_STATE_LABEL[state]}
    </Badge>
  )
}

/** Advertencia independiente para stock negativo. NO es un estado ni un quinto filtro; su regla está pendiente (PR-19). */
export function InconsistentStockNote() {
  return (
    <div className={styles.note} role="note">
      <AlertTriangle size={14} aria-hidden="true" />
      <span>{INCONSISTENT_STOCK_LABEL}</span>
    </div>
  )
}
