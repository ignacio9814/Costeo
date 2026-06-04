import { create } from 'zustand'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import {
  getMondayOf, toDateStr, buildWeekDays, buildWeekLabel,
  type ProductionWeek, type ProductionItem, type ShiftEmployee, type ShiftType,
} from './types'

interface ProduccionState {
  weeks: ProductionWeek[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  getOrCreateWeek: (date?: Date) => ProductionWeek
  deleteWeek: (weekId: string) => void
  addItem: (weekId: string, date: string, shift: ShiftType, item: Omit<ProductionItem, 'id' | 'completed'>) => void
  toggleItem: (weekId: string, date: string, shift: ShiftType, itemId: string) => void
  removeItem: (weekId: string, date: string, shift: ShiftType, itemId: string) => void
  addEmployee: (weekId: string, date: string, shift: ShiftType, employee: Omit<ShiftEmployee, 'id'>) => void
  updateEmployee: (weekId: string, date: string, shift: ShiftType, employeeId: string, updates: Partial<ShiftEmployee>) => void
  removeEmployee: (weekId: string, date: string, shift: ShiftType, employeeId: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
type Shift = ProductionWeek['days'][0]['manana']

function mutateShift(
  weeks: ProductionWeek[],
  weekId: string,
  date: string,
  shift: ShiftType,
  updater: (s: Shift) => Shift
): ProductionWeek[] {
  return weeks.map((w) =>
    w.id !== weekId ? w : {
      ...w,
      days: w.days.map((d) =>
        d.date !== date ? d : { ...d, [shift]: updater(d[shift]) }
      ),
    }
  )
}

function saveWeek(weeks: ProductionWeek[], weekId: string) {
  const week = weeks.find((w) => w.id === weekId)
  if (week) db.produccion.upsert(week).catch((err) => console.error('[Produccion] Error saving week:', err))
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useProduccionStore = create<ProduccionState>()((set, get) => ({
  weeks: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const weeks = await db.produccion.getAll()
      set({ weeks, loading: false, loaded: true })
    } catch (err) {
      console.error('[Produccion] Error loading:', err)
      set({ loading: false })
    }
  },

  // ── Semana ──────────────────────────────────────────────────────────────────
  getOrCreateWeek: (date = new Date()) => {
    const monday = getMondayOf(date)
    const weekStart = toDateStr(monday)
    const existing = get().weeks.find((w) => w.weekStart === weekStart)
    if (existing) return existing

    const week: ProductionWeek = {
      id: generateId(),
      weekStart,
      weekLabel: buildWeekLabel(monday),
      days: buildWeekDays(monday),
      createdAt: new Date().toISOString(),
    }
    // Optimista: actualiza la UI de inmediato, sin rollback
    set((s) => ({ weeks: [week, ...s.weeks] }))
    // Guarda en Supabase en paralelo (sin rollback si falla)
    db.produccion.upsert(week).catch((err) => console.error('[Produccion] Error creating week:', err))
    return week
  },

  deleteWeek: (weekId) => {
    set((s) => ({ weeks: s.weeks.filter((w) => w.id !== weekId) }))
    db.produccion.delete(weekId).catch((err) => console.error('[Produccion] Error deleting week:', err))
  },

  // ── Items de producción ─────────────────────────────────────────────────────
  addItem: (weekId, date, shift, itemData) => {
    const item: ProductionItem = { ...itemData, id: generateId(), completed: false }
    const weeks = mutateShift(get().weeks, weekId, date, shift, (s) => ({ ...s, items: [...s.items, item] }))
    set({ weeks })
    saveWeek(weeks, weekId)
  },

  toggleItem: (weekId, date, shift, itemId) => {
    const weeks = mutateShift(get().weeks, weekId, date, shift, (s) => ({
      ...s,
      items: s.items.map((i) => i.id === itemId ? { ...i, completed: !i.completed } : i),
    }))
    set({ weeks })
    saveWeek(weeks, weekId)
  },

  removeItem: (weekId, date, shift, itemId) => {
    const weeks = mutateShift(get().weeks, weekId, date, shift, (s) => ({
      ...s,
      items: s.items.filter((i) => i.id !== itemId),
    }))
    set({ weeks })
    saveWeek(weeks, weekId)
  },

  // ── Empleados ───────────────────────────────────────────────────────────────
  addEmployee: (weekId, date, shift, empData) => {
    const emp: ShiftEmployee = { ...empData, id: generateId() }
    const weeks = mutateShift(get().weeks, weekId, date, shift, (s) => ({
      ...s,
      employees: [...s.employees, emp],
    }))
    set({ weeks })
    saveWeek(weeks, weekId)
  },

  updateEmployee: (weekId, date, shift, employeeId, updates) => {
    const weeks = mutateShift(get().weeks, weekId, date, shift, (s) => ({
      ...s,
      employees: s.employees.map((e) => e.id === employeeId ? { ...e, ...updates } : e),
    }))
    set({ weeks })
    saveWeek(weeks, weekId)
  },

  removeEmployee: (weekId, date, shift, employeeId) => {
    const weeks = mutateShift(get().weeks, weekId, date, shift, (s) => ({
      ...s,
      employees: s.employees.filter((e) => e.id !== employeeId),
    }))
    set({ weeks })
    saveWeek(weeks, weekId)
  },
}))
