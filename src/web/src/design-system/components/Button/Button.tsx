import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Icono decorativo antes del texto (se oculta a tecnologías de asistencia). */
  icon?: ReactNode
}

/** Acción con texto visible. Para acciones solo con icono usar IconButton. */
export function Button({ variant = 'secondary', size = 'md', icon, type = 'button', className, children, ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx(styles.button, styles[variant], size === 'sm' && styles.sm, className)} {...rest}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  )
}
