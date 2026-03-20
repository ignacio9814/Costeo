export interface DishCategory {
  id: string;
  name: string;
}

export interface DishItem {
  id: string;
  name: string;
  categoryId: string;
  basePricePerPerson: number;
  tags: string[];
}

export const santinoCategories: DishCategory[] = [
  { id: 'caldos_fondos', name: 'Caldos y Fondos Base' },
  { id: 'masas_bases', name: 'Masas y Bases Saladas' },
  { id: 'bebidas', name: 'Bebidas y Cócteles' },
  { id: 'panaderia', name: 'Bollería y Panadería' },
  { id: 'coctel_frio', name: 'Cóctel Frío' },
  { id: 'coctel_caliente', name: 'Cóctel Caliente' },
  { id: 'finger_food', name: 'Finger Food' },
  { id: 'buffet', name: 'Buffet' },
  { id: 'principales', name: 'Platos Principales' },
  { id: 'infantil', name: 'Menú Infantil' },
  { id: 'salsas', name: 'Salsas y Aliños' },
  { id: 'postres', name: 'Postres' },
  { id: 'desayuno_brunch', name: 'Desayuno / Brunch' },
  { id: 'fin_de_fiesta', name: 'Fin de Fiesta' }
];

const defaultDishPriceByCategory: Record<string, number> = {
  caldos_fondos: 1200,
  masas_bases: 900,
  bebidas: 1500,
  panaderia: 1400,
  coctel_frio: 2200,
  coctel_caliente: 2400,
  finger_food: 2600,
  buffet: 4200,
  principales: 6500,
  infantil: 3800,
  salsas: 700,
  postres: 2100,
  desayuno_brunch: 2800,
  fin_de_fiesta: 1900
};

