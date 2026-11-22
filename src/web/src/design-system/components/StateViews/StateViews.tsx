import type { ReactNode } from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import { Skeleton } from '../Skeleton/Skeleton'
import styles from './StateViews.module.css'

interface StateShellProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  tone?: 'neutral' | 'danger'
  role?: 'status' | 'alert'
}

function StateShell({ icon, title, description, action, tone = 'neutral', role }: StateShellProps) {
  return (
    <div className={styles.state} role={role}>
      <span className={tone === 'danger' ? styles.iconDanger : styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}

export interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

/** Sin datos o sin resultados. Debe explicar qué ocurre y, si aplica, ofrecer la acción siguiente. */
export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return <StateShell icon={icon ?? <Inbox size={20} />} title={title} description={description} action={action} />
}

export interface ErrorStateProps {
  title: string
  description?: string
  action?: ReactNode
}

/** Fallo recuperable. Se anuncia con role="alert". El mensaje debe indicar qué pasó y cómo continuar. */
export function ErrorState({ title, description, action }: ErrorStateProps) {
  return <StateShell icon={<AlertCircle size={20} />} tone="danger" role="alert" title={title} description={description} action={action} />
}

export interface LoadingStateProps {
  /** Texto anunciado a lectores de pantalla. */
  label?: string
  rows?: number
}

/** Carga con marcadores de posición. No muestra cifras: los contadores deben mostrar guiones mientras se carga. */
export function LoadingState({ label = 'Cargando', rows = 6 }: LoadingStateProps) {
  return (
    <div className={styles.loading} role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.skeletonRow} aria-hidden="true">
          <Skeleton width="1.25rem" height="1rem" />
          <Skeleton width={`${85 - (index % 3) * 12}%`} />
          <Skeleton width="60%" />
          <Skeleton width="50%" />
        </div>
      ))}
    </div>
  )
}
