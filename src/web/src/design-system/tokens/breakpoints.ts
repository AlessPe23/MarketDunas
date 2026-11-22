/**
 * Puntos de ruptura (px). Las consultas de medios CSS no admiten variables, por lo que estos valores
 * se repiten en los CSS (en rem) y aquí para uso en TypeScript. Mantenerlos sincronizados.
 */
export const BREAKPOINTS = {
  /** Debajo: acciones de fila solo en el panel de detalle; navegación en cajón. */
  compact: 768,
  /** Desde aquí la barra lateral se expande (232 px); debajo se contrae (56 px). */
  sidebarExpanded: 1100,
  /** Desde aquí el panel de detalle se acopla a la tabla; debajo es una hoja modal. */
  detailDocked: 1440,
} as const

export const MEDIA = {
  compact: `(min-width: ${BREAKPOINTS.compact}px)`,
  sidebarExpanded: `(min-width: ${BREAKPOINTS.sidebarExpanded}px)`,
  detailDocked: `(min-width: ${BREAKPOINTS.detailDocked}px)`,
} as const
