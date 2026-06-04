export type MovementType = 'entrada' | 'salida' | 'merma' | 'ajuste'

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  merma: 'Merma / Desperdicio',
  ajuste: 'Ajuste de inventario',
}

export interface StockMovement {
  id: string
  ingredientId: string
  ingredientName: string
  type: MovementType
  quantity: number
  unit: string
  date: string
  notes: string
  purchaseId?: string
  createdAt: string
}

export interface StockLevel {
  ingredientId: string
  ingredientName: string
  currentStock: number
  unit: string
  minStock: number
  lastUpdated: string
}
