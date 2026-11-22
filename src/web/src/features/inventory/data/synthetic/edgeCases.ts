import { toWallDateTime } from '@/shared/lib/dates'
import type { Product, StockRecord } from '../../domain/model'

/**
 * Casos extremos escritos a mano para probar la interfaz y el dominio (break-ui). Son sintéticos: combinan valores
 * en los límites de la propuesta D7 con datos opcionales ausentes, texto con caracteres especiales y fechas límite.
 * NO representan datos del negocio ni reglas.
 */
const NAME_150 = 'Aceite vegetal de soya Pampa Real botella PET 1 L (caja x 12 unidades, presentación institucional para bodegas, restaurantes y comedores populares de la región Ica)'.slice(0, 150)

export interface EdgeCases {
  products: Product[]
  stock: StockRecord[]
}

export function buildEdgeCases(today: Date): EdgeCases {
  const future = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)
  const products: Product[] = []
  const stock: StockRecord[] = []
  const add = (id: number, product: Partial<Product> & { name: string }, quantity: string | null, updatedAt: string, referenceLevel = '40') => {
    products.push({
      id,
      code: `DEMO-W-${String(id).padStart(4, '0')}`,
      brand: null,
      categoryId: 1,
      unitCode: 'und',
      supplierId: 1 + (id % 10),
      purchasePrice: '1.00',
      salePrice: '2.00',
      ...product,
    })
    stock.push({ productId: id, quantity, referenceLevel, updatedAt })
  }
  const now = toWallDateTime(today)

  add(9001, { name: NAME_150, unitCode: 'caja24', supplierId: 1, salePrice: '12345678.90', purchasePrice: '9876543.21' }, '1284000', now, '5000')
  add(9002, { name: 'Té', supplierId: null, categoryId: 3, salePrice: '0.00', purchasePrice: null }, '1', now, '5')
  add(9003, { name: 'Producto con stock negativo (dato inconsistente)', salePrice: '0.01' }, '-3', now)
  add(9004, { name: 'Gaseosa <b>zero</b> 500 ml &amp; promo **limón**', categoryId: 3 }, '24', now)
  add(9005, { name: '<script>alert(1)</script> Detergente "Brisa" D\'Oro 900 ml', categoryId: 4 }, '8', now)
  add(9006, { name: 'Producto sin existencia registrada ni precios', categoryId: null, supplierId: null, salePrice: null, purchasePrice: null }, null, now)
  add(9007, { name: 'Producto con stock cero y precio cero', salePrice: '0.00', purchasePrice: '0.00' }, '0', now)
  add(9008, { name: '  Azúcar   rubia\nHuerta Sol  1 kg ', unitCode: 'kg' }, '55', now)
  add(9009, { name: 'Gaseosa 🥤 sabor limón (promo 🔥)', unitCode: 'l', categoryId: 3 }, '60', now)
  add(9010, { name: 'AJÍ PANCA MOLIDO ÑAÑA 100 G CAFÉ PASIÓN' }, '17', now)
  add(9011, { name: 'Producto con fecha futura' }, '30', toWallDateTime(future))
  add(9012, { name: 'Producto con fecha 01/01/1970 (valor recibido)' }, '30', '1970-01-01T00:00:00')
  add(9013, { name: 'Producto con fecha 31/12/1989 23:59:59' }, '30', '1989-12-31T23:59:59')
  add(9014, { name: 'Límite superior del esquema propuesto (DECIMAL 18,3 y 18,2)', unitCode: 'kg', salePrice: '9999999999999999.99', purchasePrice: '9999999999999999.98' }, '999999999999999.999', now, '1000')
  add(9015, { name: 'Límite inferior del esquema propuesto (stock negativo extremo)', unitCode: 'kg', salePrice: '0.01' }, '-999999999999999.999', now, '10')
  add(9016, { name: 'Stock exactamente en el nivel de referencia demostrativo' }, '40', now)
  add(9017, { name: 'Producto con stock fraccionario en unidad entera', unitCode: 'und' }, '2.5', now)
  add(9018, { name: 'Cantidad con tres decimales y precio alto', unitCode: 'kg', salePrice: '12345678.90' }, '1284000.500', now, '5000')
  // Producto sin registro de existencia (ni fecha): los datos de existencia son opcionales.
  products.push({ id: 9019, code: 'DEMO-W-9019', name: 'Producto sin registro de existencia', brand: null, categoryId: 1, unitCode: 'und', supplierId: null, purchasePrice: null, salePrice: '5.00' })

  return { products, stock }
}
