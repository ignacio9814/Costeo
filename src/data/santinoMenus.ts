import { SelectedDish } from '../utils/pricingEngine';

export type MenuSectionId =
  | 'coctel_frio'
  | 'coctel_caliente'
  | 'finger_food'
  | 'estaciones_buffet'
  | 'plato_principal'
  | 'menu_vegetariano'
  | 'menu_infantil'
  | 'postre'
  | 'fin_de_fiesta'
  | 'desayuno'
  | 'almuerzo_corporativo';

export interface SantinoMenuOption {
  name: string;
  items: string[];
}

export interface SantinoMenuDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  // Menús con opciones (ej: desayuno / coffee break)
  options?: SantinoMenuOption[];
  optionalAddons?: string[];
  // Menús con secciones (ej: casamientos / eventos)
  sections?: Array<
    | {
        section: MenuSectionId;
        // elegir N desde pool
        pool?: MenuSectionId | string;
        optionsToChoose?: number;
        // items directos
        items?: string[];
        // estaciones buffet
        baseStationsCount?: number;
        baseStationsPool?: string;
        extraStationsPool?: string;
      }
    | {
        section: 'plato_principal';
        itemsAvailable?: string[];
        optionsToChoose?: number;
      }
  >;
}

export const catalogPools: Record<string, string[]> = {
  coctel_frio: [
    'Pincho capresse con queso pategrás, tomatitos cherrys y pesto de albahaca',
    'Tapa de queso azul con jamón serrano y cebollas caramelizadas',
    'Bruschetta de vitel toné (mini roll de peceto con salsa vitel toné y alcaparras)',
    'Mini bocados de mousse de atún en pan de miga con aliño de almendras y morrones en conserva',
    'Profisteroles con crema de hongos frescos (masa bomba, hongos asados, puerros y queso crema)',
    'Profisteroles con crema de queso azul y nueces',
    'Canapé de queso mascarpone y pimientos asados con higos en almíbar',
    'Tapa de peras asadas, queso azul, nueces tostadas y miel',
    'Rodajitas de pollo con queso provolone y hierbas aromáticas',
    'Bocado de zucchini, ricotta, tomates secos y almendras tostadas',
    'Tapa de gambas con aliño de mango (langostinos rebozados en panko con lactonesa de mango)'
  ],
  coctel_caliente: [
    'Pop de pollo con salsa BBQ (bocados de pollo frito marinados en jengibre y limón)',
    'Mini quiche de espinacas a la crema (con cebolla caramelizada y gratén de queso)',
    'Mini quiche de hongos, queso y crema',
    'Mini quiche lorraine (panceta, queso y crema, estilo francés)',
    'Mini quiche de salmón y queso',
    'Mini volovans de salmón (hojaldre francés, salmón, puerros y crema)',
    'Mini volovans de tomates secos (hojaldre francés con tomates secos y gratén de queso)',
    'Cazuelita de ñoquis de batata asados con salsa de mix de hongos',
    'Pinxto de papas bravas con salchicha parrillera y aliño de salsa brava',
    'Arancini de arroz azafrado relleno de mozzarella (estilo siciliano)',
    'Croquetas de arroz y espinacas con aliño de apio',
    'Rollitos de masa philo de elaboración propia, relleno de vegetales, hongos y queso'
  ],
  finger_food: [
    'Mini sándwiches de ternera en pan ciabatta de elaboración propia',
    'Mini sándwiches de jamón y queso en pan ciabatta de elaboración propia',
    'Mini sándwich de cerdo braseado con vegetales en pan bao (cocido al vapor)',
    'Mini sándwiches de salmón ahumado',
    'Mini cheese burgers con panes de color',
    'Mini sándwich Philadelphia (carne asada, hierbas y cheddar fundido)',
    'Mini calzone de mozzarella y cantimpalo',
    'Mini calzone clásico de mozzarella y aceitunas'
  ],
  estaciones_buffet_base: [
    'Estación regional norteña (cazuela de humita, empanadas tucumanas de carne y pollo)',
    'Estación mexicana (tacos de carne y pollo con guacamole y pico de gallo)',
    'Estación italiana (Malfattis de espinacas y ricotta / Risotto cofradía de pollo y hongos / Pasta rellena del chef — 2 opciones a elección)',
    'Estación de cazuelas (cazuela de pollo, vegetales y hongos a la crema / cazuela de lomo, vegetales y hongos / Wok de vegetales con salsa de soja y maní tostado)',
    'Estación de asado / parrilla'
  ],
  estaciones_buffet_adicionales: [
    'Estación buffet de Sushi (chef Adan Reymundo) — costo adicional',
    'Estación buffet Medio Oriente (cocina árabe con recetas ancestrales) — costo adicional',
    'Estación especial sin TACC / vegana / vegetariana libre de alérgenos — costo adicional',
    'Estación de Pulled Pork (cerdo braseado estilo americano) — costo adicional',
    'Estación de pizza a la parrilla — costo adicional',
    'Estación de fiambres y charcutería (quesos y fiambres variados) — costo adicional',
    'Estación de pernil de cerdo en cocción delta (cocción lenta, técnica delta) — costo adicional'
  ],
  platos_principales: [
    'Cúpula de filet de pollo rellena de vegetales asados, queso y lomito ahumado — con zanahorias glaseadas, espinacas a la crema, hash brown y tuille de parmesano',
    'Medallón de lomo (filet) con confit de tomates cherrys, puré de calabaza y hash brown — con tuille de parmesano y bouquet de flores comestibles',
    "Filet de salmón laqueado (laca agridulce de soja, miel y jengibre) con papas Arzak",
    "Filet de salmón a la maître d'hôtel (manteca pomada, perejil y limón) con papas Arzak",
    'Cazuela de lomo con vegetales, mix de hongos y crema',
    'Cazuela de pollo, hongos y crema',
    'Cazuela de mollejas a la crema',
    'Cazuela de matambre al verdeo — costo adicional',
    'Cazuela de mariscos — costo adicional',
    'Goulash con spatzel (pasta húngara)',
    'Macs and cheese (pasta corta al dente con salsa de quesos fundidos)',
    'Malfattis de espinacas con salsa de queso azul'
  ],
  menu_vegetariano: [
    'Rottolo de ricotta, brócoli, mozzarella y queso sardo con salsa de crema de hongos'
  ],
  menu_infantil: [
    'Cheese burger con papas',
    'Suprema de pollo con papas',
    'Milanesa napolitana con papas',
    'Macarrones con queso (pasta corta con salsa de quesos fundidos)'
  ],
  postres: [
    'Brownie con helado y salsa de frutos rojos',
    'Crumble de manzana con helado de vainilla, jalea de manzana y frutas de estación',
    'Carta de especialidades del chef (variedad a disposición del cliente)'
  ],
  fin_de_fiesta: [
    'Mini pizzas',
    'Conos de papas',
    'Mini sándwiches de milanesa',
    'Mini sándwiches de lomito',
    'Café con petit fours de elaboración propia (de cortesía — siempre incluido)'
  ]
};

