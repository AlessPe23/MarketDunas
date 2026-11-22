import { useSyncExternalStore } from 'react'

/** Suscripción a una consulta de medios. Devuelve `false` en entornos sin `matchMedia`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', notify)
      return () => {
        list.removeEventListener('change', notify)
      }
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
