export interface SuggestedDishPrice {
  id: string;
  name: string;
  unitLabel: string;
  suggestedPrice: number;
  description: string;
  tags: string[];
}

const createTags = (value: string[]) => value.map((item) => item.toLowerCase());

export const suggestedDishPrices: SuggestedDishPrice[] = [
  {
    id: 'sfijas',
    name: 'Sfijas',
    unitLabel: 'por persona',
    suggestedPrice: 3200,
    description: 'Referencia sugerida para bandejeo o mesa árabe.',
    tags: createTags(['sfijas', 'sfiha', 'fatay', 'arabes'])
  },
  {
    id: 'asado_arabe_kg',
    name: 'Asado árabe x kg',
    unitLabel: 'por kg',
    suggestedPrice: 18500,
    description: 'Referencia para venta o compra por kilo.',
    tags: createTags(['asado arabe', 'asado árabe', 'carne arabe', 'kg'])
  },
  {
    id: 'pernil',
    name: 'Pernil',
    unitLabel: 'por persona',
    suggestedPrice: 5400,
    description: 'Valor sugerido con panes y salsas básicas.',
    tags: createTags(['pernil', 'sandwich de pernil'])
  },
  {
    id: 'sushi',
    name: 'Isla de sushi',
    unitLabel: 'por persona',
    suggestedPrice: 9500,
    description: 'Referencia premium para estación o isla.',
    tags: createTags(['sushi', 'isla de sushi'])
  },
  {
    id: 'empanadas',
    name: 'Empanadas',
    unitLabel: 'por persona',
    suggestedPrice: 2900,
    description: 'Promedio sugerido para servicio de copetín.',
    tags: createTags(['empanadas', 'copetin', 'copetín'])
  },
  {
    id: 'mesa_dulce',
    name: 'Mesa dulce',
    unitLabel: 'por persona',
    suggestedPrice: 4100,
    description: 'Incluye surtido dulce estándar.',
    tags: createTags(['mesa dulce', 'postres', 'dulce'])
  },
  {
    id: 'barra_tragos',
    name: 'Barra de tragos',
    unitLabel: 'por persona',
    suggestedPrice: 6800,
    description: 'Referencia para barra básica con tragos clásicos.',
    tags: createTags(['barra', 'tragos', 'barra de tragos', 'cocteleria'])
  },
  {
    id: 'asado_criollo',
    name: 'Asado criollo',
    unitLabel: 'por persona',
    suggestedPrice: 8900,
    description: 'Sugerido para estación de asado o servicio principal.',
    tags: createTags(['asado', 'parrilla', 'criollo'])
  }
];

export const findSuggestedDishPrices = (search: string): SuggestedDishPrice[] => {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return suggestedDishPrices.slice(0, 6);

  return suggestedDishPrices
    .map((item) => {
      const haystack = [item.name.toLowerCase(), item.description.toLowerCase(), ...item.tags].join(' ');
      const score = haystack.includes(normalized)
        ? normalized.length + (item.name.toLowerCase().includes(normalized) ? 10 : 0)
        : item.tags.filter((tag) => tag.includes(normalized) || normalized.includes(tag)).length * 5;

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item)
    .slice(0, 6);
};
