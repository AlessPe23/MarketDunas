import type { ReactElement, ReactNode } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import styles from './Tooltip.module.css'

/** Proveedor único para toda la aplicación: tras el primer tooltip los siguientes aparecen sin retardo. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={400} skipDelayDuration={300}>
      {children}
    </RadixTooltip.Provider>
  )
}

export interface TooltipProps {
  /** Texto breve y complementario. No debe contener información imprescindible ni acciones. */
  content: string
  children: ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className={styles.content} side={side} sideOffset={6}>
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
