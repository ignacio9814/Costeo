import { create } from 'zustand'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import type { Purchase, PurchaseItem } from './types'

interface PurchasesState {
  purchases: Purchase[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  addPurchase: (data: Omit<Purchase, 'id' | 'createdAt'>) => Purchase
  updatePurchase: (id: string, data: Partial<Omit<Purchase, 'id' | 'createdAt'>>) => void
  deletePurchase: (id: string) => void
  getPurchasesBySupplier: (supplierId: string) => Purchase[]
}

export function calcTotals(items: Omit<PurchaseItem, 'id' | 'total'>[], taxRate: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxes = subtotal * (taxRate / 100)
  return { subtotal, taxes, total: subtotal + taxes }
}

export const usePurchasesStore = create<PurchasesState>()((set, get) => ({
  purchases: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const purchases = await db.purchases.getAll()
      set({ purchases, loading: false, loaded: true })
    } catch (err) {
      console.error('[Purchases] Error loading:', err)
      set({ loading: false })
    }
  },

  addPurchase: (data) => {
    const purchase: Purchase = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((s) => ({ purchases: [purchase, ...s.purchases] }))
    db.purchases.upsert(purchase).catch((err) => console.error('[Purchases] Error saving:', err))
    return purchase
  },

  updatePurchase: (id, data) => {
    set((s) => ({ purchases: s.purchases.map((p) => p.id === id ? { ...p, ...data } : p) }))
    const updated = get().purchases.find((p) => p.id === id)
    if (updated) db.purchases.upsert(updated).catch((err) => console.error('[Purchases] Error updating:', err))
  },

  deletePurchase: (id) => {
    set((s) => ({ purchases: s.purchases.filter((p) => p.id !== id) }))
    db.purchases.delete(id).catch((err) => console.error('[Purchases] Error deleting:', err))
  },

  getPurchasesBySupplier: (supplierId) => get().purchases.filter((p) => p.supplierId === supplierId),
}))

export { generateId }
