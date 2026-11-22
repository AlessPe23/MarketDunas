import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

type Dataset = 'demo' | 'worst-case' | 'large' | 'empty'

async function open(page: Page, dataset: Dataset = 'demo', width = 1920, height = 1000) {
  await page.setViewportSize({ width, height })
  await page.goto('/inventario')
  await expect(page.getByRole('heading', { level: 1, name: 'Productos e inventario' })).toBeVisible()
  if (dataset !== 'demo') await page.getByLabel('Conjunto de datos').selectOption(dataset)
}

const results = (page: Page) => page.locator('p[aria-live="polite"]')
const pager = (page: Page) => page.getByRole('navigation', { name: 'Paginación de productos' })

/** Texto de cada fila de la tabla en una columna (índice 1-based entre las celdas visibles). */
async function column(page: Page, header: string): Promise<string[]> {
  const index = await page.getByRole('columnheader').evaluateAll((cells, name) => cells.findIndex((cell) => cell.textContent.trim() === name), header)
  expect(index, `columna «${header}» visible`).toBeGreaterThanOrEqual(0)
  return page.locator('tbody tr').evaluateAll((rows, position) => rows.map((row) => (row.children[position]?.textContent ?? '').replace(/\s+/g, ' ').trim()), index)
}

test.describe('conjuntos de datos y totales', () => {
  test('los tamaños coinciden con los conjuntos y los conteos de estado suman los productos clasificables', async ({ page }) => {
    for (const [dataset, total, inconsistent] of [['demo', 186, 0], ['worst-case', 43, 2], ['large', 1200, 0]] as const) {
      await open(page, dataset)
      await expect(page.getByText(new RegExp(`^${total.toLocaleString('es-PE')} productos$`))).toBeVisible()
      const values = await page.getByRole('group', { name: 'Filtrar por estado de stock' }).getByRole('button').evaluateAll((buttons) => buttons.map((button) => Number(button.textContent.replace(/\D/g, ''))))
      expect(values.reduce((sum, value) => sum + value, 0), `${dataset}: suma de cuatro estados`).toBe(total - inconsistent)
    }
  })

  test('sin productos: mensaje vacío, sin paginación y controles deshabilitados', async ({ page }) => {
    await open(page, 'empty')
    await expect(page.getByText('Todavía no hay productos')).toBeVisible()
    await expect(pager(page)).toBeHidden()
    await expect(page.getByRole('searchbox', { name: 'Buscar productos' })).toBeDisabled()
  })
})

test.describe('categorías', () => {
  test('el filtro por categoría muestra exactamente los productos indicados en su etiqueta', async ({ page }) => {
    await open(page)
    const select = page.getByLabel('Filtrar por categoría')
    const labels = await select.locator('option').allTextContents()
    expect(labels.length).toBe(11)
    const sum = labels.slice(1).reduce((total, label) => total + Number(/\((\d+)\)$/.exec(label)?.[1] ?? 0), 0)
    expect(sum).toBe(186)
    const bebidas = labels.find((label) => label.startsWith('Bebidas')) ?? ''
    const expected = Number(/\((\d+)\)$/.exec(bebidas)?.[1])
    await select.selectOption({ label: bebidas })
    await expect(results(page)).toContainText(`${expected} resultado`)
    await page.getByLabel('Filas por página').selectOption('50')
    const categories = await page.locator('tbody tr').count()
    expect(categories).toBe(Math.min(expected, 50))
  })

  test('la categoría se combina con el filtro de estado y «Quitar filtros» la restablece', async ({ page }) => {
    await open(page)
    await page.getByLabel('Filtrar por categoría').selectOption({ index: 1 })
    const afterCategory = Number(/^(\d+)/.exec((await results(page).textContent()) ?? '')?.[1])
    expect(afterCategory).toBeGreaterThan(0)
    expect(afterCategory).toBeLessThan(186)
    await page.getByRole('button', { name: /Agotado/ }).click()
    const afterState = Number(/^(\d+)/.exec((await results(page).textContent()) ?? '')?.[1])
    expect(afterState).toBeLessThan(afterCategory)
    await page.getByRole('button', { name: 'Quitar filtros' }).click()
    await expect(results(page)).toContainText('186 resultados')
    await expect(page.getByLabel('Filtrar por categoría')).toHaveValue('')
  })
})

