/** Plantillas ficticias para generar productos coherentes de un minimarket. Los precios (soles) son aproximaciones inventadas. */
export interface Presentation {
  label: string
  unitCode: string
  /** Rango de precio de venta en soles. */
  price: readonly [min: number, max: number]
}

export interface ProductTemplate {
  categoryId: number
  stem: string
  /** Prefijo de código de tres letras. */
  codePrefix: string
  presentations: readonly Presentation[]
}

const p = (label: string, unitCode: string, min: number, max: number): Presentation => ({ label, unitCode, price: [min, max] })

export const TEMPLATES: readonly ProductTemplate[] = [
  // 1 · Abarrotes
  { categoryId: 1, stem: 'Arroz extra', codePrefix: 'ARR', presentations: [p('bolsa 750 g', 'und', 3.2, 4.5), p('bolsa 5 kg', 'und', 19, 26)] },
  { categoryId: 1, stem: 'Azúcar rubia', codePrefix: 'AZU', presentations: [p('bolsa 1 kg', 'und', 3.8, 5.2), p('bolsa 5 kg', 'und', 18, 24)] },
  { categoryId: 1, stem: 'Aceite vegetal', codePrefix: 'ACE', presentations: [p('botella 900 ml', 'und', 9, 13), p('botella 1 L', 'und', 10, 15)] },
  { categoryId: 1, stem: 'Fideos tallarín', codePrefix: 'FID', presentations: [p('bolsa 250 g', 'und', 1.8, 2.8), p('bolsa 500 g', 'und', 3.2, 4.8)] },
  { categoryId: 1, stem: 'Frejol canario', codePrefix: 'FRE', presentations: [p('bolsa 500 g', 'und', 4.5, 6.5), p('granel', 'kg', 8, 11)] },
  { categoryId: 1, stem: 'Lenteja', codePrefix: 'LEN', presentations: [p('bolsa 500 g', 'und', 4, 6), p('granel', 'kg', 7, 10)] },
  { categoryId: 1, stem: 'Harina preparada', codePrefix: 'HAR', presentations: [p('bolsa 1 kg', 'und', 4, 6)] },
  { categoryId: 1, stem: 'Sal yodada', codePrefix: 'SAL', presentations: [p('bolsa 1 kg', 'und', 1.2, 2), p('bolsa 500 g', 'und', 0.9, 1.4)] },
  { categoryId: 1, stem: 'Avena en hojuelas', codePrefix: 'AVE', presentations: [p('bolsa 400 g', 'und', 2.8, 4.2), p('bolsa 1 kg', 'und', 6, 8.5)] },
  // 2 · Lácteos
  { categoryId: 2, stem: 'Leche evaporada entera', codePrefix: 'LEV', presentations: [p('lata 400 g', 'und', 3.6, 4.8), p('caja x 24 unidades', 'caja24', 80, 105)] },
  { categoryId: 2, stem: 'Leche UHT', codePrefix: 'LUH', presentations: [p('caja 1 L', 'und', 4.2, 5.8)] },
  { categoryId: 2, stem: 'Yogur natural', codePrefix: 'YOG', presentations: [p('botella 1 L', 'und', 7, 10), p('vaso 150 ml', 'und', 1.5, 2.6)] },
  { categoryId: 2, stem: 'Queso fresco', codePrefix: 'QUE', presentations: [p('al corte', 'kg', 22, 32)] },
  { categoryId: 2, stem: 'Mantequilla', codePrefix: 'MAN', presentations: [p('barra 200 g', 'und', 6, 9)] },
  // 3 · Bebidas
  { categoryId: 3, stem: 'Gaseosa sabor naranja', codePrefix: 'GAS', presentations: [p('botella 500 ml', 'und', 1.8, 2.8), p('botella 3 L', 'und', 8, 11)] },
  { categoryId: 3, stem: 'Gaseosa sabor limón', codePrefix: 'GLI', presentations: [p('botella 1.5 L', 'und', 4.5, 6.5), p('botella 500 ml', 'und', 1.8, 2.8)] },
  { categoryId: 3, stem: 'Agua sin gas', codePrefix: 'AGU', presentations: [p('botella 625 ml', 'und', 1.2, 2), p('bidón 2.5 L', 'und', 2.8, 4.2)] },
  { categoryId: 3, stem: 'Jugo de durazno', codePrefix: 'JUG', presentations: [p('caja 1 L', 'und', 4.5, 6.8)] },
  { categoryId: 3, stem: 'Té filtrante', codePrefix: 'TEF', presentations: [p('caja 25 sobres', 'und', 3.5, 5.5)] },
  { categoryId: 3, stem: 'Café instantáneo', codePrefix: 'CAF', presentations: [p('frasco 170 g', 'und', 14, 21)] },
  // 4 · Limpieza
  { categoryId: 4, stem: 'Detergente en polvo', codePrefix: 'DET', presentations: [p('bolsa 900 g', 'und', 9, 14), p('bolsa 2 kg', 'und', 18, 27)] },
  { categoryId: 4, stem: 'Lejía', codePrefix: 'LEJ', presentations: [p('botella 1 L', 'und', 3.2, 5)] },
  { categoryId: 4, stem: 'Lavavajilla en crema', codePrefix: 'LAV', presentations: [p('pote 400 g', 'und', 4.5, 7)] },
  { categoryId: 4, stem: 'Papel higiénico', codePrefix: 'PAH', presentations: [p('paquete x 4 rollos', 'paq', 5.5, 8), p('paquete x 12 rollos', 'paq', 14, 19)] },
  { categoryId: 4, stem: 'Limpiador multiusos', codePrefix: 'LIM', presentations: [p('botella 900 ml', 'und', 5, 8)] },
  // 5 · Cuidado personal
  { categoryId: 5, stem: 'Jabón de tocador', codePrefix: 'JAB', presentations: [p('barra 90 g', 'und', 1.8, 3)] },
  { categoryId: 5, stem: 'Champú', codePrefix: 'CHA', presentations: [p('botella 400 ml', 'und', 9, 15)] },
  { categoryId: 5, stem: 'Pasta dental', codePrefix: 'PDE', presentations: [p('tubo 75 ml', 'und', 3.5, 6)] },
  { categoryId: 5, stem: 'Desodorante en barra', codePrefix: 'DES', presentations: [p('barra 50 g', 'und', 7, 12)] },
  // 6 · Snacks
  { categoryId: 6, stem: 'Galletas de vainilla', codePrefix: 'GVA', presentations: [p('paquete 6 unidades', 'paq', 1.5, 2.6), p('caja 12 paquetes', 'caja', 15, 22)] },
  { categoryId: 6, stem: 'Papas fritas', codePrefix: 'PAF', presentations: [p('bolsa 140 g', 'und', 3.5, 5.5)] },
  { categoryId: 6, stem: 'Chocolate con leche', codePrefix: 'CHO', presentations: [p('barra 90 g', 'und', 3, 5)] },
  { categoryId: 6, stem: 'Caramelos masticables', codePrefix: 'CAR', presentations: [p('bolsa 200 g', 'und', 3, 4.8)] },
  // 7 · Conservas
  { categoryId: 7, stem: 'Atún en trozos', codePrefix: 'ATU', presentations: [p('lata 170 g', 'und', 4.8, 7.5)] },
  { categoryId: 7, stem: 'Sardina en tomate', codePrefix: 'SAR', presentations: [p('lata 425 g', 'und', 5.5, 8)] },
  { categoryId: 7, stem: 'Duraznos en almíbar', codePrefix: 'DUR', presentations: [p('lata 820 g', 'und', 8.5, 12.5)] },
  { categoryId: 7, stem: 'Mermelada de fresa', codePrefix: 'MER', presentations: [p('frasco 300 g', 'und', 5, 8.5)] },
  // 8 · Panadería
  { categoryId: 8, stem: 'Pan de molde blanco', codePrefix: 'PAM', presentations: [p('bolsa 500 g', 'und', 6, 9)] },
  { categoryId: 8, stem: 'Galleta de soda', codePrefix: 'GSO', presentations: [p('paquete 6 unidades', 'paq', 1.4, 2.4)] },
  { categoryId: 8, stem: 'Pan integral', codePrefix: 'PAI', presentations: [p('bolsa 450 g', 'und', 6.5, 9.5)] },
  // 9 · Frutas y verduras (a granel, con fracciones)
  { categoryId: 9, stem: 'Papa blanca', codePrefix: 'PAP', presentations: [p('a granel', 'kg', 1.6, 3)] },
  { categoryId: 9, stem: 'Cebolla roja', codePrefix: 'CEB', presentations: [p('a granel', 'kg', 2, 4)] },
  { categoryId: 9, stem: 'Tomate', codePrefix: 'TOM', presentations: [p('a granel', 'kg', 2.5, 5)] },
  { categoryId: 9, stem: 'Limón', codePrefix: 'LIO', presentations: [p('a granel', 'kg', 3, 7)] },
  { categoryId: 9, stem: 'Plátano de seda', codePrefix: 'PLA', presentations: [p('a granel', 'kg', 2.8, 4.5)] },
  // 10 · Carnes y embutidos
  { categoryId: 10, stem: 'Jamón del país', codePrefix: 'JAM', presentations: [p('al corte', 'kg', 24, 36)] },
  { categoryId: 10, stem: 'Hot dog', codePrefix: 'HOT', presentations: [p('paquete 8 unidades', 'paq', 8, 13)] },
  { categoryId: 10, stem: 'Pollo entero', codePrefix: 'POL', presentations: [p('al peso', 'kg', 8.5, 12)] },
  { categoryId: 10, stem: 'Chorizo parrillero', codePrefix: 'CHZ', presentations: [p('paquete 4 unidades', 'paq', 9, 14)] },
]
