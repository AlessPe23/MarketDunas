import { decimalPlaces, isDecimalString, toScaled } from '@/shared/lib/decimal'
import { collapseSpaces } from '@/shared/lib/text'
import type { InventoryCatalog } from './model'
import { PROVISIONAL } from './provisional'

/**
 * Validación de coherencia de un catálogo ya tipado. Función pura.
 *  - `error`: el dato es estructuralmente incoherente (duplicados, referencias rotas, decimales o fechas inválidos).
 *  - `warning`: el dato es válido pero toca una regla PROVISIONAL o pendiente (límites D7, stock negativo PR-19,
 *    decimales en unidades enteras). No bloquea: la regla aún no está aprobada.
 */
export interface ValidationIssue {
  severity: 'error' | 'warning'
  code: string
  entity: 'unit' | 'category' | 'supplier' | 'product' | 'stock'
  id: string | number
  message: string
}

const WALL_DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/

/** Verifica que la cadena sea un DATETIME2 «de pared» real (calendario y hora válidos), sin interpretarla en zona horaria. */
export function isValidWallDateTime(value: string): boolean {
  const match = WALL_DATETIME.exec(value)
  if (!match) return false
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number) as [number, number, number, number, number, number]
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && hour < 24 && minute < 60 && second < 60
}

function duplicates<T>(values: readonly T[]): Set<T> {
  const seen = new Set<T>()
  const repeated = new Set<T>()
  for (const value of values) {
    if (seen.has(value)) repeated.add(value)
    seen.add(value)
  }
  return repeated
}

export function validateCatalog(catalog: InventoryCatalog): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const add = (severity: ValidationIssue['severity'], code: string, entity: ValidationIssue['entity'], id: string | number, message: string) => {
    issues.push({ severity, code, entity, id, message })
  }
  const limits = PROVISIONAL.limits

  const unitCodes = new Set(catalog.units.map((unit) => unit.code))
  const categoryIds = new Set(catalog.categories.map((category) => category.id))
  const supplierIds = new Set(catalog.suppliers.map((supplier) => supplier.id))
  const productIds = new Set(catalog.products.map((product) => product.id))

  for (const code of duplicates(catalog.units.map((unit) => unit.code))) add('error', 'duplicate-id', 'unit', code, 'Código de unidad duplicado.')
  for (const id of duplicates(catalog.categories.map((category) => category.id))) add('error', 'duplicate-id', 'category', id, 'Identificador de categoría duplicado.')
  for (const id of duplicates(catalog.suppliers.map((supplier) => supplier.id))) add('error', 'duplicate-id', 'supplier', id, 'Identificador de proveedor duplicado.')
  for (const id of duplicates(catalog.products.map((product) => product.id))) add('error', 'duplicate-id', 'product', id, 'Identificador de producto duplicado.')
  for (const code of duplicates(catalog.products.map((product) => product.code.trim().toUpperCase()))) add('error', 'duplicate-code', 'product', code, 'Código de producto duplicado.')
  for (const id of duplicates(catalog.stock.map((record) => record.productId))) add('error', 'duplicate-stock', 'stock', id, 'Más de un registro de existencia para el mismo producto.')

  for (const unit of catalog.units) {
    if (unit.symbol.trim() === '') add('error', 'empty-symbol', 'unit', unit.code, 'La unidad no tiene símbolo.')
    if (unit.symbol.length > limits.unitSymbolMax) add('warning', 'symbol-too-long', 'unit', unit.code, `Símbolo mayor a ${limits.unitSymbolMax} caracteres (límite propuesto, no aprobado).`)
  }

  for (const product of catalog.products) {
    if (collapseSpaces(product.name) === '') add('error', 'empty-name', 'product', product.id, 'El producto no tiene nombre.')
    if (product.code.trim() === '') add('error', 'empty-code', 'product', product.id, 'El producto no tiene código.')
    if (product.name.length > limits.nameMax) add('warning', 'name-too-long', 'product', product.id, `Nombre mayor a ${limits.nameMax} caracteres (límite propuesto, no aprobado).`)
    if (product.code.length > limits.codeMax) add('warning', 'code-too-long', 'product', product.id, `Código mayor a ${limits.codeMax} caracteres (límite propuesto, no aprobado).`)
    if (!unitCodes.has(product.unitCode)) add('error', 'missing-unit', 'product', product.id, `La unidad «${product.unitCode}» no existe.`)
    if (product.categoryId !== null && !categoryIds.has(product.categoryId)) add('error', 'missing-category', 'product', product.id, `La categoría ${product.categoryId} no existe.`)
    if (product.supplierId !== null && !supplierIds.has(product.supplierId)) add('error', 'missing-supplier', 'product', product.id, `El proveedor ${product.supplierId} no existe.`)
    for (const [field, value] of [['purchasePrice', product.purchasePrice], ['salePrice', product.salePrice]] as const) {
      if (value === null) continue
      if (!isDecimalString(value)) add('error', 'invalid-decimal', 'product', product.id, `${field} no es un decimal válido.`)
      else if (decimalPlaces(value) > limits.priceScale) add('warning', 'scale-exceeded', 'product', product.id, `${field} tiene más de ${limits.priceScale} decimales (escala propuesta).`)
    }
  }

  const unitByCode = new Map(catalog.units.map((unit) => [unit.code, unit]))
  const productById = new Map(catalog.products.map((product) => [product.id, product]))
  for (const record of catalog.stock) {
    if (!productIds.has(record.productId)) {
      add('error', 'orphan-stock', 'stock', record.productId, 'Existencia de un producto que no existe.')
      continue
    }
    if (!isValidWallDateTime(record.updatedAt)) add('error', 'invalid-date', 'stock', record.productId, 'Fecha de actualización inválida.')
    if (!isDecimalString(record.referenceLevel)) add('error', 'invalid-decimal', 'stock', record.productId, 'Nivel de referencia inválido.')
    if (record.quantity === null) continue
    if (!isDecimalString(record.quantity)) {
      add('error', 'invalid-decimal', 'stock', record.productId, 'Cantidad inválida.')
      continue
    }
    if (decimalPlaces(record.quantity) > limits.quantityScale) add('warning', 'scale-exceeded', 'stock', record.productId, `Cantidad con más de ${limits.quantityScale} decimales (escala propuesta).`)
    const scaled = toScaled(record.quantity, limits.quantityScale)
    if (scaled !== null && scaled < 0n) add('warning', 'negative-stock', 'stock', record.productId, `Stock negativo: tratamiento pendiente (${PROVISIONAL.negativeStock.ruleId}).`)
    const unit = unitByCode.get(productById.get(record.productId)?.unitCode ?? '')
    if (unit && !unit.allowsFractions && decimalPlaces(record.quantity) > 0) add('warning', 'fraction-on-integer-unit', 'stock', record.productId, `La unidad «${unit.symbol}» no admite fracciones (propiedad provisional) y la cantidad tiene decimales.`)
  }

  return issues
}
