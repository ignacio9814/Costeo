export interface Category {
  id: string;
  name: string;
  description: string;
  basePrice: number; // precio base por persona en ARS
  tags: string[];
  icon: string;
}

export const categories: Category[] = [
  {
    id: 'cocktail',
    name: 'Cocktail / Recepción',
    description: 'Bocatines, canapés, tragos y finger food para eventos de recepción',
    basePrice: 8500,
    tags: ['cocktail', 'recepción', 'bocatines', 'canapés', 'finger food', 'tragos'],
    icon: '🍸'
  },
  {
    id: 'buffet',
    name: 'Buffet / Lunch',
    description: 'Buffet completo con platos principales, ensaladas y acompañamientos',
    basePrice: 12000,
    tags: ['buffet', 'lunch', 'almuerzo', 'comida', 'platos principales'],
    icon: '🍽️'
  },
  {
    id: 'principal',
    name: 'Principal / Plato Fuerte',
    description: 'Plato principal gourmet con acompañamientos seleccionados',
    basePrice: 15000,
    tags: ['principal', 'plato fuerte', 'gourmet', 'especial', 'cena'],
    icon: '🥩'
  },
  {
    id: 'infantil',
    name: 'Infantil',
    description: 'Menú especial para niños con porciones adaptadas y platos divertidos',
    basePrice: 6000,
    tags: ['infantil', 'niños', 'kids', 'cumpleaños', 'divertido'],
    icon: '🧸'
  },
  {
    id: 'brunch',
    name: 'Brunch / Desayuno',
    description: 'Desayuno o brunch completo con café, pasteles y opciones saladas',
    basePrice: 7500,
    tags: ['brunch', 'desayuno', 'café', 'pasteles', 'matutino'],
    icon: '🥐'
  },
  {
    id: 'postre',
    name: 'Postre / Mesa Dulce',
    description: 'Selección de postres finos o mesa dulce completa para eventos',
    basePrice: 5500,
    tags: ['postre', 'mesa dulce', 'dulces', 'tortas', 'pasteles'],
    icon: '🍰'
  },
  {
    id: 'findefiesta',
    name: 'Fin de Fiesta',
    description: 'Coffee break, chocolates y opciones para cerrar el evento',
    basePrice: 4500,
    tags: ['fin de fiesta', 'coffee break', 'chocolates', 'cierre'],
    icon: '☕'
  },
  {
    id: 'vegetariano',
    name: 'Vegetariano / Vegano',
    description: 'Opciones vegetarianas y veganas gourmet',
    basePrice: 11000,
    tags: ['vegetariano', 'vegano', 'plantas', 'saludable', 'green'],
    icon: '🥗'
  },
  {
    id: 'premium',
    name: 'Premium / Gourmet',
    description: 'Selección premium con ingredientes de alta gama',
    basePrice: 22000,
    tags: ['premium', 'gourmet', 'lujo', 'alta gama', 'exclusivo'],
    icon: '✨'
  },
  {
    id: 'coffeebreak',
    name: 'Coffee Break',
    description: 'Coffee break para reuniones y pausas activas',
    basePrice: 3500,
    tags: ['coffee break', 'reunión', 'pausa', 'café', 'trabajo'],
    icon: '☕'
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getCategoryByKeywords = (text: string): Category | null => {
  const normalizedText = text.toLowerCase();
  
  // Buscar coincidencias exactas primero
  for (const category of categories) {
    if (category.tags.some(tag => normalizedText.includes(tag))) {
      return category;
    }
  }
  
  // Búsqueda por palabras clave más generales
  const keywordMap: { [key: string]: string } = {
    'asado': 'principal',
    'parrilla': 'principal',
    'bbq': 'principal',
    'pizza': 'principal',
    'hamburguesa': 'principal',
    'torta': 'postre',
    'chocolate': 'postre',
    'dulce': 'postre',
    'café': 'coffeebreak',
    'cafe': 'coffeebreak',
    'reunión': 'coffeebreak',
    'trabajo': 'coffeebreak',
    'empresa': 'coffeebreak',
    'cumple': 'infantil',
    'niño': 'infantil',
    'niña': 'infantil',
    'kids': 'infantil',
    'vegano': 'vegetariano',
    'verdura': 'vegetariano',
    'ensalada': 'vegetariano',
    'lujo': 'premium',
    'exclusivo': 'premium',
    'especial': 'premium',
    'boda': 'premium',
    'casamiento': 'premium',
  };
  
  for (const [keyword, categoryId] of Object.entries(keywordMap)) {
    if (normalizedText.includes(keyword)) {
      return getCategoryById(categoryId) || null;
    }
  }
  
  return null;
};
