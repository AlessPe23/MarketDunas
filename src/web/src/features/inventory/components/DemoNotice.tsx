import { Select } from '@/design-system'
import { DATASET_IDS, DATASET_LABEL, isDatasetId } from '../data/synthetic/datasets'
import type { DatasetId } from '../data/synthetic/datasets'
import styles from './DemoNotice.module.css'

export type SimulatedState = 'normal' | 'loading' | 'error'

const SIMULATED: readonly SimulatedState[] = ['normal', 'loading', 'error']
const isSimulated = (value: string): value is SimulatedState => SIMULATED.some((state) => state === value)

interface DemoNoticeProps {
  dataset: DatasetId
  simulated: SimulatedState
  onDatasetChange: (dataset: DatasetId) => void
  onSimulatedChange: (state: SimulatedState) => void
}

/** Aviso permanente de datos de demostración + controles de desarrollo para ejercitar estados. No forma parte del producto final. */
export function DemoNotice({ dataset, simulated, onDatasetChange, onSimulatedChange }: DemoNoticeProps) {
  return (
    <section className={styles.notice} aria-label="Datos de demostración">
      <p>
        <strong>Datos de demostración.</strong> 100 % sintéticos; los umbrales de stock son ficticios y no son reglas de negocio aprobadas.
      </p>
      <div className={styles.controls}>
        <Select
          label="Conjunto de datos"
          value={dataset}
          onChange={(event) => {
            if (isDatasetId(event.target.value)) onDatasetChange(event.target.value)
          }}
        >
          {DATASET_IDS.map((id) => (
            <option key={id} value={id}>
              {DATASET_LABEL[id]}
            </option>
          ))}
        </Select>
        <Select
          label="Simular estado"
          value={simulated}
          onChange={(event) => {
            if (isSimulated(event.target.value)) onSimulatedChange(event.target.value)
          }}
        >
          <option value="normal">Normal</option>
          <option value="loading">Cargando</option>
          <option value="error">Error</option>
        </Select>
      </div>
    </section>
  )
}
