import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Badge.module.css'

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface BadgeProps {
  tone?: BadgeTone
  /** Icono que refuerza el significado: el estado nunca depende solo del color. */
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}
