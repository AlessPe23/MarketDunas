# Sistema de diseño «Duna» — versión 0.1 (fase 1)

Sistema de diseño de MarketDunas. Estética editorial, funcional y sobria; pensado para una herramienta profesional de gestión de adquisiciones, no para una plantilla administrativa genérica.

> **Estado:** primera versión, **no auditada**. Los contrastes están *calculados* a partir de los valores aprobados; no se declara cumplimiento de WCAG 2.2 AA (falta una auditoría real con lector de pantalla, teclado en varios navegadores y dispositivos táctiles).

## 1. Principios

1. **Tokens semánticos, no colores sueltos.** Los componentes solo usan variables de `tokens/tokens.css` (`--color-*`, `--space-*`, …). Los primitivos (`--stone-*`, `--oasis-*`) existen únicamente para definir los semánticos.
2. **Estado ≠ solo color.** Todo estado combina color + icono o texto (`Badge`, indicadores, advertencias).
3. **Teclado y foco primero.** Foco visible con anillo doble en todos los controles; controles reales (`button`, `input`, `select`, `table`) antes que ARIA personalizado.
4. **Datos tabulares estables.** Cifras tabulares (`.num`), decimales exactos (sin `Number`), cantidades y montos sin saltos de línea.
5. **Movimiento mínimo.** Transiciones cortas con `transform`/`opacity`; `prefers-reduced-motion` desactiva el movimiento no esencial.
6. **Sin dependencias visuales completas.** Solo se usan primitivas sin estilo (Radix) y un conjunto de iconos (Lucide).

## 2. Estructura

```
design-system/
  tokens/      tokens.css (variables) · breakpoints.ts (puntos de ruptura para TypeScript)
  base/        layers.css (orden de capas) · reset.css · base.css (tipografía, foco, .num, .sr-only)
  components/  un directorio por componente: Componente.tsx + Componente.module.css
  icons/       reexporta los iconos Lucide usados + BrandMark (marca provisional)
  gallery/     GalleryPage (ruta /sistema-de-diseno; enlace solo en `npm run dev`)
  fonts.css    Geist y Geist Mono locales (@fontsource-variable)
  index.css    punto de entrada de estilos globales · index.ts  punto de entrada de componentes
```

Se mantiene la estructura propuesta. Desviaciones: se añade `fonts.css`, `index.css`/`index.ts` como puntos de entrada y `components/Field` (estructura común etiqueta + ayuda + error que reutilizan `Input`, `SearchInput` y `Select`; no se exporta).

### Capas CSS

`@layer reset, tokens, base, components, features;` (en `base/layers.css`). Los CSS Modules de componentes del sistema viven en la capa `components`; los de pantallas y plantillas en `features`. Así el orden de cascada es explícito y una pantalla puede ajustar un componente sin aumentar la especificidad. Los CSS Modules aíslan los nombres de clase.

## 3. Fundamentos

### Color (referencias aprobadas)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg-app` | `#FAF8F4` | Fondo general |
| `--color-bg-surface` | `#FFFFFF` | Superficies (tarjetas, paneles, tablas) |
| `--color-text-primary` | `#1E1B17` | Texto principal |
| `--color-text-secondary` | `#443E35` | Texto secundario |
| `--color-text-muted` | `#5C554A` | Texto atenuado |
| `--color-action-bg` / `-hover` / `-active` | `#0B7783` / `#0B5F69` / `#0D4C55` | Oasis: acción principal |
| `--color-border-control` | `#8B8374` | Borde de controles |
| `--color-success-*` | `#1A6633` sobre `#EEF8F0` | Éxito |
| `--color-warning-*` | `#8F5500` sobre `#FFF7E6` | Advertencia |
| `--color-danger-*` | `#9B2518` sobre `#FDEEEC` | Error / destructivo |
| `--color-info-*` | `#234CA0` sobre `#EDF3FE` | Información |
| `--chart-1…4` | `#0B7783` `#5B4BB7` `#B8741A` `#5C554A` | Gráficos (máx. 4 series) |

Auxiliares: `--color-bg-subtle` (`#F3F0EA`), `--color-bg-hover` (`#F6F3EE`), `--color-bg-selected` (`#EAF8F8`), `--color-border-subtle` (`#E1DCD2`).

#### Contrastes calculados (WCAG, relación de luminancia)

