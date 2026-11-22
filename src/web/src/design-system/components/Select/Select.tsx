import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { Field } from '../Field/Field'
import type { FieldChrome } from '../Field/Field'
import styles from './Select.module.css'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'aria-invalid'>, FieldChrome {}

/**
 * Selector nativo con estilo. Decisión: se usa <select> nativo y no una lista personalizada porque ofrece
 * teclado, lectores de pantalla y selectores nativos móviles sin código adicional (ver DESIGN.md).
 */
export function Select({ label, hideLabel, hint, error, className, children, ...rest }: SelectProps) {
  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className={styles.wrap}>
          <select id={id} className={`ds-control ${styles.select}`} aria-describedby={describedBy} aria-invalid={invalid || undefined} {...rest}>
            {children}
          </select>
          <ChevronDown size={16} aria-hidden="true" className={styles.chevron} />
        </div>
      )}
    </Field>
  )
}
