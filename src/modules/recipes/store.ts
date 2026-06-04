import { create } from 'zustand'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import type { Recipe } from './types'

interface RecipesState {
  recipes: Recipe[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  addRecipe: (data: Omit<Recipe, 'id' | 'createdAt'>) => Recipe
  updateRecipe: (id: string, data: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => void
  deleteRecipe: (id: string) => void
}

export const useRecipesStore = create<RecipesState>()((set, get) => ({
  recipes: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const recipes = await db.recipes.getAll()
      set({ recipes, loading: false, loaded: true })
    } catch (err) {
      console.error('[Recipes] Error loading:', err)
      set({ loading: false })
    }
  },

  addRecipe: (data) => {
    const recipe: Recipe = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((s) => ({ recipes: [recipe, ...s.recipes] }))
    db.recipes.upsert(recipe).catch((err) => console.error('[Recipes] Error saving:', err))
    return recipe
  },

  updateRecipe: (id, data) => {
    set((s) => ({ recipes: s.recipes.map((r) => r.id === id ? { ...r, ...data } : r) }))
    const updated = get().recipes.find((r) => r.id === id)
    if (updated) db.recipes.upsert(updated).catch((err) => console.error('[Recipes] Error updating:', err))
  },

  deleteRecipe: (id) => {
    set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }))
    db.recipes.delete(id).catch((err) => console.error('[Recipes] Error deleting:', err))
  },
}))
