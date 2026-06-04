export type PresupuestoStatus = 'borrador' | 'enviado' | 'aprobado' | 'rechazado'
export type EventType = 'casamiento' | 'cumpleaños' | '15_años' | 'egresados' | 'corporativo' | 'bautismo' | 'otro'

export const PRESUPUESTO_STATUS_LABELS: Record<PresupuestoStatus, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  casamiento: 'Casamiento',
  cumpleaños: 'Cumpleaños',
  '15_años': '15 Años',
  egresados: 'Egresados',
  corporativo: 'Corporativo',
  bautismo: 'Bautismo',
  otro: 'Otro',
}

export interface PresupuestoLine {
  id: string
  itemId?: string        // from catalog
  name: string
  pricePerPerson: number
  people: number
  subtotal: number
}

export interface Presupuesto {
  id: string
  number: string         // e.g. PRES-0001
  clientName: string
  clientPhone: string
  clientEmail: string
  eventType: EventType
  eventDate: string
  venue: string
  people: number
  lines: PresupuestoLine[]
  markupPercent: number  // % ganancia sobre el costo
  subtotal: number
  markupAmount: number
  total: number
  notes: string
  status: PresupuestoStatus
  validUntil: string
  createdAt: string
}
