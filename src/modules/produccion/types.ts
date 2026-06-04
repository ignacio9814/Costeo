export type ShiftType = 'manana' | 'tarde'

export const SHIFT_LABELS: Record<ShiftType, string> = {
  manana: 'Turno Mañana',
  tarde: 'Turno Tarde',
}

export const SHIFT_TIMES: Record<ShiftType, string> = {
  manana: '6:00 – 14:00 hs',
  tarde: '14:00 – 22:00 hs',
}

export interface ProductionItem {
  id: string
  name: string
  quantity: number
  unit: string
  notes: string
  completed: boolean
  recipeId?: string
}

export interface ShiftEmployee {
  id: string
  name: string
  amountPaid: number
}

export interface ProductionShift {
  items: ProductionItem[]
  employees: ShiftEmployee[]
  notes: string
}

export interface ProductionDay {
  date: string       // YYYY-MM-DD
  dayLabel: string   // "Lunes 02/06"
  manana: ProductionShift
  tarde: ProductionShift
}

export interface ProductionWeek {
  id: string
  weekStart: string  // Monday YYYY-MM-DD
  weekLabel: string
  days: ProductionDay[]
  createdAt: string
}

export const COMMON_PRODUCTION_UNITS = ['unidad', 'kg', 'g', 'L', 'ml', 'porción', 'docena', 'bandeja', 'pieza']

export function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function buildWeekDays(weekStart: Date): ProductionDay[] {
  const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return {
      date: toDateStr(d),
      dayLabel: `${DAY_NAMES[i]} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      manana: { items: [], employees: [], notes: '' },
      tarde: { items: [], employees: [], notes: '' },
    }
  })
}

export function buildWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
  return `Semana del ${fmt(weekStart)} al ${fmt(end)}`
}

// ── Helpers para el informe ────────────────────────────────────────────────────
export interface WeekSummary {
  productionByItem: Record<string, { quantity: number; unit: string; completed: number; total: number }>
  employeeTotals: Record<string, number>
  totalSalaries: number
  daysWorked: number
  completionRate: number
}

export function buildWeekSummary(week: ProductionWeek): WeekSummary {
  const productionByItem: WeekSummary['productionByItem'] = {}
  const employeeTotals: Record<string, number> = {}
  let totalItems = 0
  let completedItems = 0

  for (const day of week.days) {
    for (const shift of [day.manana, day.tarde] as ProductionShift[]) {
      for (const item of shift.items) {
        totalItems++
        if (item.completed) completedItems++
        const key = item.name.toLowerCase()
        if (!productionByItem[key]) productionByItem[key] = { quantity: 0, unit: item.unit, completed: 0, total: 0 }
        productionByItem[key].total += item.quantity
        if (item.completed) productionByItem[key].completed += item.quantity
      }
      for (const emp of shift.employees) {
        employeeTotals[emp.name] = (employeeTotals[emp.name] ?? 0) + emp.amountPaid
      }
    }
  }

  const totalSalaries = Object.values(employeeTotals).reduce((s, v) => s + v, 0)
  const daysWithActivity = week.days.filter(
    (d) => d.manana.items.length > 0 || d.tarde.items.length > 0
  ).length

  return {
    productionByItem,
    employeeTotals,
    totalSalaries,
    daysWorked: daysWithActivity,
    completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
  }
}
