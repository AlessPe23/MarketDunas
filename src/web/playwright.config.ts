import { defineConfig } from '@playwright/test'

/**
 * Usa Microsoft Edge instalado en el equipo (channel "msedge") para no descargar navegadores.
 * En CI u otros equipos sin Edge: ejecutar `npx playwright install chromium` y cambiar `channel`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'msedge',
    trace: 'off',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
