import { BarChart3, Box, Clipboard, Palette, Repeat } from '@/design-system/icons'
import type { ComponentType } from 'react'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
  /** `implemented`: pantalla disponible. `provisional`: marcador de posición que no aparenta funcionalidad terminada. */
  status: 'implemented' | 'provisional'
}

/**
 * Navegación principal. Solo «Inventario» tiene pantalla (de referencia, con datos sintéticos).
 * Las demás opciones son provisionales: sus nombres son marcadores y NO fijan el alcance funcional de la tesis.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'inventory', label: 'Inventario', path: '/inventario', icon: Box, status: 'implemented' },
  { id: 'replenishment', label: 'Reposición', path: '/reposicion', icon: Repeat, status: 'provisional' },
  { id: 'orders', label: 'Pedidos', path: '/pedidos', icon: Clipboard, status: 'provisional' },
  { id: 'indicators', label: 'Indicadores', path: '/indicadores', icon: BarChart3, status: 'provisional' },
]

export const DESIGN_SYSTEM_PATH = '/sistema-de-diseno'

/** Entrada de desarrollo (galería del sistema de diseño); solo se muestra en `npm run dev`. */
export const DESIGN_SYSTEM_ITEM: NavItem = { id: 'design', label: 'Sistema de diseño', path: DESIGN_SYSTEM_PATH, icon: Palette, status: 'implemented' }
