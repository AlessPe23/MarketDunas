/**
 * Aritmética decimal exacta para cantidades y montos.
 *
 * Los valores DECIMAL(18,2) y DECIMAL(18,3) NO deben pasar por `Number`: un número de doble precisión solo
 * representa ~15–17 cifras significativas y alteraría valores como 9 999 999 999 999 999,99. Aquí los valores
 * viajan como cadenas decimales y se comparan/formatean con BigInt.
 */

/** Valor decimal serializado como cadena (p. ej. "1284000.500"). */
export type DecimalString = string

const DECIMAL_PATTERN = /^([+-]?)(\d+)(?:\.(\d+))?$/
export const MINUS = '−'
export const NBSP = ' '

interface Parts {
  negative: boolean
  integer: string
  fraction: string
}

function parseParts(value: DecimalString | number): Parts | null {
  // Un `number` de origen (p. ej. 0.1 + 0.2) se normaliza a 6 decimales para evitar artefactos binarios.
  const text = typeof value === 'number' ? (Number.isFinite(value) ? value.toFixed(6) : '') : value.trim()
  const match = DECIMAL_PATTERN.exec(text)
  if (!match) return null
  return { negative: match[1] === '-', integer: match[2] ?? '0', fraction: match[3] ?? '' }
}

/**
 * Convierte a entero escalado (valor × 10^scale) con redondeo «mitad alejándose de cero».
 * Devuelve null si el valor es nulo o no es un decimal válido.
 */
export function toScaled(value: DecimalString | number | null | undefined, scale: number): bigint | null {
  if (value === null || value === undefined) return null
  const parts = parseParts(value)
  if (!parts) return null
  const length = Math.max(parts.fraction.length, scale)
  let magnitude = BigInt(parts.integer + parts.fraction.padEnd(length, '0'))
  if (length > scale) {
    const divisor = 10n ** BigInt(length - scale)
    const remainder = magnitude % divisor
    magnitude /= divisor
    if (remainder * 2n >= divisor) magnitude += 1n
  }
  return parts.negative ? -magnitude : magnitude
}

/** Compara dos enteros escalados (nulos al final). */
export function compareScaled(a: bigint | null, b: bigint | null): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a < b ? -1 : a > b ? 1 : 0
}

export interface FormatDecimalOptions {
  maxFraction: number
  minFraction?: number
  locale?: string
}

const separatorsCache = new Map<string, { group: string; decimal: string }>()

function getSeparators(locale: string) {
  let cached = separatorsCache.get(locale)
  if (!cached) {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5)
    cached = {
      group: parts.find((part) => part.type === 'group')?.value ?? ',',
      decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    }
    separatorsCache.set(locale, cached)
  }
  return cached
}

/** Formatea según la configuración regional sin pasar por Number. El signo negativo usa U+2212. */
export function formatDecimal(value: DecimalString | number | null | undefined, options: FormatDecimalOptions): string {
  const { maxFraction, minFraction = 0, locale = 'es-PE' } = options
  const scaled = toScaled(value, maxFraction)
  if (scaled === null) return ''
  const negative = scaled < 0n
  const digits = (negative ? -scaled : scaled).toString().padStart(maxFraction + 1, '0')
  const integerRaw = digits.slice(0, digits.length - maxFraction)
  let fraction = digits.slice(digits.length - maxFraction)
  while (fraction.length > minFraction && fraction.endsWith('0')) fraction = fraction.slice(0, -1)
  const { group, decimal } = getSeparators(locale)
  const integer = integerRaw.replace(/\B(?=(\d{3})+(?!\d))/g, group)
  const isZero = BigInt(integerRaw + fraction.padEnd(maxFraction, '0')) === 0n
  return `${negative && !isZero ? MINUS : ''}${integer}${fraction ? decimal + fraction : ''}`
}

/** Cantidad (DECIMAL(18,3)) con hasta 3 decimales. */
export const formatQuantity = (value: DecimalString | number | null | undefined) => formatDecimal(value, { maxFraction: 3 })

/** Monto (DECIMAL(18,2)) en soles con 2 decimales. */
export const formatMoney = (value: DecimalString | number | null | undefined) => {
  const text = formatDecimal(value, { maxFraction: 2, minFraction: 2 })
  return text ? `S/${NBSP}${text}` : ''
}

/** Comprueba que el texto sea un decimal sin signo de exponente (admite signo y fracción). */
export function isDecimalString(value: unknown): value is DecimalString {
  return typeof value === 'string' && DECIMAL_PATTERN.test(value.trim())
}

/** Número de decimales significativos de una cadena decimal (sin contar ceros finales). */
export function decimalPlaces(value: DecimalString): number {
  const parts = parseParts(value)
  return parts ? parts.fraction.replace(/0+$/, '').length : 0
}

/** Compara dos valores decimales con la escala indicada; el nulo se ordena al final. Redondea como `toScaled`. */
export function compareDecimal(a: DecimalString | null | undefined, b: DecimalString | null | undefined, scale: number): number {
  return compareScaled(toScaled(a, scale), toScaled(b, scale))
}
