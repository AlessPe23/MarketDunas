import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/**
 * Indica si un contenedor tiene desplazamiento vertical. Una región desplazable debe poder recibir el foco para que
 * el teclado pueda desplazarla (WCAG 2.1.1); se enfoca solo cuando realmente se desplaza.
 */
export function useScrollable<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [scrollable, setScrollable] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => {
      setScrollable(element.scrollHeight > element.clientHeight + 1)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    for (const child of element.children) observer.observe(child)
    return () => {
      observer.disconnect()
    }
  }, [])
  return [ref, scrollable]
}
