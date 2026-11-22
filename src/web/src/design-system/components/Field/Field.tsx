import { useId } from 'react'
import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Field.module.css'

export interface FieldChrome {
  /** Etiqueta accesible del campo (obligatoria). */
  label: string
  /** Oculta la etiqueta visualmente; sigue disponible para lectores de pantalla. */
  hideLabel?: boolean
  hint?: string
  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: string
}

interface FieldProps extends FieldChrome {
  className?: string
  children: (control: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
}

/** Estructura común de etiqueta + control + ayuda/error. Usada por Input, SearchInput y Select. */
export function Field({ label, hideLabel, hint, error, className, children }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : styles.label}>
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
