const rules = new Intl.PluralRules('es')
const numbers = new Intl.NumberFormat('es-PE')

/** «1 producto» / «2 productos» con el número formateado. */
export function pluralize(count: number, one: string, other: string): string {
  return `${numbers.format(count)} ${rules.select(count) === 'one' ? one : other}`
}