| Par | Relación | Mínimo | Resultado |
|---|---|---|---|
| Texto principal / fondo app | 16.17 | 4.5 | cumple |
| Texto secundario / fondo app | 9.97 | 4.5 | cumple |
| Texto atenuado / fondo app · superficie · subtle · neutro | 6.94 · 7.36 · 6.47 · 5.97 | 4.5 | cumple |
| Blanco / Oasis · hover · activo | 5.28 · 7.36 · 9.62 | 4.5 | cumple |
| Oasis activo / Oasis-50 (fila seleccionada) | 8.84 | 4.5 | cumple |
| Enlace Oasis hover / fondo app | 6.93 | 4.5 | cumple |
| Borde de control `#8B8374` / superficie · fondo app | 3.75 · 3.54 | 3 (no textual) | cumple |
| Foco Oasis `#0B7783` / fondo app | 4.97 | 3 (no textual) | cumple |
| Éxito · advertencia · error · información / su fondo | 6.46 · 5.68 · 6.97 · 7.22 | 4.5 | cumple |
| Gráfico Oasis · violeta · piedra / superficie | 5.28 · 6.70 · 7.36 | 3 (gráfico) | cumple |
| **Gráfico ocre `#B8741A` / superficie** | **3.78** | 3 (gráfico) | cumple como marca gráfica; **no usar para texto** |

Estos valores se calcularon con la fórmula WCAG 2.x; no sustituyen una medición sobre pantallas reales ni una auditoría.

#### Tema oscuro

Los tokens oscuros existen en `[data-theme='dark']`, **sin conmutador y sin verificación de contraste**. No usarlos en producto hasta auditarlos.

### Tipografía

- **Geist** (sans) y **Geist Mono** (códigos), SIL OFL 1.1, paquetes `@fontsource-variable/geist` y `…/geist-mono` 5.3.0. Se sirven desde el propio bundle (sin CDN). Los subconjuntos latinos incluyen los caracteres del español, el signo menos U+2212 y el espacio de no separación.
- El CSS de `@fontsource` declara todos los subconjuntos con `unicode-range`: el navegador solo descarga los necesarios (latino); los demás figuran en `dist/` pero no se solicitan.
- Escala (rem): `--text-xs` 12 · `--text-sm` 13 (datos de tabla) · `--text-md` 14 (cuerpo) · `--text-lg` 16 · `--text-xl` 20 (título de página). Pesos: 400, 500, 600 (fuente variable: sin saltos entre pesos).
- Cifras tabulares: clase `.num`. Los títulos no superan 20 px.

### Espaciado, radios, bordes, elevación, capas

- Espaciado base 4 px: `--space-1` 4 · `2` 8 · `3` 12 · `4` 16 · `5` 20 · `6` 24 · `8` 32 · `10` 40 · `12` 48 · `16` 64.
- Radios: `--radius-xs` 4 · `sm` 6 · `md` 8 · `lg` 12 · `full`.
- Bordes: `--border-width` 1 px; colores `--color-border-subtle | strong | control | focus`.
- Elevación: `--shadow-popover`, `--shadow-dialog`, `--shadow-toast`.
- z-index: `sticky` 10 · `sidebar` 20 · `overlay` 40 · `dialog` 50 · `popover` 60 · `toast` 70 · `tooltip` 80.

### Breakpoints

Las consultas CSS no admiten variables; los valores se repiten en rem y en `tokens/breakpoints.ts`.

| Nombre | Valor | Efecto |
|---|---|---|
| compact | 768 px | Debajo: sin menú ⋮ en filas (acciones en el panel de detalle) y navegación en cajón |
| sidebarExpanded | 1100 px | Desde aquí barra lateral expandida (232 px); debajo, contraída (56 px) |
| detailDocked | 1440 px | Desde aquí el detalle se acopla a la tabla; debajo es hoja modal |
| (tarjeta de estados) | 480 px · 720 px | 2×2 por debajo de 720 px; etiqueta sobre cifra por debajo de 480 px |

Dimensiones de aplicación: sidebar 232/56 px, cabecera 48 px, contenido máx. 1440 px, márgenes 24 px (<768) / 32 px (≥768). Con puntero grueso (`pointer: coarse`) `--control-h` pasa de 32 a 40 px y `--row-h` de 44 a 52 px.

### Movimiento

Curvas `--ease-out` y `--ease-drawer`; duraciones 120–250 ms. Solo `transform`/`opacity`. `prefers-reduced-motion` elimina desplazamientos y animaciones decorativas (el esqueleto de carga deja de animarse).

### Foco visible

`:focus-visible { outline: 2px solid transparent; box-shadow: var(--focus-ring) }`: anillo doble (2 px de separación + 2 px Oasis). El contorno transparente se hace visible en modo de colores forzados (Windows alto contraste).

## 4. Componentes

