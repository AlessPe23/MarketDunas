import type { ReactElement, ReactNode } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import styles from './Popover.module.css'

export interface PopoverProps {
  /** Elemento disparador (un botón con nombre accesible). */
  trigger: ReactElement
  /** Nombre accesible del contenido. */
  label: string
  children: ReactNode
  align?: 'start' | 'center' | 'end'
}

/** Contenido flotante no modal con elementos interactivos (a diferencia de Tooltip). Cierra con Escape y clic exterior. */
export function Popover({ trigger, label, children, align = 'start' }: PopoverProps) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content className={styles.content} aria-label={label} align={align} sideOffset={6} collisionPadding={8}>
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
