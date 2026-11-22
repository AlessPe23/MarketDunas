import { assembleInventory } from '../domain/assemble'
import type { InventoryItem, InventoryCatalog } from '../domain/model'
import { validateCatalog } from '../domain/validation'
import type { ValidationIssue } from '../domain/validation'
import { parseInventoryCatalog } from './dto'
import type { DtoIssue } from './dto'
import { buildCatalog } from './synthetic/datasets'
import type { DatasetId } from './synthetic/datasets'

/** Resultado de cargar el inventario: catálogo normalizado, elementos de lectura y avisos de validación (no bloqueantes). */
export interface InventoryLoad {
  catalog: InventoryCatalog
  items: InventoryItem[]
  /** Avisos de reglas provisionales o pendientes; no impiden mostrar los datos. */
  warnings: ValidationIssue[]
}

/**
 * Puerto de acceso a datos. Hoy solo existe la implementación sintética; una implementación HTTP (ASP.NET Core)
 * debe devolver la misma carga sin tipar y pasar por `loadFromPayload`.
 */
export interface InventoryRepository {
  load(): Promise<InventoryLoad>
}

/** Los datos recibidos no son estructural o referencialmente coherentes. */
export class InventoryDataError extends Error {
  readonly issues: readonly (DtoIssue | ValidationIssue)[]

  constructor(message: string, issues: readonly (DtoIssue | ValidationIssue)[]) {
    super(message)
    this.name = 'InventoryDataError'
    this.issues = issues
  }
}

/** Frontera única: analiza (estructura y tipos), valida (coherencia) y ensambla. Lanza `InventoryDataError` si hay errores. */
export function loadFromPayload(payload: unknown): InventoryLoad {
  const parsed = parseInventoryCatalog(payload)
  if (!parsed.ok) throw new InventoryDataError('La carga de inventario no tiene la estructura esperada.', parsed.issues)
  const issues = validateCatalog(parsed.catalog)
  const errors = issues.filter((issue) => issue.severity === 'error')
  if (errors.length > 0) throw new InventoryDataError('Los datos de inventario no son coherentes.', errors)
  return { catalog: parsed.catalog, items: assembleInventory(parsed.catalog), warnings: issues.filter((issue) => issue.severity === 'warning') }
}

/** Repositorio de datos 100 % sintéticos (sin red ni persistencia). */
export function createSyntheticRepository(dataset: DatasetId, today?: Date): InventoryRepository {
  return {
    load: () =>
      new Promise((resolve) => {
        resolve(loadFromPayload(buildCatalog(dataset, today)))
      }),
  }
}