test.describe('orden', () => {
  test('por stock con valores extremos: orden exacto y nulos al final en ambas direcciones', async ({ page }) => {
    await open(page, 'worst-case')
    await page.getByLabel('Filas por página').selectOption('50')
    await page.getByRole('button', { name: 'Stock', exact: true }).click()
    let stock = await column(page, 'Stock')
    expect(stock[0]).toBe('−999,999,999,999,999.999 kg')
    expect(stock.at(-1)).toContain('Sin dato')
    await page.getByRole('button', { name: 'Stock', exact: true }).click()
    stock = await column(page, 'Stock')
    expect(stock[0]).toBe('999,999,999,999,999.999 kg')
    expect(stock.at(-1)).toContain('Sin dato')
  })

  test('por precio de venta: el mayor valor del esquema se ordena exactamente y los sin precio quedan al final', async ({ page }) => {
    await open(page, 'worst-case')
    await page.getByLabel('Filas por página').selectOption('50')
    await page.getByRole('button', { name: 'Precio' }).click()
    await page.getByRole('button', { name: 'Precio' }).click()
    const prices = await column(page, 'Precio')
    expect(prices[0]).toBe('S/ 9,999,999,999,999,999.99'.replace(' ', ' '))
    expect(prices.at(-1)).toContain('Sin precio')
  })

  test('por fecha: la fecha 1970 se conserva y ocupa el extremo', async ({ page }) => {
    await open(page, 'worst-case')
    await page.getByLabel('Filas por página').selectOption('50')
    await page.getByRole('button', { name: 'Actualizado' }).click()
    const dates = await column(page, 'Actualizado')
    expect(dates.at(-1)).toContain('Sin fecha')
    await page.getByRole('button', { name: 'Actualizado' }).click()
    const ascending = await column(page, 'Actualizado')
    expect(ascending[0]).toMatch(/^01 ene\.? 1970/)
    expect(ascending.some((text) => /31 dic\.? 1989/.test(text))).toBe(true)
  })
})