export const santinoMenus: SantinoMenuDefinition[] = [
  {
    id: 'desayuno_santino',
    name: 'Desayuno Santino',
    type: 'desayuno_corporativo',
    description: 'Servicio de desayuno en dos variantes más adicionales opcionales',
    options: [
      {
        name: 'Desayuno Continental',
        items: [
          'Selección de medialunas y croissants',
          'Galletas de elaboración propia',
          'Bollería salada (tortillas, bollitos, bizcochos, panes)',
          'Bollería dulce (facturería, brioche)',
          'Mermelada, miel, dulce de leche y manteca',
          'Variedad de jugos frutales',
          'Café, té, leche y chocolate'
        ]
      },
      {
        name: 'Desayuno Americano',
        items: [
          'Selección de medialunas y croissants',
          'Galletas de elaboración propia',
          'Bollería salada (tortillas, bollitos, bizcochos, panes)',
          'Bollería dulce (facturería, brioche)',
          'Variedad de fiambres y quesos',
          'Huevos revueltos (opción con panceta y salchichas)',
          'Mermelada, miel, dulce de leche y manteca',
          'Variedad de jugos frutales',
          'Café, té, leche y chocolate'
        ]
      }
    ],
    optionalAddons: [
      'Cereales y yogurts',
      'Variedades de frutas de temporada',
      'Estación light (panes de salvado, mermeladas light, queso crema light)',
      'Estación de omelettes'
    ]
  },
  {
    id: 'coffee_break',
    name: 'Coffee Break',
    type: 'coffee_break_corporativo',
    description: 'Cuatro propuestas de coffee break para eventos corporativos',
    options: [
      {
        name: 'Opción 1 — Power Break',
        items: [
          'Budín de chocolate (consultar otras variedades)',
          'Alfajores (2 variedades)',
          'Cookies (2 variedades)',
          'Mini lemon pie',
          'Cuadrados de brownies',
          'Ensalada de frutas',
          'Yogurt natural con frutas y cereales',
          'Sprite con menta y limón',
          'Café, té y jugo de naranja'
        ]
      },
      {
        name: 'Opción 2 — Natural Break',
        items: [
          'Cookies de avena',
          'Muffins de banana y frutos secos',
          'Budín de chocolate semiamargo',
          'Barritas de cereales',
          'Shots de frutas frescas de temporada',
          'Yogur natural/griego con frutas',
          'Variedad de crackers',
          'Sprite con menta y limón',
          'Café, té y jugo de naranja'
        ]
      },
      {
        name: 'Opción 3 — Delicia Break',
        items: [
          'Mini libritos',
          'Palmeritas de hojaldre',
          'Medialunas',
          'Mini cremosas',
          'Danesas',
          'Alfajores',
          'Budincitos',
          'Cookies',
          'Sprite con menta y limón',
          'Café, té y jugo de naranja',
          'Cóctel cítrico sin alcohol (naranja, pomelo, limón y almíbar)'
        ]
      },
      {
        name: 'Opción 4 — Irresistible Selección Break',
        items: [
          'Cookies con chips de chocolate',
          'Palomitas de maíz',
          'Sándwiches de chipá',
          'Torta húmeda de chocolate brownie con nueces',
          'Brochettes de frutas',
          'Shot de ensalada de frutas y crema',
          'Alfajores',
          'Frutos secos caramelizados',
          'Milkshake de coco, frutilla y vainilla',
          'Limonada con jengibre',
          'Sprite con menta y limón',
          'Café, té y jugo de naranja',
          'Cóctel cítrico sin alcohol (naranja, pomelo, limón y almíbar)'
        ]
      }
    ]
  },
  {
    id: 'brunch_santino',
    name: 'Brunch Santino',
    type: 'brunch_corporativo',
    description: 'Propuesta de desayuno + almuerzo corporativo bandejeado',
    sections: [
      {
        section: 'desayuno',
        items: [
          'Cookies con chips de chocolate',
          'Bollería salada (tortillas y bollitos)',
          'Medialunas',
          'Palomitas de maíz',
          'Sándwiches de chipá',
          'Torta húmeda de chocolate brownie con nueces',
          'Brochettes de frutas',
          'Shot de ensalada de frutas y crema',
          'Alfajores',
          'Frutos secos caramelizados',
          'Limonada con jengibre',
          'Gaseosa a selección del cliente',
          'Café, té y jugo de naranja',
          'Cóctel cítrico sin alcohol (naranja, pomelo, limón y almíbar)'
        ]
      },
      {
        section: 'almuerzo_corporativo',
        items: [
          'Sándwiches en pan ciabatta de ternera y queso / jamón y queso',
          'Mini burger en pan brioche',
          'Pinchos de albahaca, cherry y queso',
          'Sándwich de cerdo braseado con BBQ',
          'Cazuela de lomo, vegetales y hongos',
          'Malfattis de espinacas con salsa de queso azul',
          'Brownie con helado y salsa de frutos rojos',
          'Crumble de manzana y helado de vainilla'
        ]
      }
    ]
  },
  {
    id: 'cena_egresados',
    name: 'Cena de Egresados Santino',
    type: 'evento_social',
    description: 'Menú para cenas de egresados con coctel y buffet',
    sections: [
      { section: 'coctel_frio', pool: 'coctel_frio', optionsToChoose: 4 },
      { section: 'coctel_caliente', pool: 'coctel_caliente', optionsToChoose: 2 },
      { section: 'finger_food', pool: 'finger_food', optionsToChoose: 2 },
      {
        section: 'estaciones_buffet',
        baseStationsCount: 4,
        baseStationsPool: 'estaciones_buffet_base',
        extraStationsPool: 'estaciones_buffet_adicionales'
      },
      { section: 'plato_principal', pool: 'platos_principales', optionsToChoose: 1 },
      { section: 'menu_vegetariano', pool: 'menu_vegetariano', optionsToChoose: 1 },
      { section: 'menu_infantil', pool: 'menu_infantil', optionsToChoose: 1 },
      { section: 'postre', pool: 'postres', optionsToChoose: 1 },
      { section: 'fin_de_fiesta', pool: 'fin_de_fiesta', optionsToChoose: 1 }
    ]
  },
  {
    id: 'casamiento_esencial',
    name: 'Casamiento Esencial',
    type: 'casamiento',
    description: 'Menú base para casamientos con coctel, buffet y plato principal de pollo',
    sections: [
      { section: 'coctel_frio', pool: 'coctel_frio', optionsToChoose: 3 },
      { section: 'coctel_caliente', pool: 'coctel_caliente', optionsToChoose: 3 },
      { section: 'finger_food', pool: 'finger_food', optionsToChoose: 2 },
      {
        section: 'estaciones_buffet',
        baseStationsCount: 4,
        baseStationsPool: 'estaciones_buffet_base',
        extraStationsPool: 'estaciones_buffet_adicionales'
      },
      { section: 'plato_principal', pool: 'platos_principales', optionsToChoose: 1 },
      { section: 'menu_vegetariano', pool: 'menu_vegetariano', optionsToChoose: 1 },
      { section: 'menu_infantil', pool: 'menu_infantil', optionsToChoose: 1 },
      { section: 'postre', pool: 'postres', optionsToChoose: 1 },
      { section: 'fin_de_fiesta', pool: 'fin_de_fiesta', optionsToChoose: 1 }
    ]
  },
  {
    id: 'menu_15_anios',
    name: 'Menú 15 Años — Base',
    type: 'evento_social',
    description: 'Menú base para quinceañeras',
    sections: [
      { section: 'coctel_frio', pool: 'coctel_frio', optionsToChoose: 3 },
      { section: 'coctel_caliente', pool: 'coctel_caliente', optionsToChoose: 3 },
      { section: 'finger_food', pool: 'finger_food', optionsToChoose: 2 },
      {
        section: 'estaciones_buffet',
        baseStationsCount: 4,
        baseStationsPool: 'estaciones_buffet_base',
        extraStationsPool: 'estaciones_buffet_adicionales'
      },
      { section: 'plato_principal', pool: 'platos_principales', optionsToChoose: 1 },
      { section: 'menu_vegetariano', pool: 'menu_vegetariano', optionsToChoose: 1 },
      { section: 'menu_infantil', pool: 'menu_infantil', optionsToChoose: 1 },
      { section: 'postre', pool: 'postres', optionsToChoose: 1 },
      { section: 'fin_de_fiesta', pool: 'fin_de_fiesta', optionsToChoose: 1 }
    ]
  },
  {
    id: 'menu_celebracion_adultos',
    name: 'Menú Celebración Adultos',
    type: 'evento_social',
    description: 'Celebración adultos con buffet y principales tipo cazuelas',
    sections: [
      { section: 'coctel_frio', pool: 'coctel_frio', optionsToChoose: 3 },
      { section: 'coctel_caliente', pool: 'coctel_caliente', optionsToChoose: 3 },
      { section: 'finger_food', pool: 'finger_food', optionsToChoose: 2 },
      {
        section: 'estaciones_buffet',
        baseStationsCount: 4,
        baseStationsPool: 'estaciones_buffet_base',
        extraStationsPool: 'estaciones_buffet_adicionales'
      },
      { section: 'plato_principal', pool: 'platos_principales', optionsToChoose: 2 },
      { section: 'postre', pool: 'postres', optionsToChoose: 1 },
      { section: 'fin_de_fiesta', pool: 'fin_de_fiesta', optionsToChoose: 2 }
    ]
  },
  {
    id: 'menu_celebracion_jovenes',
    name: 'Menú Celebración Jóvenes',
    type: 'evento_social',
    description: 'Similar a Adultos pero sin menú infantil separado',
    sections: [
      { section: 'coctel_frio', pool: 'coctel_frio', optionsToChoose: 3 },
      { section: 'coctel_caliente', pool: 'coctel_caliente', optionsToChoose: 3 },
      { section: 'finger_food', pool: 'finger_food', optionsToChoose: 2 },
      {
        section: 'estaciones_buffet',
        baseStationsCount: 4,
        baseStationsPool: 'estaciones_buffet_base',
        extraStationsPool: 'estaciones_buffet_adicionales'
      },
      { section: 'plato_principal', pool: 'platos_principales', optionsToChoose: 2 },
      { section: 'postre', pool: 'postres', optionsToChoose: 1 },
      { section: 'fin_de_fiesta', pool: 'fin_de_fiesta', optionsToChoose: 2 }
    ]
  },
  {
    id: 'menu_especial_gold',
    name: 'Menú Especial Gold',
    type: 'evento_social_premium',
    description: 'Menú premium intermedio con más opciones de cóctel y buffet con asado incluido',
    sections: [
      { section: 'coctel_frio', pool: 'coctel_frio', optionsToChoose: 5 },
      { section: 'coctel_caliente', pool: 'coctel_caliente', optionsToChoose: 3 },
      { section: 'finger_food', pool: 'finger_food', optionsToChoose: 2 },
      {
        section: 'estaciones_buffet',
        baseStationsCount: 5,
        baseStationsPool: 'estaciones_buffet_base',
        extraStationsPool: 'estaciones_buffet_adicionales'
      },
      { section: 'plato_principal', pool: 'platos_principales', optionsToChoose: 1 },
      { section: 'menu_vegetariano', pool: 'menu_vegetariano', optionsToChoose: 1 },
      { section: 'menu_infantil', pool: 'menu_infantil', optionsToChoose: 1 },
      { section: 'postre', pool: 'postres' },
      { section: 'fin_de_fiesta', pool: 'fin_de_fiesta', optionsToChoose: 2 }
    ]
  },
  {
    id: 'menu_platinium_exclusivo',
    name: 'Menú Platinium / Exclusivo',
    type: 'evento_social_premium_top',
    description: 'Menú más completo con máximas opciones de cóctel y buffet',
    sections: [
      { section: 'coctel_frio', pool: 'coctel_frio', optionsToChoose: 6 },
      { section: 'coctel_caliente', pool: 'coctel_caliente', optionsToChoose: 3 },
      { section: 'finger_food', pool: 'finger_food', optionsToChoose: 3 },
      {
        section: 'estaciones_buffet',
        baseStationsCount: 5,
        baseStationsPool: 'estaciones_buffet_base',
        extraStationsPool: 'estaciones_buffet_adicionales'
      },
      { section: 'plato_principal', pool: 'platos_principales', optionsToChoose: 1 },
      { section: 'menu_vegetariano', pool: 'menu_vegetariano', optionsToChoose: 1 },
      { section: 'menu_infantil', pool: 'menu_infantil', optionsToChoose: 1 },
      { section: 'postre', pool: 'postres' },
      { section: 'fin_de_fiesta', pool: 'fin_de_fiesta', optionsToChoose: 3 }
    ]
  }
];

