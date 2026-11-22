import type { Category, Supplier, UnitOfMeasure } from '../../domain/model'

/**
 * DATOS 100 % SINTÉTICOS. Unidades, categorías y proveedores son ficticios y NO provienen de Dunas Market
 * ni de la documentación de la tesis (que no los define). Los proveedores contienen «Demo» para no confundirlos con reales.
 */

export const SYNTHETIC_UNITS: readonly UnitOfMeasure[] = [
  { code: 'und', name: 'Unidad', symbol: 'und', allowsFractions: false },
  { code: 'kg', name: 'Kilogramo', symbol: 'kg', allowsFractions: true },
  { code: 'l', name: 'Litro', symbol: 'L', allowsFractions: true },
  { code: 'paq', name: 'Paquete', symbol: 'paq', allowsFractions: false },
  { code: 'caja', name: 'Caja', symbol: 'caja', allowsFractions: false },
  { code: 'caja24', name: 'Caja de 24 unidades', symbol: 'caja x 24 un', allowsFractions: false },
]

export const SYNTHETIC_CATEGORIES: readonly Category[] = [
  { id: 1, name: 'Abarrotes' },
  { id: 2, name: 'Lácteos y derivados' },
  { id: 3, name: 'Bebidas' },
  { id: 4, name: 'Limpieza del hogar' },
  { id: 5, name: 'Cuidado personal' },
  { id: 6, name: 'Snacks y golosinas' },
  { id: 7, name: 'Conservas' },
  { id: 8, name: 'Panadería' },
  { id: 9, name: 'Frutas y verduras' },
  { id: 10, name: 'Carnes y embutidos' },
]

export const SYNTHETIC_SUPPLIERS: readonly Supplier[] = [
  { id: 1, name: 'Distribuidora Demo del Valle y la Costa Sociedad Anónima Cerrada' },
  { id: 2, name: 'Comercial Demo Andina E.I.R.L.' },
  { id: 3, name: 'Importaciones y Representaciones Demo del Sur S.A.C.' },
  { id: 4, name: 'Alimentos Demo Surandinos S.A.' },
  { id: 5, name: 'Logística Demo Integral del Sur' },
  { id: 6, name: 'Corporación Demo de Consumo Masivo' },
  { id: 7, name: 'Abarrotes Demo Mayoristas Unidos' },
  { id: 8, name: 'Demo Productos Frescos' },
  { id: 9, name: 'Mayorista Demo Los Cuatro Vientos' },
  { id: 10, name: 'Agroindustrias Demo Valle Verde S.A.C.' },
]

/** Marcas ficticias (no corresponden a marcas comerciales reales). */
export const SYNTHETIC_BRANDS = [
  'Pampa Real',
  'Costa Azul',
  'Valle Dorado',
  'Arena Fina',
  'Huerta Sol',
  'Brisa del Sur',
  'Cumbre Andina',
  'Don Demetrio',
  'Luna Clara',
  'Río Manso',
  'Campo Nuevo',
  'Sierra Verde',
] as const
