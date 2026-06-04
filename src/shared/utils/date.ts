import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

function toDate(date: Date | string): Date {
  return typeof date === 'string' ? parseISO(date) : date
}

export function formatDate(date: Date | string): string {
  const d = toDate(date)
  return isValid(d) ? format(d, 'dd/MM/yyyy', { locale: es }) : '—'
}

export function formatDateLong(date: Date | string): string {
  const d = toDate(date)
  return isValid(d) ? format(d, "d 'de' MMMM 'de' yyyy", { locale: es }) : '—'
}

export function formatRelative(date: Date | string): string {
  const d = toDate(date)
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true, locale: es }) : '—'
}

export function formatMonth(date: Date | string): string {
  const d = toDate(date)
  return isValid(d) ? format(d, 'MMM yyyy', { locale: es }) : '—'
}
