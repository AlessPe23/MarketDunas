import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Altura de la cabecera de aplicación en rem (--topbar-h): el panel se fija debajo de ella. */
const TOPBAR_REM = 3

/**
 * Panel acoplado: limita la altura máxima al espacio visible bajo su posición actual (tras cabecera, indicadores y
 * filtros), de modo que el pie con acciones se vea desde que se abre y el contenido haga scroll interno.
 *
 * - Altura mínima: 26 rem (o el viewport menos márgenes). Si el espacio libre es menor al abrir, la página se
 *   desplaza lo justo para alcanzarla.
 * - La altura se recalcula mientras se desplaza la página (el panel es sticky) y al cambiar el tamaño de la ventana.
 */
export function useDockedFit(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return undefined
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    let frame = 0

    const fit = (scrollIfNeeded: boolean) => {
      const minHeight = Math.min(26 * rem, window.innerHeight - TOPBAR_REM * rem - 2 * rem)
      let top = Math.max((TOPBAR_REM + 1) * rem, element.getBoundingClientRect().top)
      let available = window.innerHeight - top - rem
      if (scrollIfNeeded && available < minHeight) {
        window.scrollBy(0, Math.ceil(minHeight - available))
        top = Math.max((TOPBAR_REM + 1) * rem, element.getBoundingClientRect().top)
        available = window.innerHeight - top - rem
      }
      element.style.maxHeight = `${Math.round(Math.max(available, minHeight))}px`
    }
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        fit(false)
      })
    }

    fit(true)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
      element.style.maxHeight = ''
    }
  }, [ref, enabled])
}
