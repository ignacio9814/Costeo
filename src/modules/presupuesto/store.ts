import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import type { Presupuesto, PresupuestoLine, PresupuestoStatus } from './types'

interface PresupuestoState {
  presupuestos: Presupuesto[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  addPresupuesto: (data: Omit<Presupuesto, 'id' | 'number' | 'createdAt'>) => Presupuesto
  updatePresupuesto: (id: string, data: Partial<Omit<Presupuesto, 'id' | 'createdAt'>>) => void
  updateStatus: (id: string, status: PresupuestoStatus) => void
  deletePresupuesto: (id: string) => void
}

function nextNumber(existing: Presupuesto[]): string {
  const nums = existing.map((p) => parseInt(p.number.replace('PRES-', ''), 10)).filter(Number.isFinite)
  return `PRES-${String(nums.length ? Math.max(...nums) + 1 : 1).padStart(4, '0')}`
}

export const usePresupuestoStore = create<PresupuestoState>()(
  persist(
    (set, get) => ({
  presupuestos: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const presupuestos = await db.presupuestos.getAll()
      set({ presupuestos, loading: false, loaded: true })
    } catch (err) {
      console.error('[Presupuesto] Error loading:', err)
      set({ loading: false })
    }
  },

  addPresupuesto: (data) => {
    const p: Presupuesto = { ...data, id: generateId(), number: nextNumber(get().presupuestos), createdAt: new Date().toISOString() }
    set((s) => ({ presupuestos: [p, ...s.presupuestos] }))
    db.presupuestos.upsert(p).catch((err) => console.error('[Presupuesto] Error saving:', err))
    return p
  },

  updatePresupuesto: (id, data) => {
    set((s) => ({ presupuestos: s.presupuestos.map((p) => p.id === id ? { ...p, ...data } : p) }))
    const updated = get().presupuestos.find((p) => p.id === id)
    if (updated) db.presupuestos.upsert(updated).catch((err) => console.error('[Presupuesto] Error updating:', err))
  },

  updateStatus: (id, status) => {
    set((s) => ({ presupuestos: s.presupuestos.map((p) => p.id === id ? { ...p, status } : p) }))
    const updated = get().presupuestos.find((p) => p.id === id)
    if (updated) db.presupuestos.upsert(updated).catch((err) => console.error('[Presupuesto] Error updating status:', err))
  },

  deletePresupuesto: (id) => {
    set((s) => ({ presupuestos: s.presupuestos.filter((p) => p.id !== id) }))
    db.presupuestos.delete(id).catch((err) => console.error('[Presupuesto] Error deleting:', err))
  },
    }),
    { name: 'kitchen-erp-presupuesto', partialize: (s) => ({ presupuestos: s.presupuestos }) }
  )
)

export function calcLines(lines: PresupuestoLine[], people: number): { subtotal: number; lines: PresupuestoLine[] } {
  const updated = lines.map((l) => ({ ...l, people: l.people || people, subtotal: l.pricePerPerson * (l.people || people) }))
  return { subtotal: updated.reduce((s, l) => s + l.subtotal, 0), lines: updated }
}
