export type FinanceType = 'ingreso' | 'gasto'

export type FinanceCategory =
  // Ingresos (plata que reciben)
  | 'recibido_salon'
  | 'adelanto'
  | 'otros_ingresos'
  // Gastos de cocina
  | 'insumos'
  | 'sueldos'
  | 'servicios'
  | 'alquiler'
  | 'mantenimiento'
  | 'descartables'
  | 'otros_gastos'

export const INCOME_CATEGORIES: FinanceCategory[] = [
  'recibido_salon',
  'adelanto',
  'otros_ingresos',
]

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  'insumos',
  'sueldos',
  'servicios',
  'alquiler',
  'mantenimiento',
  'descartables',
  'otros_gastos',
]

export const CATEGORY_LABELS: Record<FinanceCategory, string> = {
  recibido_salon: 'Recibido del Salón',
  adelanto: 'Adelanto',
  otros_ingresos: 'Otros Ingresos',
  insumos: 'Insumos y Materias Primas',
  sueldos: 'Sueldos y Personal',
  servicios: 'Servicios (gas, luz, agua)',
  alquiler: 'Alquiler',
  mantenimiento: 'Mantenimiento y Reparaciones',
  descartables: 'Descartables',
  otros_gastos: 'Otros Gastos',
}

export interface FinanceEntry {
  id: string
  type: FinanceType
  category: FinanceCategory
  description: string
  amount: number
  date: string
  notes: string
  createdAt: string
}
