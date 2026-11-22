# Dominio de inventario y datos sintéticos (fase 2)

Documenta lo **realmente implementado** en `src/features/inventory`. No describe funcionalidades futuras.

## 1. Respaldo documental

Revisada la documentación del proyecto (carpeta de avance de tesis: contexto maestro, análisis integral de procesos, pendientes y decisiones, catálogo BPMN, protocolos de levantamiento):

| Aspecto | Estado | Fuente |
|---|---|---|
| Existen funciones de **inventario y existencias** (F-03), **proveedores** (F-02) y registro de **pedidos** (F-01) | **Propuestas** (no aprobadas) | Contexto maestro, módulos reconstruidos |
| El módulo de IA usa «historial de ventas por producto y período, existencias y plazo de entrega» | Confirmado a nivel general | Tesis §3.4.6 |
| Variables deseables de los datos: fecha, producto, unidades, **precio**, promociones, devoluciones, existencias al cierre, pedidos pendientes, vencimientos | Deseables (Anexo A.4), sin datos reales | Contexto maestro §17 |
| Campos del producto, **categorías**, **unidades de medida**, precio de **compra** y de **venta** | **No documentados** | — |
| Stock mínimo / punto de reorden / nivel objetivo | **PR-04 abierto** | Pendientes y decisiones |
| Posición de inventario y pedidos pendientes | **PR-05 abierto** | idem |
| Origen de los datos de ventas e inventario | **PR-09 abierto** | idem |
| Recepción, pago, **actualización de existencias, mermas y conteos** | **PR-19 abierto** (incluye el tratamiento del stock negativo) | idem |
| Alertas | **PR-20 abierto** | idem |
| «Reglas de negocio, requerimientos funcionales y no funcionales por módulo: no están definidos» | Confirmado como pendiente | Contexto maestro |

**Consecuencia:** el modelo siguiente es una **propuesta de trabajo** para probar la interfaz y el dominio. Todo lo no documentado está centralizado en `domain/provisional.ts`. Los datos de demostración no son fuente de reglas.

### Discrepancias detectadas (no resueltas)

1. **Precio:** la pantalla anterior tenía un único «Precio». La documentación no dice si es de compra o de venta. Se modelan **ambos**, opcionales; la tabla muestra el de venta y el panel muestra los dos. Decisión pendiente.
2. **Nombre «stock mínimo»:** el Anexo 03 lo usa; la tesis no lo adopta como parámetro (PR-04). El nivel de referencia por producto (`referenceLevel`) es solo demostrativo y no es stock mínimo.
3. **Proveedor y categoría en la ficha del producto:** las funciones de proveedores y productos son propuestas (F-02); la categoría no aparece en la documentación.

## 2. Modelo (`domain/model.ts`)

Producto y existencia son conceptos **relacionados pero separados**: el stock cambiará con movimientos aún no definidos (PR-19); el catálogo no.

```
UnitOfMeasure  { code, name, symbol, allowsFractions }      (allowsFractions: propiedad provisional)
Category       { id, name }
Supplier       { id, name }
Product        { id, code, name, brand|null, categoryId|null, unitCode, supplierId|null,
                 purchasePrice|null, salePrice|null }
StockRecord    { productId, quantity|null, referenceLevel, updatedAt }
InventoryCatalog  = { units, categories, suppliers, products, stock }   // instantánea normalizada
InventoryItem     = vista de lectura (producto + categoría + unidad + proveedor + existencia)
```

- **Representación numérica:** cantidades y precios son **cadenas decimales** (`"1284000.500"`). Escala propuesta: 3 decimales (cantidad), 2 (precio). Nunca `Number`.
- **Sin dato ≠ cero:** `quantity === null` es «sin dato»; `"0"` es agotado. Un producto puede no tener registro de existencia (`updatedAt: null`).
- **Fechas:** DATETIME2 «de pared» (`YYYY-MM-DDTHH:mm:ss`), sin zona horaria; no se convierten.

### Decimales (`shared/lib/decimal.ts`, reutilizado)

Operaciones permitidas: `toScaled`, `compareDecimal`, `formatDecimal/Quantity/Money`, `isDecimalString`, `decimalPlaces`. Redondeo: mitad alejándose de cero a la escala pedida. Los números JSON se **rechazan** en la frontera (`dto.ts`). No hay aritmética de montos todavía (no se necesita); si se necesita, se añadirá sobre BigInt.

## 3. Capas y carpetas

