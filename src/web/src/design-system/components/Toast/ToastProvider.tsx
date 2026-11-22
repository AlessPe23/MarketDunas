import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { IconButton } from '../IconButton/IconButton'
import { ToastContext } from './toastContext'
import type { ToastInput } from './toastContext'
import styles from './Toast.module.css'

interface ToastItem extends ToastInput {
  id: number
}

/** Proveedor de notificaciones. Usar `useToast()` para emitirlas. Las notificaciones se anuncian de forma educada (aria-live). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const notify = useCallback((toast: ToastInput) => {
    setItems((current) => [...current.slice(-2), { ...toast, id: Date.now() + Math.random() }])
  }, [])
  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext value={value}>
      <RadixToast.Provider swipeDirection="down" duration={5000} label="Notificaciones">
        {children}
        {items.map((item) => (
          <RadixToast.Root
            key={item.id}
            className={styles.toast}
            onOpenChange={(open) => {
              if (!open) setItems((current) => current.filter((entry) => entry.id !== item.id))
            }}
          >
            <div className={styles.text}>
              <RadixToast.Title className={styles.title}>{item.title}</RadixToast.Title>
              {item.description ? <RadixToast.Description className={styles.description}>{item.description}</RadixToast.Description> : null}
            </div>
            <RadixToast.Close asChild>
              <IconButton label="Cerrar notificación" icon={<X size={16} />} />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className={styles.viewport} />
      </RadixToast.Provider>
    </ToastContext>
  )
}
