import { create } from 'zustand'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import type { Supplier } from './types'

interface SuppliersState {
  suppliers: Supplier[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  addSupplier: (data: Omit<Supplier, 'id' | 'createdAt'>) => Supplier
  updateSupplier: (id: string, data: Partial<Omit<Supplier, 'id' | 'createdAt'>>) => void
  deleteSupplier: (id: string) => void
  getById: (id: string) => Supplier | undefined
}

export const useSuppliersStore = create<SuppliersState>()((set, get) => ({
  suppliers: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const suppliers = await db.suppliers.getAll()
      set({ suppliers, loading: false, loaded: true })
    } catch (err) {
      console.error('[Suppliers] Error loading:', err)
      set({ loading: false })
    }
  },

  addSupplier: (data) => {
    const supplier: Supplier = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((s) => ({ suppliers: [supplier, ...s.suppliers] }))
    db.suppliers.upsert(supplier).catch((err) => console.error('[Suppliers] Error saving:', err))
    return supplier
  },

  updateSupplier: (id, data) => {
    set((s) => ({ suppliers: s.suppliers.map((s) => s.id === id ? { ...s, ...data } : s) }))
    const updated = get().suppliers.find((s) => s.id === id)
    if (updated) db.suppliers.upsert(updated).catch((err) => console.error('[Suppliers] Error updating:', err))
  },

  deleteSupplier: (id) => {
    set((s) => ({ suppliers: s.suppliers.filter((s) => s.id !== id) }))
    db.suppliers.delete(id).catch((err) => console.error('[Suppliers] Error deleting:', err))
  },

  getById: (id) => get().suppliers.find((s) => s.id === id),
}))
