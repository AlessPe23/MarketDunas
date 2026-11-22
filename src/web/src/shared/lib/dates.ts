/**
 * Fechas DATETIME2 (sin zona horaria): se tratan como valores «de pared» (YYYY-MM-DDTHH:mm:ss) y NUNCA se
 * convierten a UTC ni a la zona local, para no desplazar el día. Se formatean desde sus componentes.
 */
const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})/

const dateFormat = new Intl.DateTimeFormat('es-PE', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' })

export function formatWallDate(value: string): string {
  const match = WALL_CLOCK.exec(value)
  if (!match) return '—'
  const [, year, month, day] = match
  return dateFormat.format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))))
}

/** Verdadero si la fecha (solo día) es posterior al día local de `now`. No es una regla de negocio: solo una marca informativa. */
export function isFutureWallDate(value: string, now: Date = new Date()): boolean {
  const match = WALL_CLOCK.exec(value)
  if (!match) return false
  const pad = (n: number) => String(n).padStart(2, '0')
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return `${match[1]}-${match[2]}-${match[3]}` > today
}

/** Serializa un día local como DATETIME2 a medianoche. */
export function toWallDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`
}
