import type {
  TimeSeriesPoint,
  CategoryExpense,
  RecentPurchase,
  Alert,
  TopProduct,
  KPIConfig,
} from '@/shared/types'

export const kpiData: KPIConfig[] = [
  {
    label: 'Facturación del Mes',
    value: 2_850_000,
    change: 12.3,
    format: 'currency',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    subtitle: 'Junio 2026',
  },
  {
    label: 'Gastos Totales',
    value: 1_920_000,
    change: 8.1,
    format: 'currency',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-500/10',
    subtitle: 'Junio 2026',
  },
  {
    label: 'Ganancia Estimada',
    value: 930_000,
    change: 18.5,
    format: 'currency',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    subtitle: 'Antes de impuestos',
  },
  {
    label: 'Rentabilidad',
    value: 32.6,
    change: 3.2,
    format: 'percentage',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-500/10',
    subtitle: 'Food cost: 67.4%',
  },
]

export const timeSeriesData: TimeSeriesPoint[] = [
  { month: 'Ene', ingresos: 2_100_000, gastos: 1_550_000, ganancia: 550_000 },
  { month: 'Feb', ingresos: 1_850_000, gastos: 1_420_000, ganancia: 430_000 },
  { month: 'Mar', ingresos: 2_400_000, gastos: 1_680_000, ganancia: 720_000 },
  { month: 'Abr', ingresos: 2_650_000, gastos: 1_780_000, ganancia: 870_000 },
  { month: 'May', ingresos: 2_540_000, gastos: 1_770_000, ganancia: 770_000 },
  { month: 'Jun', ingresos: 2_850_000, gastos: 1_920_000, ganancia: 930_000 },
]

export const categoryExpenses: CategoryExpense[] = [
  { name: 'Materias Primas', amount: 980_000, percentage: 51, color: '#6366f1' },
  { name: 'Personal', amount: 520_000, percentage: 27, color: '#10b981' },
  { name: 'Servicios', amount: 210_000, percentage: 11, color: '#f59e0b' },
  { name: 'Alquiler', amount: 140_000, percentage: 7.3, color: '#8b5cf6' },
  { name: 'Otros', amount: 70_000, percentage: 3.7, color: '#94a3b8' },
]

export const recentPurchases: RecentPurchase[] = [
  {
    id: '1',
    supplier: 'Distribuidora Norte SRL',
    date: '2026-06-02',
    type: 'factura_a',
    amount: 185_000,
    status: 'confirmed',
  },
  {
    id: '2',
    supplier: 'Lácteos del Valle',
    date: '2026-06-01',
    type: 'factura_b',
    amount: 42_500,
    status: 'confirmed',
  },
  {
    id: '3',
    supplier: 'Carnes Premium SA',
    date: '2026-06-01',
    type: 'factura_a',
    amount: 312_000,
    status: 'pending',
  },
  {
    id: '4',
    supplier: 'Verdulería Mayorista',
    date: '2026-05-31',
    type: 'ticket',
    amount: 18_700,
    status: 'confirmed',
  },
  {
    id: '5',
    supplier: 'Bebidas y Más',
    date: '2026-05-30',
    type: 'factura_b',
    amount: 95_300,
    status: 'confirmed',
  },
]

export const topProducts: TopProduct[] = [
  { name: 'Harina 000', amount: 145_000, unit: '850 kg', trend: 12 },
  { name: 'Carne vacuna', amount: 312_000, unit: '480 kg', trend: -5 },
  { name: 'Queso fresco', amount: 98_000, unit: '280 kg', trend: 18 },
  { name: 'Aceite de girasol', amount: 76_000, unit: '340 L', trend: 8 },
  { name: 'Azúcar', amount: 52_000, unit: '520 kg', trend: 3 },
]

export const dashboardAlerts: Alert[] = [
  {
    id: '1',
    type: 'price_increase',
    title: 'Aumento de precio detectado',
    description: 'Carne vacuna subió un 22% en el último mes',
    severity: 'critical',
    date: '2026-06-02',
    read: false,
  },
  {
    id: '2',
    type: 'low_stock',
    title: 'Stock bajo',
    description: 'Harina 000: quedan 15 kg (mínimo: 50 kg)',
    severity: 'warning',
    date: '2026-06-01',
    read: false,
  },
  {
    id: '3',
    type: 'expiring',
    title: 'Producto próximo a vencer',
    description: 'Queso fresco vence en 3 días',
    severity: 'warning',
    date: '2026-06-01',
    read: true,
  },
]
