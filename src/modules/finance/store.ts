import { create } from 'zustand'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import type { FinanceEntry } from './types'

interface FinanceState {
  entries: FinanceEntry[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  addEntry: (data: Omit<FinanceEntry, 'id' | 'createdAt'>) => FinanceEntry
  updateEntry: (id: string, data: Partial<Omit<FinanceEntry, 'id' | 'createdAt'>>) => void
  deleteEntry: (id: string) => void
  getMonthlyBalance: (year: number, month: number) => { income: number; expenses: number; profit: number }
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  entries: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const entries = await db.finance.getAll()
      set({ entries, loading: false, loaded: true })
    } catch (err) {
      console.error('[Finance] Error loading:', err)
      set({ loading: false })
    }
  },

  addEntry: (data) => {
    const entry: FinanceEntry = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((s) => ({ entries: [entry, ...s.entries] }))
    db.finance.upsert(entry).catch((err) => console.error('[Finance] Error saving:', err))
    return entry
  },

  updateEntry: (id, data) => {
    set((s) => ({ entries: s.entries.map((e) => e.id === id ? { ...e, ...data } : e) }))
    const updated = get().entries.find((e) => e.id === id)
    if (updated) db.finance.upsert(updated).catch((err) => console.error('[Finance] Error updating:', err))
  },

  deleteEntry: (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
    db.finance.delete(id).catch((err) => console.error('[Finance] Error deleting:', err))
  },

  getMonthlyBalance: (year, month) => {
    const key = `${year}-${String(month).padStart(2, '0')}`
    const filtered = get().entries.filter((e) => e.date.startsWith(key))
    const income = filtered.filter((e) => e.type === 'ingreso').reduce((s, e) => s + e.amount, 0)
    const expenses = filtered.filter((e) => e.type === 'gasto').reduce((s, e) => s + e.amount, 0)
    return { income, expenses, profit: income - expenses }
  },
}))
