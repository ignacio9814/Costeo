export interface RecipeIngredient {
  id: string
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: string
  unitCost: number
  total: number
}

export interface Recipe {
  id: string
  name: string
  category: string
  portions: number
  ingredients: RecipeIngredient[]
  totalCost: number
  costPerPortion: number
  sellingPrice: number
  margin: number
  foodCostPercentage: number
  notes: string
  createdAt: string
}

export const RECIPE_CATEGORIES = [
  'Entrada', 'Principal', 'Postre', 'Bebida', 'Snack',
  'Desayuno', 'Almuerzo', 'Cena', 'Cóctel', 'Otro'
]
