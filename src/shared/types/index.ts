export type DocumentType = 'factura_a' | 'factura_b' | 'ticket' | 'remito' | 'recibo'
export type PurchaseStatus = 'draft' | 'pending' | 'confirmed' | 'reconciled'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertType = 'price_increase' | 'low_stock' | 'expiring' | 'abnormal_expense'

export interface PricePoint {
  date: string
  price: number
}

export interface TimeSeriesPoint {
  month: string
  ingresos: number
  gastos: number
  ganancia: number
}

export interface CategoryExpense {
  name: string
  amount: number
  percentage: number
  color: string
}

export interface RecentPurchase {
  id: string
  supplier: string
  date: string
  type: DocumentType
  amount: number
  status: PurchaseStatus
}

export interface TopProduct {
  name: string
  amount: number
  unit: string
  trend: number
}

export interface Alert {
  id: string
  type: AlertType
  title: string
  description: string
  severity: AlertSeverity
  date: string
  read: boolean
}

export interface KPIConfig {
  label: string
  value: number
  change: number
  format: 'currency' | 'percentage' | 'number'
  color: string
  bgColor: string
  subtitle?: string
}
