import { useEffect } from 'react'

/** Título de documento por pantalla: «Pantalla · MarketDunas». */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · MarketDunas`
  }, [title])
}