| Componente | API principal | Notas |
|---|---|---|
| `Button` | `variant` primary/secondary/ghost/danger · `size` md/sm · `icon` | Texto visible obligatorio |
| `IconButton` | `label` (obligatorio) · `icon` · `variant` | El nombre accesible es obligatorio por tipo |
| `Input` | `label` · `hideLabel` · `hint` · `error` | `aria-describedby`/`aria-invalid` automáticos |
| `SearchInput` | `label` (oculto visualmente) | `type="search"` |
| `Select` | `label` · `hint` · `error` + `<option>` | **Nativo** (ver decisiones) |
| `Checkbox` | `label` · `showLabel` · `indeterminate` | Objetivo táctil ≥ `--control-h` |
| `Badge` | `tone` success/warning/danger/info/neutral · `icon` | Icono recomendado |
| `Tooltip` / `TooltipProvider` | `content` · `side` | Radix Tooltip; solo texto complementario |
| `Dialog` | `open` · `onOpenChange` · `title` · `variant` modal/sheet/drawer · `footer` · `returnFocus` | Radix Dialog: foco atrapado, Escape, devolución de foco (al elemento enfocado al abrir o al que indique `returnFocus`); el cuerpo desplazable es enfocable |
| `DropdownMenu` (+ `Item`, `Separator`) | `trigger` · `label` · `align` · `onCloseAutoFocus` | Radix, **no modal**: flechas, Inicio/Fin, Escape |
| `Popover` | `trigger` · `label` | Radix; contenido interactivo no modal |
| `ToastProvider` / `useToast` | `notify({ title, description })` | Radix Toast; anuncio educado |
| `Skeleton` | `width` · `height` | Decorativo (`aria-hidden`) |
| `EmptyState` · `ErrorState` · `LoadingState` | título · descripción · acción | `ErrorState` usa `role="alert"`; `LoadingState` `role="status"` |

La galería (`/sistema-de-diseno`) muestra todos con sus estados.

## 5. Convenciones de código

- **Archivos:** componentes en `PascalCase.tsx` junto a su `PascalCase.module.css`; hooks `useCamelCase.ts`; utilidades `camelCase.ts`; pruebas `*.test.ts` junto al código; pruebas E2E en `e2e/`.
- **Identificadores** en inglés (`stock`, `price`, `supplier`); **texto de interfaz** en español neutro e imperativo.
- **Exportaciones:** nombradas, sin `default` (salvo configuración). Cada directorio de librería expone un `index.ts`.
- **Importaciones** con alias `@/` (`src`). Un componente no importa de `features/` ni de `pages/`.
- **Tipos:** TypeScript estricto (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`); sin `any`; sin aserciones no nulas; `import type` obligatorio.
- **Estilos:** CSS Modules + `@layer`; colores/espaciados solo mediante tokens; `rem` para tamaños de texto.
- **Seguridad:** `dangerouslySetInnerHTML` prohibido por ESLint (`no-restricted-syntax`).

## 6. Decisiones relevantes

1. **`<select>` nativo** en lugar de una lista personalizada: teclado, lectores de pantalla y selector nativo móvil sin código. Se reevaluará si se necesita búsqueda dentro de la lista.
2. **Radix solo donde aporta valor**: `dialog`, `dropdown-menu`, `popover`, `tooltip`, `toast` (gestión de foco, capas, teclado). No se usan `select` ni `checkbox` de Radix.
3. **Iconos Lucide** reexportados desde `icons/index.ts` para sustituirlos en un solo lugar.
4. **Fechas DATETIME2 sin zona horaria**: se formatean desde sus componentes y nunca se convierten a UTC/zona local.
5. **Decimales exactos**: `shared/lib/decimal.ts` (BigInt); `Number` no se usa para montos ni cantidades.
6. **Menú no modal** (`modal={false}`): el modo modal de Radix marca el resto de la página como `aria-hidden` con elementos aún enfocables, lo que axe señala (`aria-hidden-focus`); el menú de acciones no necesita bloquear el fondo.
7. **Regiones desplazables enfocables** (`useScrollable`): el cuerpo del panel de detalle y de los diálogos recibe `tabindex=0` solo cuando realmente se desplaza (WCAG 2.1.1).
8. **Estilos activos de navegación** mediante `aria-current` (no mediante `className` en función): un `className` funcional se pierde al envolver el enlace en un `Tooltip` (Radix `asChild`).
9. **Tabla de inventario**: sin cuadrícula ARIA; semántica nativa de tabla, 2 controles por fila, cabecera fija con `overflow-y: clip`, columnas opcionales por *container query*.

## 7. Pendiente / no verificado

- Auditoría de accesibilidad real (lector de pantalla, teclado en varios navegadores, táctil, zoom/tamaño de texto).
- Contraste del tema oscuro y su conmutador.
- Firefox y Safari (`overflow-y: clip` junto a `overflow-x: auto`: si se trata como `hidden`, la cabecera de la tabla deja de ser fija, sin perder contenido).
- Marca definitiva (la actual es provisional).
- Componentes futuros (tabs, tabla genérica reutilizable, formularios complejos) no se anticipan hasta que haya una necesidad real.
