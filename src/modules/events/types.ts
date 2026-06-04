export type EventStatus = 'cotizacion' | 'confirmado' | 'en_proceso' | 'completado' | 'cancelado'

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  cotizacion: 'Cotización',
  confirmado: 'Confirmado',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export interface EventMenuItem {
  id: string
  name: string
  pricePerPerson: number
}

export interface GastronomicEvent {
  id: string
  name: string
  clientName: string
  date: string
  people: number
  menuItems: EventMenuItem[]
  status: EventStatus
  venue: string
  notes: string
  totalCost: number
  sellingPrice: number
  margin: number
  createdAt: string
}
