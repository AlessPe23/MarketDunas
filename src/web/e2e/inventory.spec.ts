import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function open(page: Page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height })
  await page.goto('/inventario')
  await expect(page.getByRole('heading', { level: 1, name: 'Productos e inventario' })).toBeVisible()
}

async function selectDataset(page: Page, dataset: 'demo' | 'worst-case' | 'large' | 'empty') {
  await page.getByLabel('Conjunto de datos').selectOption(dataset)
}

test.describe('navegación y estructura', () => {
  test('la barra lateral marca la página actual y las opciones no implementadas como provisionales', async ({ page }) => {
    await open(page)
    const nav = page.getByRole('navigation', { name: 'Principal' })
    await expect(nav.getByRole('link', { name: /Inventario/ })).toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('link', { name: /Reposición/ })).toContainText('Provisional')
    await nav.getByRole('link', { name: /Pedidos/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Pedidos' })).toBeVisible()
    await expect(page.getByText('Sección provisional')).toBeVisible()
  })

  test('el enlace «Saltar al contenido» es el primer elemento enfocable', async ({ page }) => {
    await open(page)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused()
  })

  test('por debajo de 768 px la navegación es un cajón accesible', async ({ page }) => {
    await open(page, 480, 800)
    await page.getByRole('button', { name: 'Abrir navegación' }).click()
    const drawer = page.getByRole('dialog', { name: 'MarketDunas' })
    await expect(drawer).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(page.getByRole('button', { name: 'Abrir navegación' })).toBeFocused()
  })
})

test.describe('inventario: datos, búsqueda y filtros', () => {
  test('los cuatro conteos suman el total (sin datos inconsistentes) y los datos se identifican como de demostración', async ({ page }) => {
    await open(page)
    await expect(page.getByText('Datos de demostración.')).toBeVisible()
    const group = page.getByRole('group', { name: 'Filtrar por estado de stock' })
    const values = await group.getByRole('button').evaluateAll((buttons) => buttons.map((button) => Number(button.textContent.replace(/\D/g, ''))))
    expect(values).toHaveLength(4)
    expect(values.reduce((sum, value) => sum + value, 0)).toBe(186)
  })

  test('la búsqueda ignora tildes, mayúsculas y espacios; solo espacios equivale a vacío', async ({ page }) => {
    await open(page)
    await selectDataset(page, 'worst-case')
    const search = page.getByRole('searchbox', { name: 'Buscar productos' })
    const results = page.locator('p[aria-live="polite"]')
    await search.fill('  AJI   panca  ')
    await expect(results).toHaveText(/^1 resultado(?!s)/)
    await search.fill('ñaña')
    await expect(results).toHaveText(/^1 resultado(?!s)/)
    await search.fill('   ')
    await expect(results).toHaveText(/^\d{2,} resultados/)
    await search.fill('zzzz sin coincidencias')
    await expect(page.getByText('No hay productos para esta búsqueda')).toBeVisible()
    await page.getByRole('button', { name: 'Quitar filtros' }).first().click()
    await expect(search).toHaveValue('')
  })

  test('el filtro de estado usa botones de alternancia y «Agotado» no incluye stock negativo', async ({ page }) => {
    await open(page)
    await selectDataset(page, 'worst-case')
    const out = page.getByRole('button', { name: /Agotado/ })
    await out.click()
    await expect(out).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('note').filter({ hasText: 'Dato inconsistente' })).toHaveCount(0)
    await expect(page.getByText('Producto con stock cero y precio cero')).toBeVisible()
  })

  test('precisión decimal en los límites del esquema propuesto y advertencia de stock negativo', async ({ page }) => {
    await open(page, 1920, 1000)
    await selectDataset(page, 'worst-case')
    await page.getByLabel('Filas por página').selectOption('50')
    await expect(page.getByText('999,999,999,999,999.999 kg', { exact: true })).toBeVisible()
    await expect(page.getByText('9,999,999,999,999,999.99')).toBeVisible()
    await expect(page.getByText('−999,999,999,999,999.999 kg', { exact: true })).toBeVisible()
    await expect(page.getByRole('note').filter({ hasText: 'Dato inconsistente · Clasificación pendiente' }).first()).toBeVisible()
  })
})

