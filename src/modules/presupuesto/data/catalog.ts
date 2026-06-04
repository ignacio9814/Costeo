export interface CatalogCategory {
  id: string
  name: string
  color: string
}

export interface CatalogItem {
  id: string
  categoryId: string
  name: string
  pricePerPerson: number
  tags: string[]
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  { id: 'coctel_frio', name: 'Cóctel Frío', color: 'blue' },
  { id: 'coctel_caliente', name: 'Cóctel Caliente', color: 'orange' },
  { id: 'finger_food', name: 'Finger Food', color: 'amber' },
  { id: 'buffet', name: 'Buffet / Estaciones', color: 'emerald' },
  { id: 'principal', name: 'Platos Principales', color: 'red' },
  { id: 'infantil', name: 'Menú Infantil', color: 'pink' },
  { id: 'postre', name: 'Postres / Mesa Dulce', color: 'violet' },
  { id: 'fin_de_fiesta', name: 'Fin de Fiesta', color: 'slate' },
  { id: 'desayuno', name: 'Desayuno / Coffee Break', color: 'yellow' },
  { id: 'bebidas', name: 'Bebidas / Barra', color: 'teal' },
]

export const CATEGORY_COLORS: Record<string, string> = {
  coctel_frio: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
  coctel_caliente: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
  finger_food: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  buffet: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
  principal: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/20',
  infantil: 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-100 dark:border-pink-500/20',
  postre: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
  fin_de_fiesta: 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-500/20',
  desayuno: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20',
  bebidas: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-500/20',
}

