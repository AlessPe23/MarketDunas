import { useRef } from 'react'
import type { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useScrollable } from '@/shared/hooks/useScrollable'
import { cx } from '@/shared/lib/cx'
import { IconButton } from '../IconButton/IconButton'
import styles from './Dialog.module.css'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Título accesible (obligatorio). */
  title: string
  description?: string
  /** `modal`: centrado. `sheet`: hoja lateral derecha (detalle en pantallas estrechas). `drawer`: cajón izquierdo (navegación). */
  variant?: 'modal' | 'sheet' | 'drawer'
  /** Oculta el título visualmente cuando el contenido ya lo muestra. */
  hideTitle?: boolean
  footer?: ReactNode
  /** Resuelve el elemento al que devolver el foco al cerrar (se evalúa al cerrar). Por defecto, el elemento enfocado al abrir. */
  returnFocus?: () => HTMLElement | null
  children: ReactNode
  className?: string
}

/** Diálogo modal sobre Radix Dialog: trampa de foco, Escape, devolución de foco y bloqueo del fondo. */
export function Dialog({ open, onOpenChange, title, description, variant = 'modal', hideTitle, footer, returnFocus, children, className }: DialogProps) {
  // El diálogo se abre con estado (sin Dialog.Trigger): se recuerda el elemento enfocado al abrir para devolverle el foco.
  const openerRef = useRef<HTMLElement | null>(null)
  const [bodyRef, bodyScrolls] = useScrollable<HTMLDivElement>()
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content
          className={cx(styles.content, styles[variant], className)}
          onOpenAutoFocus={() => {
            openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
          }}
          onCloseAutoFocus={(event) => {
            const target = returnFocus?.() ?? openerRef.current
            if (target) {
              event.preventDefault()
              target.focus()
            }
          }}
        >
          <header className={styles.header}>
            <RadixDialog.Title className={cx(styles.title, hideTitle && 'sr-only')}>{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <IconButton label="Cerrar" icon={<X size={16} />} />
            </RadixDialog.Close>
          </header>
          {description ? <RadixDialog.Description className={styles.description}>{description}</RadixDialog.Description> : <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>}
          <div ref={bodyRef} className={styles.body} tabIndex={bodyScrolls ? 0 : undefined} role={bodyScrolls ? 'region' : undefined} aria-label={bodyScrolls ? `${title} (desplazable)` : undefined}>
            {children}
          </div>
          {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
