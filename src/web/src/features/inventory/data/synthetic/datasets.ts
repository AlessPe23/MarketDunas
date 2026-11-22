import type { InventoryCatalog } from '../../domain/model'
import { buildEdgeCases } from './edgeCases'
import { generateProducts } from './generate'
import { SYNTHETIC_CATEGORIES, SYNTHETIC_SUPPLIERS, SYNTHETIC_UNITS } from './reference'

export type DatasetId = 'demo' | 'worst-case' | 'large' | 'empty'

export const DATASET_IDS: readonly DatasetId[] = ['demo', 'worst-case', 'large', 'empty']

export const DATASET_LABEL: Record<DatasetId, string> = {
  demo: 'Demostración (186 productos)',
  'worst-case': 'Peor caso (valores extremos)',
  large: '1 200 productos',
  empty: 'Sin productos',
}

export function isDatasetId(value: string): value is DatasetId {
  return DATASET_IDS.some((id) => id === value)
}

const reference = { units: SYNTHETIC_UNITS, categories: SYNTHETIC_CATEGORIES, suppliers: SYNTHETIC_SUPPLIERS }

/**
 * Construye el catálogo sintético de un conjunto. Determinista salvo por el día de referencia (`today`).
 * Estrategia: los productos «normales» se generan con una semilla fija a partir de plantillas por categoría; los casos
 * extremos se escriben a mano (`edgeCases.ts`). Ambos se entregan como carga sin tipar a través de `parseInventoryCatalog`.
 */
export function buildCatalog(id: DatasetId, today: Date = new Date()): InventoryCatalog {
  switch (id) {
    case 'demo':
      return { ...reference, ...generateProducts({ count: 186, startId: 1, seed: 1, today }) }
    case 'large':
      return { ...reference, ...generateProducts({ count: 1200, startId: 20000, seed: 3, today }) }
    case 'empty':
      return { ...reference, products: [], stock: [] }
    case 'worst-case': {
      const generated = generateProducts({ count: 24, startId: 9100, seed: 7, today })
      const edge = buildEdgeCases(today)
      return { ...reference, products: [...edge.products, ...generated.products], stock: [...edge.stock, ...generated.stock] }
    }
  }
}