```
features/inventory/
  domain/        model · provisional · assemble · validation · stock (clasificación) · query (filtrar/ordenar/paginar/contar)
  data/          dto (frontera: unknown → modelo) · repository (puerto + implementación sintética) · synthetic/…
  hooks/         useInventory (carga asíncrona) · useInventoryView (filtros, orden, página, selección) · useDockedFit
  components/    presentación (no contiene reglas de negocio)
  InventoryScreen.tsx   composición
```

Flujo de datos: `repository.load()` → `loadFromPayload(unknown)` → `parseInventoryCatalog` (estructura y tipos) → `validateCatalog` (coherencia) → `assembleInventory` → `InventoryItem[]` → hooks → componentes.

**Backend futuro (ASP.NET Core + EF Core + SQL Server):** una implementación de `InventoryRepository` que llame a la API y pase la respuesta JSON por `loadFromPayload`. Si el contrato difiere (nombres, identificadores), solo cambia `data/dto.ts`; el dominio y los componentes no dependen de la forma de la API. No se creó ningún cliente HTTP ni contrato: no existen.

## 4. Reglas

| Regla | Estado | Implementación |
|---|---|---|
| Cuatro estados (En stock, Stock bajo, Agotado, Sin dato) | **Provisional** (demostrativa) | `domain/stock.ts` |
| «Stock bajo» = menor que `referenceLevel` del producto | **Provisional** (PR-04 abierto) | `classifyStock` |
| Stock **negativo**: no es un estado; advertencia independiente; fuera de los cuatro conteos y de los filtros de estado | **Pendiente PR-19** | `classifyStock` devuelve `null` |
| Búsqueda por nombre, código y proveedor, sin tildes ni mayúsculas, espacios colapsados | Implementación de interfaz (no regla de negocio) | `domain/query.ts` |
| Filtros: estado (múltiple), proveedor, categoría | Interfaz | `domain/query.ts` |
| Orden: nulos al final; empates por nombre e id | Interfaz | `sortItems` |
| Límites (nombre 150, código 30, símbolo 12, DECIMAL(18,3)/(18,2)) | **Provisional** (propuesta D7): solo **avisos** | `validation.ts` |
| Unidad entera no admite fracciones | **Provisional**: solo aviso | `validation.ts` |
| Categorías, unidades y proveedores de la lista | **Ficticios** | `data/synthetic/reference.ts` |

### Validación

`validateCatalog` devuelve incidencias: **error** (duplicados de id/código, referencias inexistentes, decimales o fechas inválidos, existencias huérfanas, nombre/código vacío) bloquea la carga con `InventoryDataError`; **aviso** (límites propuestos, escala, fracción en unidad entera, stock negativo) no bloquea y queda disponible en `InventoryLoad.warnings`.

## 5. Datos sintéticos

100 % ficticios (códigos `DEMO-…`, proveedores con «Demo», marcas inventadas). Estrategia: **generación determinista** con semilla fija (`mulberry32`) a partir de plantillas por categoría (`templates.ts`) + **casos extremos escritos a mano** (`edgeCases.ts`). Las fechas son relativas al día de referencia. No se almacenan archivos de datos; se generan en memoria y atraviesan la misma frontera que una API.

| Conjunto | Productos | Contenido |
|---|---|---|
| `demo` | 186 | 10 categorías, 6 unidades, 10 proveedores, 12 marcas; sin avisos de validación |
| `large` | 1 200 | Misma generación; prueba de volumen; sin avisos |
| `worst-case` | 19 casos extremos + 24 generados | Ver abajo |
| `empty` | 0 | Estado vacío |

Casos extremos (`worst-case`): nombre de 150 caracteres; nombre muy corto («Té»); HTML/emoji/saltos de línea en nombres; stock negativo (−3 y −999 999 999 999 999,999); stock cero; sin dato; sin registro de existencia; sin categoría/proveedor/precios; precio cero; límites DECIMAL(18,3)/(18,2) positivos; cantidad fraccionaria en unidad entera (aviso); fechas 1970-01-01, 1989-12-31 23:59:59 y futura; stock exactamente en el nivel de referencia.

### Limitaciones

- El generador produce al menos 1 200 combinaciones únicas; con más se lanza un error explícito.
- Las distribuciones de stock y precios son inventadas; no reflejan ventas ni existencias reales.
- Las categorías no provienen de la documentación; el filtro por categoría es de demostración.
- Sin movimientos, lotes, vencimientos ni pedidos: no están definidos (PR-19, PR-05).
