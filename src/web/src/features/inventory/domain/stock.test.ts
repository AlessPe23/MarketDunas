import { describe, expect, it } from 'vitest'
import { classifyStock } from './stock'

const stateOf = (stock: string | null, referenceLevel: string | null = '10') => classifyStock({ stock, referenceLevel })

describe('classifyStock (clasificación PROVISIONAL de cuatro estados)', () => {
  it('sin dato frente a cero', () => {
    expect(stateOf(null)).toBe('unknown')
    expect(stateOf('0')).toBe('out')
    expect(stateOf('0.000')).toBe('out')
  })

  it('el límite es el nivel de referencia: igual a la referencia es «en stock»', () => {
    expect(stateOf('9.999')).toBe('low')
    expect(stateOf('10')).toBe('in-stock')
    expect(stateOf('10.001')).toBe('in-stock')
    expect(stateOf('0.001')).toBe('low')
  })

  it('sin nivel de referencia, un stock positivo se considera «en stock»', () => {
    expect(stateOf('3', null)).toBe('in-stock')
  })

  it('el stock negativo NO es un estado (null), incluso en los extremos', () => {
    expect(stateOf('-1')).toBeNull()
    expect(stateOf('-0.001')).toBeNull()
    expect(stateOf('-999999999999999.999')).toBeNull()
  })

  it('compara con precisión exacta en los extremos del esquema', () => {
    expect(stateOf('999999999999999.998', '999999999999999.999')).toBe('low')
    expect(stateOf('999999999999999.999', '999999999999999.999')).toBe('in-stock')
  })
})
