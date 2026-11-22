import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/** Ancho de contenido (px) de un elemento, actualizado con ResizeObserver. */
export function useElementWidth<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => {
      setWidth(Math.round(element.clientWidth))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [])
  return [ref, width]
}
