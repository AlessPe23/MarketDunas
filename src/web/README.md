# MarketDunas · Frontend

Aplicación web (React 19 + TypeScript + Vite 8) del proyecto de tesis *«Desarrollo de una aplicación web para el proceso de adquisición de productos con integración de Inteligencia Artificial en el Minimarket Dunas de Ica, 2026»*.

**Estado: fase 2** — sistema de diseño «Duna», estructura de aplicación y una pantalla de referencia de inventario respaldada por un **modelo de dominio tipado y datos 100 % sintéticos**. No hay backend, base de datos ni IA conectados; las acciones son provisionales.

## Requisitos

- Node.js ≥ 22.13 (probado con 22.20) y npm ≥ 10.
- Para las pruebas E2E: Microsoft Edge instalado (el proyecto usa `channel: 'msedge'`). En otro equipo: `npx playwright install chromium` y cambiar `channel` en `playwright.config.ts`.

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo en <http://localhost:5173> |
| `npm run build` | Comprobación de tipos + compilación de producción (`dist/`) |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint (tipado estricto) |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas de extremo a extremo y accesibilidad automática (Playwright) |

## Estructura

```
src/
  app/            composición de proveedores (tooltip, notificaciones, enrutador)
  routes/         definición de rutas y navegación
  layouts/        AppLayout: barra lateral, cabecera, contenido, cajón móvil
  pages/          páginas de ruta (finas); la lógica vive en features/
  features/       funcionalidades por dominio (inventory: dominio, datos sintéticos, hooks y pantalla de referencia)
  shared/         utilidades sin dependencias de dominio (decimales, fechas, texto, hooks)
  design-system/  tokens, base, componentes, iconos, galería y DESIGN.md
e2e/              pruebas Playwright
```

No se crearon `components/`, `assets/` ni `styles/`: los componentes compartidos viven en `design-system/` (y los específicos en cada `feature`), y los estilos globales en `design-system/base`. Se añadirán cuando haya contenido real.

Documentación:

- Sistema de diseño: [`src/design-system/DESIGN.md`](src/design-system/DESIGN.md).
- Dominio de inventario, reglas confirmadas/provisionales y datos sintéticos: [`docs/DOMINIO_INVENTARIO.md`](docs/DOMINIO_INVENTARIO.md).

## Convenciones

Ver sección 5 de `DESIGN.md`. Resumen: TypeScript estricto sin `any`, CSS Modules con `@layer`, tokens semánticos, exportaciones nombradas, identificadores en inglés y texto de interfaz en español.

## Seguridad

- No hay secretos ni variables de entorno. Si en el futuro se necesitan, las variables `VITE_*` quedan **expuestas al navegador**: no colocar credenciales en ellas.
- `.env*` está ignorado en Git (solo se versionan plantillas `*.example`).
- `dangerouslySetInnerHTML` está prohibido por ESLint; todo el texto se renderiza escapado.

## Arquitectura de datos

`repository.load()` → `loadFromPayload(unknown)` (estructura → coherencia → ensamblado) → `InventoryItem[]` → hooks → componentes. Los componentes no conocen la forma de la fuente de datos; para integrar ASP.NET Core basta una implementación de `InventoryRepository` y, si el contrato difiere, adaptar `features/inventory/data/dto.ts`. Detalle en `docs/DOMINIO_INVENTARIO.md`.

## Calidad

- Pruebas de dominio y de datos (Vitest, `src/**/*.test.ts`) separadas de las de interfaz (Playwright, `e2e/`).
- `e2e/accessibility.spec.ts` ejecuta axe-core (reglas WCAG A/AA automatizables) en varios estados y anchos. **No sustituye una auditoría de accesibilidad**; no se declara cumplimiento de WCAG 2.2 AA.
- No hay Content-Security-Policy ni cabeceras de seguridad configuradas: son responsabilidad del servidor que sirva `dist/` (pendiente para el despliegue).

## Datos de demostración

Todo producto, proveedor, cantidad, precio y umbral es sintético (códigos `DEMO-…`, proveedores con «Demo»). Los umbrales de stock, los cuatro estados, las categorías, las unidades y los límites de campos (nombre 150, código 30, símbolo de unidad 12, DECIMAL(18,3)/(18,2), DATETIME2) provienen de una **propuesta no aprobada** y no son reglas de negocio. El tratamiento del stock negativo está pendiente (PR-19) y se muestra como advertencia independiente, no como estado.
