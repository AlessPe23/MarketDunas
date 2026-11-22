import { useEffect, useState } from 'react'
import type { InventoryLoad, InventoryRepository } from '../data/repository'

export type InventoryResource =
  | { status: 'loading' }
  | { status: 'ready'; load: InventoryLoad }
  | { status: 'error'; error: Error }

interface Settled {
  repository: InventoryRepository
  attempt: number
  resource: InventoryResource
}

/**
 * Carga el inventario desde un repositorio. El estado «cargando» se deriva (no se escribe en el efecto): mientras el
 * último resultado resuelto no corresponda al repositorio e intento actuales, el recurso está cargando.
 * Incrementar `attempt` reintenta la carga.
 */
export function useInventory(repository: InventoryRepository, attempt: number): InventoryResource {
  const [settled, setSettled] = useState<Settled | null>(null)

  useEffect(() => {
    let cancelled = false
    repository.load().then(
      (load) => {
        if (!cancelled) setSettled({ repository, attempt, resource: { status: 'ready', load } })
      },
      (reason: unknown) => {
        if (!cancelled) setSettled({ repository, attempt, resource: { status: 'error', error: reason instanceof Error ? reason : new Error(String(reason)) } })
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository, attempt])

  return settled && settled.repository === repository && settled.attempt === attempt ? settled.resource : { status: 'loading' }
}