test.describe('selección y acciones masivas', () => {
  test('la selección persiste al filtrar, cuenta los no visibles y las acciones los incluyen', async ({ page }) => {
    await open(page)
    await page.getByRole('checkbox', { name: 'Seleccionar los productos de esta página' }).check()
    await page.getByRole('button', { name: /Seleccionar los \d+ resultados/ }).click()
    await expect(page.getByText('186 productos seleccionados')).toBeVisible()
    await page.getByRole('button', { name: /Agotado/ }).click()
    await expect(page.getByText(/\d+ fuera del filtro actual/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exportar selección (186)' })).toBeVisible()
    await page.getByRole('button', { name: 'Exportar selección (186)' }).click()
    await expect(page.getByRole('region', { name: /Notifications|Notificaciones/ }).getByText(/186 seleccionados \(incluye \d+ fuera del filtro\)/)).toBeVisible()
  })
})

test.describe('menú de acciones y panel de detalle (≥768 px)', () => {
  test('el menú ⋮ funciona con teclado y devuelve el foco', async ({ page }) => {
    await open(page)
    const firstKebab = page.getByRole('button', { name: /^Acciones para / }).first()
    await firstKebab.focus()
    await page.keyboard.press('Enter')
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Ver detalle' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: 'Editar producto' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(firstKebab).toBeFocused()
  })

  test('panel acoplado a 1440 px: pie visible al abrir, Escape lo cierra y devuelve el foco', async ({ page }) => {
    for (const height of [900, 768, 480]) {
      await open(page, 1440, height)
      await selectDataset(page, 'worst-case')
      const kebab = page.getByRole('button', { name: /^Acciones para DEMO-W-9001$/ })
      await page.getByLabel('Filas por página').selectOption('50')
      await kebab.focus()
      await page.keyboard.press('Enter')
      await page.keyboard.press('Enter')
      const panel = page.getByRole('complementary', { name: /./ })
      await expect(panel).toBeVisible()
      await expect(page.getByRole('button', { name: 'Cerrar detalle' })).toBeFocused()
      const footer = panel.getByRole('button', { name: 'Añadir a pedido' })
      await expect(footer).toBeVisible()
      const box = await panel.getByRole('button', { name: 'Desactivar producto' }).boundingBox()
      expect(box).not.toBeNull()
      expect((box?.y ?? 0) + (box?.height ?? 0), `pie visible con ${height} px de alto`).toBeLessThanOrEqual(height + 1)
      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(kebab).toBeFocused()
    }
  })

  test('a 1024 px el detalle es una hoja modal con foco atrapado y devolución de foco', async ({ page }) => {
    await open(page, 1024, 768)
    const kebab = page.getByRole('button', { name: /^Acciones para / }).first()
    await kebab.focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter')
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    await expect(sheet.getByRole('button', { name: 'Desactivar producto' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(kebab).toBeFocused()
  })
})

test.describe('pantallas estrechas (<768 px)', () => {
  test('sin menú ⋮ en la tabla: el nombre abre el detalle y las acciones están en el panel', async ({ page }) => {
    await open(page, 480, 800)
    await expect(page.getByRole('button', { name: /^Acciones para / })).toHaveCount(0)
    const nameButton = page.getByRole('button', { name: /^Ver detalle de / }).first()
    await nameButton.focus()
    await page.keyboard.press('Enter')
    const sheet = page.getByRole('dialog')
    await expect(sheet.getByRole('button', { name: 'Añadir a pedido' })).toBeVisible()
    await expect(sheet.getByRole('button', { name: 'Editar producto' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(nameButton).toBeFocused()
  })
})

test.describe('estados de carga, error y vacío', () => {
  test('carga y error no muestran cifras engañosas', async ({ page }) => {
    await open(page)
    await page.getByLabel('Simular estado').selectOption('loading')
    await expect(page.getByRole('status').filter({ hasText: 'Cargando productos' })).toBeAttached()
    const strip = page.getByRole('group', { name: 'Filtrar por estado de stock' })
    await expect(strip).not.toContainText(/\d/)
    await page.getByLabel('Simular estado').selectOption('error')
    await expect(page.getByRole('alert')).toContainText('No se pudo cargar el inventario')
    await page.getByRole('button', { name: 'Reintentar' }).click()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('sin productos', async ({ page }) => {
    await open(page)
    await selectDataset(page, 'empty')
    await expect(page.getByText('Todavía no hay productos')).toBeVisible()
  })
})
