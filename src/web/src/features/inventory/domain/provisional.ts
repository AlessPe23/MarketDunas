/**
 * Registro de reglas y valores PROVISIONALES de inventario.
 *
 * Nada de lo que aparece aquí está aprobado por el negocio ni por la documentación de la tesis. Se centraliza para que
 * ningún componente presente estos valores como reglas y para que sea fácil localizarlos y sustituirlos cuando se
 * decidan. Los identificadores PR-xx son pendientes del registro de decisiones del proyecto.
 */
export const PROVISIONAL = {
  /** Límites de campos de la propuesta D7 (NO aprobada). Solo generan advertencias de validación. */
  limits: { nameMax: 150, codeMax: 30, unitSymbolMax: 12, quantityScale: 3, priceScale: 2 },

  /** «Stock bajo» se calcula contra un nivel de referencia demostrativo por producto. PR-04 (stock mínimo / punto de reorden) abierto. */
  lowStock: { ruleId: 'PR-04', note: 'Umbral ficticio por producto; no es stock mínimo ni punto de reorden.' },

  /** Stock negativo: se muestra como advertencia independiente; NO es un estado. Tratamiento pendiente. */
  negativeStock: { ruleId: 'PR-19', note: 'Pendiente de decisión (recepción, mermas, conteos y ajustes).' },

  /** Qué precio usará el negocio (compra, venta o ambos) no está documentado. */
  prices: { note: 'La tabla muestra el precio de venta; el panel muestra ambos. Decisión pendiente.' },

  /** Las categorías de demostración no provienen de la documentación. */
  categories: { note: 'Taxonomía ficticia para probar agrupación y filtrado.' },
} as const
