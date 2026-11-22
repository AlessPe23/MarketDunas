import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Comprobaciones automáticas con axe-core (reglas WCAG 2.0/2.1/2.2 A y AA que axe puede evaluar).
 * NO sustituyen una auditoría de accesibilidad: no detectan problemas de uso real con lector de pantalla,
 * teclado en distintos navegadores, táctil, zoom ni contenido semántico incorrecto pero válido.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  return results.violations.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} nodos)`)
}

test.describe('axe-core', () => {
  for (const width of [320, 480, 768, 1024, 1440, 1920]) {
    test(`inventario a ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/inventario')
      await expect(page.getByRole('table')).toBeVisible()
      expect(await violations(page)).toEqual([])
    })
  }

  test('inventario con el conjunto de peor caso', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/inventario')
    await page.getByLabel('Conjunto de datos').selectOption('worst-case')
    await page.getByLabel('Filas por página').selectOption('50')
    expect(await violations(page)).toEqual([])
  })

  test('estados de carga, error y sin productos', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto('/inventario')
    await page.getByLabel('Simular estado').selectOption('loading')
    expect(await violations(page)).toEqual([])
    await page.getByLabel('Simular estado').selectOption('error')
    await expect(page.getByRole('alert')).toBeVisible()
    expect(await violations(page)).toEqual([])
    await page.getByLabel('Simular estado').selectOption('normal')
    await page.getByLabel('Conjunto de datos').selectOption('empty')
    await expect(page.getByText('Todavía no hay productos')).toBeVisible()
    expect(await violations(page)).toEqual([])
  })

  test('menú de acciones abierto', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/inventario')
    await page.getByRole('button', { name: /^Acciones para / }).first().click()
    await expect(page.getByRole('menu')).toBeVisible()
    expect(await violations(page)).toEqual([])
  })

  test('panel de detalle acoplado y hoja modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/inventario')
    await page.getByRole('button', { name: /^Acciones para / }).first().focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('complementary', { name: /./ })).toBeVisible()
    expect(await violations(page)).toEqual([])
    await page.keyboard.press('Escape')
    await page.setViewportSize({ width: 480, height: 800 })
    await page.getByRole('button', { name: /^Ver detalle de / }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await violations(page)).toEqual([])
  })

  test('selección activa con barra de acciones', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto('/inventario')
    await page.getByRole('checkbox', { name: 'Seleccionar los productos de esta página' }).check()
    await expect(page.getByRole('region', { name: 'Acciones sobre la selección' })).toBeVisible()
    expect(await violations(page)).toEqual([])
  })

  test('páginas provisional, no encontrada y galería del sistema de diseño', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    for (const path of ['/pedidos', '/no-existe', '/sistema-de-diseno']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(await violations(page), path).toEqual([])
    }
  })

  test('cajón de navegación móvil abierto', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 })
    await page.goto('/inventario')
    await page.getByRole('button', { name: 'Abrir navegación' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await violations(page)).toEqual([])
  })
})

test('sin errores ni advertencias en consola en los recorridos principales', async ({ page }) => {
  const problems: string[] = []
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/inventario')
  await page.getByLabel('Conjunto de datos').selectOption('large')
  await page.getByRole('button', { name: /^Acciones para / }).first().focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 480, height: 800 })
  await page.getByRole('button', { name: /^Ver detalle de / }).first().click()
  await page.keyboard.press('Escape')
  await page.goto('/sistema-de-diseno')
  await page.goto('/reposicion')
  expect(problems).toEqual([])
})