const makeId = (categoryId: string, name: string) => {
  return `${categoryId}:${name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9:]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const item = (name: string, categoryId: string): DishItem => {
  const tags = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  return {
    id: makeId(categoryId, name),
    name,
    categoryId,
    basePricePerPerson: defaultDishPriceByCategory[categoryId] ?? 2000,
    tags
  };
};

export const santinoItems: DishItem[] = [
  item('Bisque de mariscos', 'caldos_fondos'),
  item('Caldo base de carne', 'caldos_fondos'),
  item('Caldo base de pollo', 'caldos_fondos'),
  item('Caldo base de verduras', 'caldos_fondos'),
  item('Demiglace', 'caldos_fondos'),
  item('Fondo blanco de ave', 'caldos_fondos'),
  item('Fumet de pescado', 'caldos_fondos'),

  item('Hojaldre francés', 'masas_bases'),
  item('Masa choux', 'masas_bases'),
  item('Masa brioche', 'masas_bases'),
  item('Masa calzone', 'masas_bases'),
  item('Masa empanadas tucumanas', 'masas_bases'),
  item('Masa pasta rellena', 'masas_bases'),
  item('Masa philo', 'masas_bases'),
  item('Masa pizza', 'masas_bases'),
  item('Masa tarta', 'masas_bases'),
  item('Pan bao', 'masas_bases'),
  item('Pan ciabatta', 'masas_bases'),

  item('Café y té', 'bebidas'),
  item('Cóctel cítrico sin alcohol', 'bebidas'),
  item('Jugos naturales', 'bebidas'),
  item('Limonada con jengibre', 'bebidas'),
  item('Milkshake', 'bebidas'),
  item('Sprite con menta', 'bebidas'),

  item('Alfajores', 'panaderia'),
  item('Barritas de cereales', 'panaderia'),
  item('Bollería dulce', 'panaderia'),
  item('Bollería salada', 'panaderia'),
  item('Budín de chocolate', 'panaderia'),
  item('Budincitos', 'panaderia'),
  item('Cookies chips', 'panaderia'),
  item('Cookies avena', 'panaderia'),
  item('Croissants', 'panaderia'),
  item('Frutos secos caramelizados', 'panaderia'),
  item('Mini lemon pie', 'panaderia'),
  item('Muffins', 'panaderia'),
  item('Palmeritas', 'panaderia'),
  item('Petit fours', 'panaderia'),
  item('Sándwich chipá', 'panaderia'),
  item('Torta brownie', 'panaderia'),

  item('Bocado zucchini ricotta', 'coctel_frio'),
  item('Bruschetta vitel toné', 'coctel_frio'),
  item('Canapé mascarpone higos', 'coctel_frio'),
  item('Mousse de atún', 'coctel_frio'),
  item('Pincho capresse', 'coctel_frio'),
  item('Profiteroles hongos', 'coctel_frio'),
  item('Profiteroles queso azul', 'coctel_frio'),
  item('Rodajitas pollo provolone', 'coctel_frio'),
  item('Gambas panko mango', 'coctel_frio'),
  item('Peras queso azul', 'coctel_frio'),

  item('Arancini mozzarella', 'coctel_caliente'),
  item('Cazuela ñoquis batata', 'coctel_caliente'),
  item('Croquetas arroz espinaca', 'coctel_caliente'),
  item('Mini quiche espinaca', 'coctel_caliente'),
  item('Mini quiche hongos', 'coctel_caliente'),
  item('Mini quiche salmón', 'coctel_caliente'),
  item('Mini quiche lorraine', 'coctel_caliente'),
  item('Mini volovans capresse', 'coctel_caliente'),
  item('Mini volovans salmón', 'coctel_caliente'),
  item('Papas bravas con salchicha', 'coctel_caliente'),
  item('Pop de pollo BBQ', 'coctel_caliente'),
  item('Rollitos philo', 'coctel_caliente'),

  item('Mini burger brioche', 'finger_food'),
  item('Mini calzone', 'finger_food'),
  item('Mini cheese burger', 'finger_food'),
  item('Sandwich cerdo BBQ', 'finger_food'),
  item('Sandwich cerdo bao', 'finger_food'),
  item('Sandwich philadelphia', 'finger_food'),
  item('Sandwich jamón queso', 'finger_food'),
  item('Sandwich salmón', 'finger_food'),
  item('Sandwich ternera', 'finger_food'),

  item('Humita', 'buffet'),
  item('Cazuela lomo', 'buffet'),
  item('Cazuela pollo', 'buffet'),
  item('Empanadas carne', 'buffet'),
  item('Empanadas pollo', 'buffet'),
  item('Malfattis', 'buffet'),
  item('Pasta rellena', 'buffet'),
  item('Pernil', 'buffet'),
  item('Pizza parrilla', 'buffet'),
  item('Pulled pork', 'buffet'),
  item('Risotto pollo hongos', 'buffet'),
  item('Sushi', 'buffet'),
  item('Tacos', 'buffet'),
  item('Wok vegetales', 'buffet'),

  item('Cazuela lomo crema', 'principales'),
  item('Cazuela mariscos', 'principales'),
  item('Cazuela matambre', 'principales'),
  item('Cazuela mollejas', 'principales'),
  item('Cazuela pollo crema', 'principales'),
  item('Cúpula pollo rellena', 'principales'),
  item('Salmón manteca', 'principales'),
  item('Salmón laqueado', 'principales'),
  item('Goulash', 'principales'),
  item('Mac and cheese', 'principales'),
  item('Malfattis queso azul', 'principales'),
  item('Medallón lomo', 'principales'),
  item('Rottolo vegetariano', 'principales'),

  item('Cheeseburger con papas', 'infantil'),
  item('Macarrones con queso', 'infantil'),
  item('Milanesa napolitana', 'infantil'),
  item('Suprema con papas', 'infantil'),

  item('Guacamole', 'salsas'),
  item('Pesto', 'salsas'),
  item('Salsa BBQ', 'salsas'),
  item('Salsa demiglace', 'salsas'),
  item('Salsa champaña', 'salsas'),
  item('Salsa hongos', 'salsas'),
  item('Salsa frutos rojos', 'salsas'),
  item('Salsa malbec', 'salsas'),
  item('Salsa mostaza miel', 'salsas'),
  item('Salsa queso azul', 'salsas'),
  item('Salsa soja maní', 'salsas'),
  item('Salsa filetto', 'salsas'),
  item('Salsa vitel toné', 'salsas'),

  item('Brownie con helado', 'postres'),
  item('Crumble manzana', 'postres'),
  item('Cuadrados brownie', 'postres'),
  item('Ensalada frutas', 'postres'),
  item('Shot frutas crema', 'postres'),

  item('Brochette frutas', 'desayuno_brunch'),
  item('Cereales yogurt', 'desayuno_brunch'),
  item('Crackers', 'desayuno_brunch'),
  item('Estación light', 'desayuno_brunch'),
  item('Fiambres quesos', 'desayuno_brunch'),
  item('Frutas estación', 'desayuno_brunch'),
  item('Huevos revueltos', 'desayuno_brunch'),
  item('Omelette', 'desayuno_brunch'),
  item('Yogurt frutas', 'desayuno_brunch'),

  item('Conos papas fritas', 'fin_de_fiesta'),
  item('Mini pizzas', 'fin_de_fiesta'),
  item('Sandwich lomito', 'fin_de_fiesta'),
  item('Sandwich milanesa', 'fin_de_fiesta')
];

export const getDishCategoryName = (categoryId: string): string => {
  return santinoCategories.find(c => c.id === categoryId)?.name ?? categoryId;
};

export const findDishById = (id: string): DishItem | undefined => {
  return santinoItems.find(i => i.id === id);
};
