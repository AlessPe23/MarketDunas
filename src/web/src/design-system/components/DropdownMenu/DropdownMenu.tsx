import type { ReactElement, ReactNode } from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import { cx } from '@/shared/lib/cx'
import styles from './DropdownMenu.module.css'

export interface DropdownMenuProps {
  /** Elemento disparador (un botón). Debe tener nombre accesible. */
  trigger: ReactElement
  /** Nombre accesible del menú. */
  label: string
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  /** Permite cancelar la devolución de foco al disparador (p. ej. cuando una acción mueve el foco a otro lugar). */
  onCloseAutoFocus?: (event: Event) => void
}

/** Menú de acciones sobre Radix DropdownMenu: flechas, Inicio/Fin, escritura rápida, Escape y devolución de foco. */
export function DropdownMenu({ trigger, label, children, align = 'end', onCloseAutoFocus }: DropdownMenuProps) {
  return (
    <Menu.Root modal={false}>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className={styles.content} aria-label={label} align={align} sideOffset={4} collisionPadding={8} onCloseAutoFocus={onCloseAutoFocus}>
          {children}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}

export interface DropdownMenuItemProps {
  onSelect?: () => void
  tone?: 'default' | 'danger'
  disabled?: boolean
  children: ReactNode
}

export function DropdownMenuItem({ onSelect, tone = 'default', disabled, children }: DropdownMenuItemProps) {
  return (
    <Menu.Item className={cx(styles.item, tone === 'danger' && styles.danger)} disabled={disabled} onSelect={onSelect}>
      {children}
    </Menu.Item>
  )
}

export function DropdownMenuSeparator() {
  return <Menu.Separator className={styles.separator} />
}
