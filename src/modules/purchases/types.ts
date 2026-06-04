import type { DocumentType, PurchaseStatus } from '@/shared/types'

export interface PurchaseItem {
  id: string
  name: string
  ingredientId?: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface Purchase {
  id: string
  supplierId: string
  supplierName: string
  type: DocumentType
  number: string
  date: string
  items: PurchaseItem[]
  subtotal: number
  taxRate: number
  taxes: number
  total: number
  notes: string
  status: PurchaseStatus
  createdAt: string
}

export { DocumentType, PurchaseStatus }