const makeId = (prefix: string, name: string) => {
  return `${prefix}:${name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9:]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

export const defaultPriceBySection: Record<string, number> = {
  coctel_frio: 2200,
  coctel_caliente: 2400,
  finger_food: 2600,
  estaciones_buffet: 4200,
  plato_principal: 6500,
  menu_vegetariano: 5200,
  menu_infantil: 3800,
  postre: 2100,
  fin_de_fiesta: 1900,
  desayuno: 2800,
  almuerzo_corporativo: 4200
};

const getSectionPrice = (section: string): number => {
  return defaultPriceBySection[section] ?? 2000;
};

export const expandMenuToSelectedDishes = (
  menu: SantinoMenuDefinition,
  optionName?: string
): SelectedDish[] => {
  const selected: SelectedDish[] = [];

  if (menu.options && menu.options.length > 0) {
    const option = optionName
      ? menu.options.find(o => o.name === optionName) ?? menu.options[0]
      : menu.options[0];

    for (const name of option.items) {
      selected.push({
        id: makeId(menu.id, name),
        name,
        pricePerPerson: getSectionPrice('desayuno')
      });
    }

    return selected;
  }

  if (!menu.sections) return selected;

  for (const sectionDef of menu.sections) {
    if ('baseStationsCount' in sectionDef && sectionDef.section === 'estaciones_buffet') {
      const basePoolKey = sectionDef.baseStationsPool ?? 'estaciones_buffet_base';
      const basePool = catalogPools[basePoolKey] ?? [];
      const count = sectionDef.baseStationsCount ?? 0;

      for (const name of basePool.slice(0, count)) {
        selected.push({
          id: makeId(sectionDef.section, name),
          name,
          pricePerPerson: getSectionPrice('estaciones_buffet')
        });
      }

      continue;
    }

    const section = (sectionDef as any).section as string;
    const poolKey = (sectionDef as any).pool as string | undefined;
    const optionsToChoose = (sectionDef as any).optionsToChoose as number | undefined;
    const directItems = (sectionDef as any).items as string[] | undefined;

    const poolItems = poolKey ? (catalogPools[poolKey] ?? []) : [];

    const itemsToAdd = directItems
      ? directItems
      : optionsToChoose
          ? poolItems.slice(0, optionsToChoose)
          : poolItems;

    for (const name of itemsToAdd) {
      selected.push({
        id: makeId(section, name),
        name,
        pricePerPerson: getSectionPrice(section)
      });
    }
  }

  return selected;
};
