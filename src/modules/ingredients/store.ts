import { create } from 'zustand'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import type { Ingredient, PricePoint } from './types'

interface IngredientsState {
  ingredients: Ingredient[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  addIngredient: (data: Omit<Ingredient, 'id' | 'createdAt' | 'priceHistory'>) => Ingredient
  updateIngredient: (id: string, data: Partial<Omit<Ingredient, 'id' | 'createdAt'>>) => void
  deleteIngredient: (id: string) => void
  updatePrice: (id: string, price: number, supplierId?: string, supplierName?: string) => void
  getById: (id: string) => Ingredient | undefined
}

export const useIngredientsStore = create<IngredientsState>()((set, get) => ({
  ingredients: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const ingredients = await db.ingredients.getAll()
      set({ ingredients, loading: false, loaded: true })
    } catch (err) {
      console.error('[Ingredients] Error loading:', err)
      set({ loading: false })
    }
  },

  addIngredient: (data) => {
    const priceHistory: PricePoint[] = data.currentCost > 0
      ? [{ date: new Date().toISOString().split('T')[0], price: data.currentCost }]
      : []
    const ingredient: Ingredient = { ...data, id: generateId(), priceHistory, createdAt: new Date().toISOString() }
    set((s) => ({ ingredients: [ingredient, ...s.ingredients] }))
    db.ingredients.upsert(ingredient).catch((err) => console.error('[Ingredients] Error saving:', err))
    return ingredient
  },

  updateIngredient: (id, data) => {
    set((s) => ({ ingredients: s.ingredients.map((i) => i.id === id ? { ...i, ...data } : i) }))
    const updated = get().ingredients.find((i) => i.id === id)
    if (updated) db.ingredients.upsert(updated).catch((err) => console.error('[Ingredients] Error updating:', err))
  },

  deleteIngredient: (id) => {
    set((s) => ({ ingredients: s.ingredients.filter((i) => i.id !== id) }))
    db.ingredients.delete(id).catch((err) => console.error('[Ingredients] Error deleting:', err))
  },

  updatePrice: (id, price, supplierId, supplierName) => {
    const ingredient = get().ingredients.find((i) => i.id === id)
    if (!ingredient) return
    const point: PricePoint = { date: new Date().toISOString().split('T')[0], price, supplierId, supplierName }
    const updated: Ingredient = { ...ingredient, currentCost: price, priceHistory: [...ingredient.priceHistory, point] }
    set((s) => ({ ingredients: s.ingredients.map((i) => i.id === id ? updated : i) }))
    db.ingredients.upsert(updated).catch((err) => console.error('[Ingredients] Error updating price:', err))
  },

  getById: (id) => get().ingredients.find((i) => i.id === id),
}))
