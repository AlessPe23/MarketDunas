import type { InputHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import { Field } from '../Field/Field'
import type { FieldChrome } from '../Field/Field'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-invalid'>, FieldChrome {}

export function Input({ label, hideLabel, hint, error, className, ...rest }: InputProps) {
  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <input id={id} className={cx('ds-control')} aria-describedby={describedBy} aria-invalid={invalid || undefined} {...rest} />
      )}
    </Field>
  )
}