export const CATALOG_ITEMS: CatalogItem[] = [
  // ── Cóctel Frío ──────────────────────────────────────────────────────────
  { id: 'cf_01', categoryId: 'coctel_frio', name: 'Pincho capresse (queso, cherry, pesto)', pricePerPerson: 2400, tags: ['queso', 'vegetariano', 'clásico'] },
  { id: 'cf_02', categoryId: 'coctel_frio', name: 'Tapa de queso azul con jamón serrano', pricePerPerson: 2900, tags: ['queso azul', 'jamón', 'gourmet'] },
  { id: 'cf_03', categoryId: 'coctel_frio', name: 'Profiteroles con crema de queso azul y nueces', pricePerPerson: 2800, tags: ['profiterol', 'queso azul'] },
  { id: 'cf_04', categoryId: 'coctel_frio', name: 'Canapé de mascarpone y morrones asados', pricePerPerson: 2600, tags: ['queso crema', 'vegetariano'] },
  { id: 'cf_05', categoryId: 'coctel_frio', name: 'Tapa de peras asadas, queso azul y nueces', pricePerPerson: 2900, tags: ['frutas', 'gourmet'] },
  { id: 'cf_06', categoryId: 'coctel_frio', name: 'Gambas con aliño de mango (langostinos en panko)', pricePerPerson: 3200, tags: ['mariscos', 'premium', 'langostinos'] },
  { id: 'cf_07', categoryId: 'coctel_frio', name: 'Mini bocados de mousse de atún', pricePerPerson: 2500, tags: ['atún', 'pescado'] },
  { id: 'cf_08', categoryId: 'coctel_frio', name: 'Bruschetta de vitel toné', pricePerPerson: 2700, tags: ['carne', 'clásico', 'peceto'] },

  // ── Cóctel Caliente ───────────────────────────────────────────────────────
  { id: 'cc_01', categoryId: 'coctel_caliente', name: 'Mini quiche lorraine (panceta, queso, crema)', pricePerPerson: 2400, tags: ['quiche', 'clásico', 'francés'] },
  { id: 'cc_02', categoryId: 'coctel_caliente', name: 'Mini quiche de espinacas a la crema', pricePerPerson: 2400, tags: ['quiche', 'vegetariano'] },
  { id: 'cc_03', categoryId: 'coctel_caliente', name: 'Mini quiche de salmón y queso', pricePerPerson: 2700, tags: ['quiche', 'salmón', 'pescado'] },
  { id: 'cc_04', categoryId: 'coctel_caliente', name: 'Mini volovanes de salmón con puerros', pricePerPerson: 2600, tags: ['hojaldre', 'salmón'] },
  { id: 'cc_05', categoryId: 'coctel_caliente', name: 'Arancini de arroz azafrado con mozzarella', pricePerPerson: 2500, tags: ['arroz', 'italiano', 'mozzarella'] },
  { id: 'cc_06', categoryId: 'coctel_caliente', name: 'Pop de pollo con salsa BBQ', pricePerPerson: 2800, tags: ['pollo', 'frito'] },
  { id: 'cc_07', categoryId: 'coctel_caliente', name: 'Croquetas de arroz y espinacas', pricePerPerson: 2400, tags: ['vegetariano', 'croqueta'] },
  { id: 'cc_08', categoryId: 'coctel_caliente', name: 'Rollitos de masa philo con hongos y queso', pricePerPerson: 2500, tags: ['hongos', 'vegetariano'] },
  { id: 'cc_09', categoryId: 'coctel_caliente', name: 'Pinxto de papas bravas con salchicha', pricePerPerson: 2600, tags: ['papas', 'español'] },

  // ── Finger Food ───────────────────────────────────────────────────────────
  { id: 'ff_01', categoryId: 'finger_food', name: 'Mini sándwiches de ternera en ciabatta', pricePerPerson: 2700, tags: ['sándwich', 'ternera'] },
  { id: 'ff_02', categoryId: 'finger_food', name: 'Mini burgers de ternera con queso', pricePerPerson: 3200, tags: ['hamburguesa', 'ternera', 'queso'] },
  { id: 'ff_03', categoryId: 'finger_food', name: 'Mini calzone de mozzarella y salsa', pricePerPerson: 2500, tags: ['calzone', 'italiano'] },
  { id: 'ff_04', categoryId: 'finger_food', name: 'Empanadas surtidas (copetín)', pricePerPerson: 2900, tags: ['empanada', 'clásico'] },

  // ── Buffet ────────────────────────────────────────────────────────────────
  { id: 'bf_01', categoryId: 'buffet', name: 'Estación norteña (humita, locro, empanadas)', pricePerPerson: 4500, tags: ['regional', 'humita', 'locro'] },
  { id: 'bf_02', categoryId: 'buffet', name: 'Estación italiana (pastas, salsas, parmesano)', pricePerPerson: 4800, tags: ['pastas', 'italiano'] },
  { id: 'bf_03', categoryId: 'buffet', name: 'Estación mexicana (tacos, burritos, guacamole)', pricePerPerson: 4600, tags: ['mexicano', 'tacos'] },
  { id: 'bf_04', categoryId: 'buffet', name: 'Estación de cazuelas (pollo, cerdo, verduras)', pricePerPerson: 4200, tags: ['cazuela', 'caldos'] },
  { id: 'bf_05', categoryId: 'buffet', name: 'Isla de sushi (rolls, niguiri, sashimi)', pricePerPerson: 9500, tags: ['sushi', 'japonés', 'premium'] },
  { id: 'bf_06', categoryId: 'buffet', name: 'Estación árabe (sfijas, arrollados, keppe)', pricePerPerson: 5200, tags: ['árabe', 'sfijas'] },
  { id: 'bf_07', categoryId: 'buffet', name: 'Pernil con panes y salsas', pricePerPerson: 5400, tags: ['pernil', 'cerdo', 'sandwiches'] },
  { id: 'bf_08', categoryId: 'buffet', name: 'Estación de asado criollo', pricePerPerson: 8900, tags: ['asado', 'carne', 'parrilla'] },
  { id: 'bf_09', categoryId: 'buffet', name: 'Mesa de quesos y fiambres', pricePerPerson: 4100, tags: ['quesos', 'fiambres', 'tabla'] },
  { id: 'bf_10', categoryId: 'buffet', name: 'Pulled pork con coleslaw y panes', pricePerPerson: 5800, tags: ['cerdo', 'americano'] },
  { id: 'bf_11', categoryId: 'buffet', name: 'Estación sin TACC (sin gluten)', pricePerPerson: 5500, tags: ['celiaco', 'sin gluten', 'saludable'] },

  // ── Platos Principales ────────────────────────────────────────────────────
  { id: 'pp_01', categoryId: 'principal', name: 'Cazuela de pollo con vegetales de estación', pricePerPerson: 5500, tags: ['pollo', 'cazuela'] },
  { id: 'pp_02', categoryId: 'principal', name: 'Salmón a la crema con papas rústicas', pricePerPerson: 7500, tags: ['salmón', 'pescado', 'premium'] },
  { id: 'pp_03', categoryId: 'principal', name: 'Mac & Cheese gourmet con panceta', pricePerPerson: 5000, tags: ['pasta', 'queso', 'americano'] },
  { id: 'pp_04', categoryId: 'principal', name: 'Rottolo de verduras (menú vegetariano)', pricePerPerson: 5200, tags: ['vegetariano', 'pasta'] },
  { id: 'pp_05', categoryId: 'principal', name: 'Goulash húngaro con arroz', pricePerPerson: 5800, tags: ['carne', 'europeo'] },

  // ── Menú Infantil ─────────────────────────────────────────────────────────
  { id: 'in_01', categoryId: 'infantil', name: 'Cheeseburger infantil con papas fritas', pricePerPerson: 3500, tags: ['hamburguesa', 'papas', 'niños'] },
  { id: 'in_02', categoryId: 'infantil', name: 'Milanesa con puré o ensalada', pricePerPerson: 3200, tags: ['milanesa', 'niños', 'clásico'] },
  { id: 'in_03', categoryId: 'infantil', name: 'Suprema de pollo con papas bastón', pricePerPerson: 3300, tags: ['pollo', 'niños'] },
  { id: 'in_04', categoryId: 'infantil', name: 'Panchos + nuggets + papitas', pricePerPerson: 3000, tags: ['niños', 'fácil'] },

  // ── Postres ───────────────────────────────────────────────────────────────
  { id: 'po_01', categoryId: 'postre', name: 'Mesa dulce surtida (facturas, tortas, alfajores)', pricePerPerson: 4100, tags: ['mesa dulce', 'surtido'] },
  { id: 'po_02', categoryId: 'postre', name: 'Brownie con helado y coulis de frutos rojos', pricePerPerson: 2800, tags: ['chocolate', 'helado'] },
  { id: 'po_03', categoryId: 'postre', name: 'Crumble de manzana y canela con crema', pricePerPerson: 2600, tags: ['crumble', 'manzana'] },
  { id: 'po_04', categoryId: 'postre', name: 'Ensalada de frutas con crema y granola', pricePerPerson: 2200, tags: ['frutas', 'saludable'] },
  { id: 'po_05', categoryId: 'postre', name: 'Torta personalizada (x porción)', pricePerPerson: 3500, tags: ['torta', 'festejo'] },

  // ── Fin de Fiesta ─────────────────────────────────────────────────────────
  { id: 'ff2_01', categoryId: 'fin_de_fiesta', name: 'Pizzas variadas (x porción)', pricePerPerson: 2200, tags: ['pizza', 'clásico'] },
  { id: 'ff2_02', categoryId: 'fin_de_fiesta', name: 'Mini sándwiches ciabatta al horno', pricePerPerson: 2500, tags: ['sándwich', 'caliente'] },
  { id: 'ff2_03', categoryId: 'fin_de_fiesta', name: 'Conos de papas con salsas', pricePerPerson: 1800, tags: ['papas', 'fácil'] },
  { id: 'ff2_04', categoryId: 'fin_de_fiesta', name: 'Medialunas y facturas de cierre', pricePerPerson: 1600, tags: ['pastelería', 'café'] },

  // ── Desayuno / Coffee Break ───────────────────────────────────────────────
  { id: 'de_01', categoryId: 'desayuno', name: 'Desayuno continental (medialunas, jugos, café)', pricePerPerson: 3500, tags: ['desayuno', 'continental'] },
  { id: 'de_02', categoryId: 'desayuno', name: 'Desayuno americano (huevos, fiambres, tostadas)', pricePerPerson: 4500, tags: ['desayuno', 'proteico'] },
  { id: 'de_03', categoryId: 'desayuno', name: 'Coffee break básico (galletitas, alfajores, café)', pricePerPerson: 2200, tags: ['coffee break', 'reunión'] },
  { id: 'de_04', categoryId: 'desayuno', name: 'Coffee break premium (croissants, muffins, frutas)', pricePerPerson: 3200, tags: ['coffee break', 'premium'] },
  { id: 'de_05', categoryId: 'desayuno', name: 'Brunch completo (desayuno + almuerzo liviano)', pricePerPerson: 6500, tags: ['brunch', 'completo'] },

  // ── Bebidas / Barra ───────────────────────────────────────────────────────
  { id: 'be_01', categoryId: 'bebidas', name: 'Barra básica (gaseosas, agua, jugo)', pricePerPerson: 2500, tags: ['bebidas', 'sin alcohol'] },
  { id: 'be_02', categoryId: 'bebidas', name: 'Barra de tragos clásicos (fernet, gin, vodka)', pricePerPerson: 6800, tags: ['tragos', 'alcohol', 'clásicos'] },
  { id: 'be_03', categoryId: 'bebidas', name: 'Barra premium (cócteles elaborados, bartender)', pricePerPerson: 8500, tags: ['cócteles', 'premium', 'bartender'] },
  { id: 'be_04', categoryId: 'bebidas', name: 'Barra de vinos (selección de tintos y blancos)', pricePerPerson: 5500, tags: ['vinos', 'premium'] },
  { id: 'be_05', categoryId: 'bebidas', name: 'Café, té e infusiones (x persona/hora)', pricePerPerson: 1200, tags: ['café', 'té', 'reunión'] },
]

export function getCatalogByCategory(): Record<string, CatalogItem[]> {
  return CATALOG_ITEMS.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    if (!acc[item.categoryId]) acc[item.categoryId] = []
    acc[item.categoryId].push(item)
    return acc
  }, {})
}