test.describe('paginación', () => {
  test('186 productos con 50 por página: 4 páginas, última con 36 filas y rango correcto', async ({ page }) => {
    await open(page)
    await page.getByLabel('Filas por página').selectOption('50')
    await expect(pager(page)).toContainText('1–50 de 186 · Página 1 de 4')
    await pager(page).getByRole('button', { name: 'Página 4' }).click()
    await expect(pager(page)).toContainText('151–186 de 186 · Página 4 de 4')
    await expect(page.locator('tbody tr')).toHaveCount(36)
    await expect(pager(page).getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
    await pager(page).getByRole('button', { name: 'Página anterior' }).click()
    await expect(pager(page)).toContainText('101–150 de 186 · Página 3 de 4')
  })

  test('1 200 productos: 120 páginas con 10 por página', async ({ page }) => {
    await open(page, 'large')
    await expect(pager(page)).toContainText('1–10 de 1,200 · Página 1 de 120')
    await expect(page.locator('tbody tr')).toHaveCount(10)
  })

  test('no repite ni omite productos al recorrer las páginas', async ({ page }) => {
    await open(page)
    await page.getByLabel('Filas por página').selectOption('50')
    const seen: string[] = []
    for (let current = 1; current <= 4; current += 1) {
      if (current > 1) await pager(page).getByRole('button', { name: `Página ${current}` }).click()
      seen.push(...(await page.locator('tbody tr').evaluateAll((rows) => rows.map((row) => row.querySelector('td:nth-child(2) [class*="code"]')?.textContent ?? ''))))
    }
    expect(seen).toHaveLength(186)
    expect(new Set(seen).size).toBe(186)
    expect(seen.every((code) => code.startsWith('DEMO-'))).toBe(true)
  })

  test('el cambio de filtro regresa a la primera página', async ({ page }) => {
    await open(page)
    await page.getByLabel('Filas por página').selectOption('50')
    await pager(page).getByRole('button', { name: 'Página 2' }).click()
    await expect(pager(page)).toContainText('Página 2 de 4')
    await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('arroz')
    await expect(pager(page)).toContainText('Página 1 de 1')
  })
})

test.describe('stock negativo, cero y datos opcionales', () => {
  test('el stock negativo conserva su cantidad y muestra la advertencia fuera de los estados', async ({ page }) => {
    await open(page, 'worst-case')
    await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('stock negativo')
    const row = page.locator('tbody tr').filter({ hasText: 'Producto con stock negativo' })
    await expect(row).toContainText('−3 und')
    await expect(row.getByRole('note')).toHaveText('Dato inconsistente · Clasificación pendiente')
    await expect(row.getByText('Agotado')).toHaveCount(0)
  })

  test('cero es «Agotado», sin existencia es «Sin dato» y el precio cero no se confunde con sin precio', async ({ page }) => {
    await open(page, 'worst-case')
    await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('stock cero y precio cero')
    const zero = page.locator('tbody tr').first()
    await expect(zero).toContainText('0 und')
    await expect(zero).toContainText('Agotado')
    await expect(zero).toContainText('S/ 0.00')
    await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('sin existencia registrada')
    const none = page.locator('tbody tr').first()
    await expect(none).toContainText('Sin dato')
    await expect(none).toContainText('Sin precio')
  })

  test('el detalle muestra categoría, marca, ambos precios y ausencias sin inventar valores', async ({ page }) => {
    await open(page, 'worst-case')
    await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('sin existencia registrada')
    await page.getByRole('button', { name: /^Acciones para / }).first().focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')
    const panel = page.getByRole('complementary', { name: /./ })
    await expect(panel.getByText('Sin categoría')).toBeVisible()
    await expect(panel.getByText('Sin marca')).toBeVisible()
    await expect(panel.getByText('Sin proveedor')).toBeVisible()
    await expect(panel.getByText('Sin precio')).toHaveCount(2)
    await page.keyboard.press('Escape')
    await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('DEMO-W-9001')
    await page.getByRole('button', { name: /^Acciones para / }).first().focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('complementary', { name: /./ }).getByText('S/ 9,876,543.21')).toBeVisible()
    await expect(page.getByRole('complementary', { name: /./ }).getByText('S/ 12,345,678.90')).toBeVisible()
  })
})

test.describe('texto con caracteres especiales', () => {
  test('el HTML del nombre se muestra como texto y no se ejecuta ni se interpreta', async ({ page }) => {
    await open(page, 'worst-case')
    await page.getByLabel('Filas por página').selectOption('50')
    await expect(page.getByText('<script>alert(1)</script>', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Gaseosa <b>zero</b> 500 ml &amp; promo **limón**').first()).toBeVisible()
    expect(await page.locator('tbody script, tbody b').count()).toBe(0)
  })
})

test.describe('responsive: la información importante no se pierde', () => {
  for (const width of [320, 480, 768, 1024, 1280, 1440, 1920]) {
    test(`peor caso a ${width} px: producto legible, control de apertura accesible y sin desbordamiento`, async ({ page }) => {
      await open(page, 'worst-case', width, 900)
      const row = page.locator('tbody tr').first()
      const productCell = row.locator('td').nth(1)
      const box = await productCell.boundingBox()
      expect((box?.width ?? 0) / 16, 'ancho de la celda de producto (rem)').toBeGreaterThanOrEqual(13.9)
      const control = width < 768 ? row.getByRole('button', { name: /^Ver detalle de / }) : row.getByRole('button', { name: /^Acciones para / })
      await expect(control).toBeVisible()
      await control.scrollIntoViewIfNeeded()
      const controlBox = await control.boundingBox()
      expect(controlBox?.x ?? -1).toBeGreaterThanOrEqual(0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
      await expect(page.getByRole('group', { name: 'Filtrar por estado de stock' })).toBeVisible()
    })
  }
})
