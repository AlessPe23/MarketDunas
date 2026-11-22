import { useEffect, useRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Checkbox.module.css'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'aria-label'> {
  /** Nombre accesible obligatorio. Se muestra solo si `showLabel` es verdadero. */
  label: string
  showLabel?: boolean
  /** Estado mixto (p. ej. selección parcial de una página). */
  indeterminate?: boolean
}

/** Casilla nativa. Ofrece un objetivo táctil de al menos --control-h aunque la casilla visible sea de 16 px. */
export function Checkbox({ label, showLabel = false, indeterminate = false, className, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <label className={cx(styles.wrap, className)}>
      <input ref={ref} type="checkbox" className={styles.input} aria-label={showLabel ? undefined : label} {...rest} />
      {showLabel ? <span className={styles.text}>{label}</span> : null}
    </label>
  )
}
