import { useState } from 'react'
import { Plus, Pencil, Trash2, CalendarDays, Search, X } from 'lucide-react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { Button, Badge, Input, Select, Textarea, Modal, EmptyState } from '@/shared/components/ui'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useEventsStore } from './store'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate } from '@/shared/utils/date'
import { generateId } from '@/shared/utils/id'
import { EVENT_STATUS_LABELS, type GastronomicEvent, type EventStatus } from './types'

const STATUS_OPTIONS = Object.entries(EVENT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))

type StatusVariant = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'indigo'
const STATUS_VARIANT: Record<EventStatus, StatusVariant> = {
  cotizacion: 'default',
  confirmado: 'info',
  en_proceso: 'warning',
  completado: 'success',
  cancelado: 'danger',
}

interface FormMenuItem { name: string; pricePerPerson: number }
interface FormData {
  name: string
  clientName: string
  date: string
  people: number
  venue: string
  menuItems: FormMenuItem[]
  sellingPrice: number
  status: EventStatus
  notes: string
}

function EventForm({ open, onClose, event }: { open: boolean; onClose: () => void; event?: GastronomicEvent | null }) {
  const { addEvent, updateEvent } = useEventsStore()
  const { register, control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: event
      ? { name: event.name, clientName: event.clientName, date: event.date, people: event.people, venue: event.venue, menuItems: event.menuItems, sellingPrice: event.sellingPrice, status: event.status, notes: event.notes }
      : { date: '', people: 50, menuItems: [{ name: '', pricePerPerson: 0 }], sellingPrice: 0, status: 'cotizacion', notes: '' },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'menuItems' })
  const watchedItems = useWatch({ control, name: 'menuItems' }) ?? []
  const watchedPeople = useWatch({ control, name: 'people' }) ?? 1
  const watchedSelling = useWatch({ control, name: 'sellingPrice' }) ?? 0

  const totalCost = watchedItems.reduce((s, i) => s + (Number(i?.pricePerPerson) || 0) * (Number(watchedPeople) || 1), 0)
  const margin = Number(watchedSelling) - totalCost

  function onSubmit(data: FormData) {
    const menuItems = data.menuItems.map((m) => ({ id: generateId(), name: m.name, pricePerPerson: Number(m.pricePerPerson) }))
    const cost = menuItems.reduce((s, m) => s + m.pricePerPerson * Number(data.people), 0)
    const payload = { name: data.name, clientName: data.clientName, date: data.date, people: Number(data.people), venue: data.venue, menuItems, status: data.status, notes: data.notes, totalCost: cost, sellingPrice: Number(data.sellingPrice), margin: Number(data.sellingPrice) - cost }
    if (event) updateEvent(event.id, payload)
    else addEvent(payload)
    onClose()
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? 'Editar Evento' : 'Nuevo Evento'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="event-form">{event ? 'Guardar' : 'Crear evento'}</Button>
        </>
      }
    >
      <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre del evento" placeholder="Casamiento García" {...register('name', { required: true })} />
          <Input label="Cliente" placeholder="Juan García" {...register('clientName')} />
          <Input label="Fecha del evento" type="date" {...register('date')} />
          <Input label="Cantidad de personas" type="number" min="1" {...register('people', { valueAsNumber: true })} />
          <div className="sm:col-span-2">
            <Input label="Lugar / Salón" placeholder="Salón Los Olivos, San Miguel" {...register('venue')} />
          </div>
          <Select label="Estado" options={STATUS_OPTIONS} {...register('status')} />
        </div>

        {/* Menu items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Items del Menú</h4>
            <Button type="button" variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => append({ name: '', pricePerPerson: 0 })}>Agregar</Button>
          </div>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-7">
                  <Input label={i === 0 ? 'Descripción' : undefined} placeholder="Cena principal" {...register(`menuItems.${i}.name`)} />
                </div>
                <div className="col-span-4">
                  <Input label={i === 0 ? 'Precio/persona' : undefined} type="number" step="0.01" min="0" {...register(`menuItems.${i}.pricePerPerson`, { valueAsNumber: true })} />
                </div>
                <div className="col-span-1 pb-0.5 flex justify-end">
                  <button type="button" onClick={() => remove(i)} disabled={fields.length === 1} className="h-9 w-9 flex items-center justify-center rounded text-gray-400 hover:text-red-500 disabled:opacity-30">
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Costo total del evento ({watchedPeople} personas)</span>
              <span className="tabular-nums">{formatCurrency(totalCost)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Input label="Precio de venta total" type="number" step="0.01" {...register('sellingPrice', { valueAsNumber: true })} />
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Margen estimado</div>
                <div className={`text-sm font-bold mt-1 ${margin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(margin)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Textarea label="Notas" placeholder="Requerimientos especiales, alergias, decoración..." rows={2} {...register('notes')} />
      </form>
    </Modal>
  )
}

export default function Events() {
  const { events, deleteEvent } = useEventsStore()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<GastronomicEvent | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = events.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.clientName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Eventos"
        description={`${events.length} evento${events.length !== 1 ? 's' : ''}`}
        actions={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nuevo evento</Button>}
      />

      <div className="mb-4">
        <Input placeholder="Buscar eventos o clientes..." icon={<Search size={13} />} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarDays size={26} />}
            title={search ? 'Sin resultados' : 'Sin eventos'}
            description="Registrá eventos gastronómicos con su menú, costos y rentabilidad esperada."
            action={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nuevo evento</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ev) => (
            <Card key={ev.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{ev.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ev.clientName}</p>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => { setEditing(ev); setFormOpen(true) }} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(ev.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={STATUS_VARIANT[ev.status]}>{EVENT_STATUS_LABELS[ev.status]}</Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(ev.date)}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{ev.people} personas · {ev.venue || 'Sin lugar definido'}</div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                    <div className="text-[10px] text-gray-400">Precio venta</div>
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{ev.sellingPrice > 0 ? formatCurrency(ev.sellingPrice) : '—'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                    <div className="text-[10px] text-gray-400">Margen</div>
                    <div className={`text-xs font-bold ${ev.margin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {ev.margin !== 0 ? formatCurrency(ev.margin) : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white dark:bg-[#1A1D2E] rounded-xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-sm font-semibold mb-2">Eliminar evento</h3>
            <p className="text-xs text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={() => { deleteEvent(deleteId); setDeleteId(null) }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <EventForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} event={editing} />
    </div>
  )
}
