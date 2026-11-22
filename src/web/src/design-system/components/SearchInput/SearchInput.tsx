import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { Field } from '../Field/Field'
import styles from './SearchInput.module.css'

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type' | 'aria-label'> {
  /** Nombre accesible. Visualmente oculto: el icono y el marcador de posición indican su función. */
  label: string
}

export function SearchInput({ label, className, ...rest }: SearchInputProps) {
  return (
    <Field label={label} hideLabel className={className}>
      {({ id }) => (
        <div className={styles.wrap}>
          <Search size={16} aria-hidden="true" className={styles.icon} />
          <input id={id} type="search" className={`ds-control ${styles.input}`} autoComplete="off" {...rest} />
        </div>
      )}
    </Field>
  )
}
