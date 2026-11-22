/** Recorta y colapsa espacios y saltos de línea. No altera el texto mostrado: se usa para comparar y buscar. */
export function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

/** Normaliza para búsqueda y orden: sin tildes, en minúsculas y con espacios colapsados. */
export function normalizeText(value: string | null | undefined): string {
  if (!value) return ''
  return collapseSpaces(value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase())
}
