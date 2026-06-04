export type IngredientCategory =
  | 'carnes'
  | 'lacteos'
  | 'verduras'
  | 'frutas'
  | 'granos_harinas'
  | 'especias_condimentos'
  | 'aceites_grasas'
  | 'bebidas'
  | 'descartables'
  | 'limpieza'
  | 'otros'

export const INGREDIENT_CATEGORIES: Record<IngredientCategory, string> = {
  carnes: 'Carnes',
  lacteos: 'Lácteos',
  verduras: 'Verduras',
  frutas: 'Frutas',
  granos_harinas: 'Granos y Harinas',
  especias_condimentos: 'Especias y Condimentos',
  aceites_grasas: 'Aceites y Grasas',
  bebidas: 'Bebidas',
  descartables: 'Descartables',
  limpieza: 'Limpieza',
  otros: 'Otros',
}

export const COMMON_UNITS = ['kg', 'g', 'L', 'ml', 'unidad', 'docena', 'caja', 'bolsa', 'bandeja']

export interface PricePoint {
  date: string
  price: number
  supplierId?: string
  supplierName?: string
}

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  purchaseUnit: string
  useUnit: string
  conversionFactor: number
  currentCost: number
  minStock: number
  defaultSupplierId?: string
  notes: string
  priceHistory: PricePoint[]
  createdAt: string
}
