import { describe, expect, it } from 'vitest'
import { MINUS, NBSP, compareDecimal, compareScaled, decimalPlaces, formatMoney, formatQuantity, isDecimalString, toScaled } from './decimal'

describe('decimal', () => {
  it('conserva los límites de DECIMAL(18,3) y DECIMAL(18,2) sin pasar por Number', () => {
    expect(formatQuantity('999999999999999.999')).toBe('999,999,999,999,999.999')
    expect(formatMoney('9999999999999999.99')).toBe(`S/${NBSP}9,999,999,999,999,999.99`)
    expect(formatQuantity('-999999999999999.999')).toBe(`${MINUS}999,999,999,999,999.999`)
    // Control: Number sí altera el valor.
    expect(String(Number('9999999999999999.99'))).not.toBe('9999999999999999.99')
  })

  it('distingue nulo de cero', () => {
    expect(formatMoney(null)).toBe('')
    expect(formatMoney('0')).toBe(`S/${NBSP}0.00`)
    expect(toScaled(null, 3)).toBeNull()
    expect(toScaled('0', 3)).toBe(0n)
  })

  it('no muestra «−0» y recorta ceros finales de cantidades', () => {
    expect(formatQuantity('-0.0004')).toBe('0')
    expect(formatQuantity('12480.900')).toBe('12,480.9')
    expect(formatQuantity('36')).toBe('36')
  })

  it('normaliza números de origen con artefactos binarios', () => {
    expect(formatQuantity(0.1 + 0.2)).toBe('0.3')
  })

  it('redondea mitad alejándose de cero', () => {
    expect(formatMoney('1.005')).toBe(`S/${NBSP}1.01`)
    expect(formatMoney('-1.005')).toBe(`S/${NBSP}${MINUS}1.01`)
  })

  it('ordena de forma exacta y deja los nulos al final', () => {
    const values = ['999999999999999.999', '-999999999999999.999', null, '0', '999999999999999.998']
    const sorted = values.map((value) => toScaled(value, 3)).sort(compareScaled)
    expect(sorted.map((value) => (value === null ? null : value.toString()))).toEqual([
      '-999999999999999999',
      '0',
      '999999999999999998',
      '999999999999999999',
      null,
    ])
  })

  it('rechaza cadenas no decimales', () => {
    expect(toScaled('1e3', 2)).toBeNull()
    expect(toScaled('abc', 2)).toBeNull()
  })

  it('valida y mide cadenas decimales', () => {
    expect(isDecimalString('-0.50')).toBe(true)
    expect(isDecimalString('1e3')).toBe(false)
    expect(isDecimalString(12)).toBe(false)
    expect(decimalPlaces('12.500')).toBe(1)
    expect(decimalPlaces('7')).toBe(0)
  })

  it('compara con escala', () => {
    expect(compareDecimal('0.1', '0.10', 3)).toBe(0)
    expect(compareDecimal('-1', null, 3)).toBe(-1)
    expect(compareDecimal(null, null, 3)).toBe(0)
  })
})
