// Módulo eliminado — OCR removido temporalmente
export interface ParsedDocument {
  supplierName: string
  cuit: string
  date: string
  total: number
  subtotal: number
  taxRate: number
  type: string
  number: string
}
export function OCRUploader(_: { open: boolean; onClose: () => void; onConfirm: (d: Partial<ParsedDocument>) => void }) {
  return null
}
