import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './IconButton.module.css'

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> {
  /** Nombre accesible obligatorio: un botón con solo icono no tiene texto visible. */
  label: string
  icon: ReactNode
  variant?: 'ghost' | 'secondary'
}

export function IconButton({ label, icon, variant = 'ghost', type = 'button', className, ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} className={cx(styles.iconButton, variant === 'secondary' && styles.secondary, className)} {...rest}>
      <span aria-hidden="true" className={styles.glyph}>
        {icon}
      </span>
    </button>
  )
}
