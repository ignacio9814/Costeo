import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import type { StockMovement, StockLevel, MovementType } from './types'

interface InventoryState {
  movements: StockMovement[]
  stockLevels: StockLevel[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  addMovement: (data: Omit<StockMovement, 'id' | 'createdAt'>) => void
  initStock: (ingredientId: string, ingredientName: string, unit: string, minStock: number, quantity?: number) => void
  getStockByIngredient: (ingredientId: string) => number
  getLowStockItems: () => StockLevel[]
}

function applyMovement(current: number, type: MovementType, qty: number): number {
  switch (type) {
    case 'entrada': return current + qty
    case 'salida':
    case 'merma': return Math.max(0, current - qty)
    case 'ajuste': return qty
  }
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
  movements: [],
  stockLevels: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const [movements, stockLevels] = await Promise.all([
        db.inventory.getMovements(),
        db.inventory.getStockLevels(),
      ])
      set({ movements, stockLevels, loading: false, loaded: true })
    } catch (err) {
      console.error('[Inventory] Error loading:', err)
      set({ loading: false })
    }
  },

  addMovement: (data) => {
    const movement: StockMovement = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    const existing = get().stockLevels.find((l) => l.ingredientId === data.ingredientId)
    const newQty = applyMovement(existing?.currentStock ?? 0, data.type, data.quantity)
    const sl: StockLevel = existing
      ? { ...existing, currentStock: newQty, lastUpdated: new Date().toISOString() }
      : { ingredientId: data.ingredientId, ingredientName: data.ingredientName, currentStock: newQty, unit: data.unit, minStock: 0, lastUpdated: new Date().toISOString() }

    set((s) => ({
      movements: [movement, ...s.movements],
      stockLevels: existing
        ? s.stockLevels.map((l) => l.ingredientId === data.ingredientId ? sl : l)
        : [...s.stockLevels, sl],
    }))

    db.inventory.upsertMovement(movement).catch((err) => console.error('[Inventory] Error saving movement:', err))
    db.inventory.upsertStockLevel(sl).catch((err) => console.error('[Inventory] Error saving stock level:', err))
  },

  initStock: (ingredientId, ingredientName, unit, minStock, quantity = 0) => {
    const existing = get().stockLevels.find((l) => l.ingredientId === ingredientId)
    const sl: StockLevel = existing
      ? { ...existing, minStock }
      : { ingredientId, ingredientName, currentStock: quantity, unit, minStock, lastUpdated: new Date().toISOString() }
    set((s) => ({
      stockLevels: existing
        ? s.stockLevels.map((l) => l.ingredientId === ingredientId ? sl : l)
        : [...s.stockLevels, sl],
    }))
    db.inventory.upsertStockLevel(sl).catch((err) => console.error('[Inventory] Error init stock:', err))
  },

  getStockByIngredient: (ingredientId) =>
    get().stockLevels.find((l) => l.ingredientId === ingredientId)?.currentStock ?? 0,

  getLowStockItems: () =>
    get().stockLevels.filter((l) => l.minStock > 0 && l.currentStock <= l.minStock),
    }),
    { name: 'kitchen-erp-inventory', partialize: (s) => ({ movements: s.movements, stockLevels: s.stockLevels }) }
  )
)
