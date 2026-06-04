import { useState, useMemo } from 'react'
import {
  Plus, Trash2, FileText, Search, X, ClipboardList,
  FileDown, Check, ChevronDown, ChevronUp, Settings2, Percent,
} from 'lucide-react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { Button, Badge, Input, Select, Textarea, Modal, EmptyState, Tabs } from '@/shared/components/ui'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { usePresupuestoStore } from './store'
import { CATALOG_CATEGORIES, CATALOG_ITEMS, CATEGORY_COLORS, type CatalogItem } from './data/catalog'
import {
  PRESUPUESTO_STATUS_LABELS, EVENT_TYPE_LABELS,
  type Presupuesto, type PresupuestoStatus, type EventType,
} from './types'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate } from '@/shared/utils/date'
import { generateId, today } from '@/shared/utils/id'

// ─── Tipos de servicio y urgencia (del módulo Costeo) ─────────────────────────
const SERVICE_LABELS = { basic: 'Básico (−20%)', standard: 'Estándar', premium: 'Premium (+50%)' }
const URGENCY_LABELS = { normal: 'Normal (>15 días)', urgent: 'Urgente 7−14 días (+20%)', veryUrgent: 'Muy urgente <7 días (+40%)' }
const SERVICE_MULT = { basic: 0.8, standard: 1.0, premium: 1.5 }
const URGENCY_MULT = { normal: 1.0, urgent: 1.2, veryUrgent: 1.4 }

type ServiceLevel = 'basic' | 'standard' | 'premium'
type UrgencyLevel = 'normal' | 'urgent' | 'veryUrgent'

type StatusVariant = 'default' | 'info' | 'warning' | 'success' | 'danger'
const STATUS_VARIANT: Record<PresupuestoStatus, StatusVariant> = {
  borrador: 'default', enviado: 'info', aprobado: 'success', rechazado: 'danger',
}

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const STATUS_OPTIONS = Object.entries(PRESUPUESTO_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
const SERVICE_OPTIONS = Object.entries(SERVICE_LABELS).map(([v, l]) => ({ value: v, label: l }))
const URGENCY_OPTIONS = Object.entries(URGENCY_LABELS).map(([v, l]) => ({ value: v, label: l }))

// ─── Catálogo ─────────────────────────────────────────────────────────────────
function CatalogBrowser({ open, onClose, onSelect, people }: {
  open: boolean; onClose: () => void
  onSelect: (item: CatalogItem, qty: number) => void; people: number
}) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')

  const filtered = CATALOG_ITEMS.filter((i) =>
    (cat === 'all' || i.categoryId === cat) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()) || i.tags.some((t) => t.includes(search.toLowerCase())))
  )

  return (
    <Modal open={open} onClose={onClose} title="Catálogo Santino" description="Seleccioná los platos y servicios" size="xl"
      footer={<Button variant="secondary" onClick={onClose}>Cerrar</Button>}
    >
      <div className="space-y-3">
        <Input placeholder="Buscar plato o servicio..." icon={<Search size={13} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-1 min-w-max">
            {[{ id: 'all', name: `Todos (${CATALOG_ITEMS.length})` }, ...CATALOG_CATEGORIES.map((c) => ({ id: c.id, name: `${c.name} (${CATALOG_ITEMS.filter((i) => i.categoryId === c.id).length})` }))].map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${cat === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map((item) => (
            <button key={item.id} onClick={() => { onSelect(item, people); onClose() }}
              className="flex items-start justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</div>
                <div className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${CATEGORY_COLORS[item.categoryId] ?? ''}`}>
                  {CATALOG_CATEGORIES.find((c) => c.id === item.categoryId)?.name}
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 ml-3 flex-shrink-0 tabular-nums">
                {formatCurrency(item.pricePerPerson)}/p
              </span>
            </button>
          ))}
          {filtered.length === 0 && <div className="col-span-2 text-center py-8 text-xs text-gray-400">Sin resultados</div>}
        </div>
      </div>
    </Modal>
  )
}

// ─── Formulario de cotización ─────────────────────────────────────────────────
interface FormLine { itemId: string; name: string; pricePerPerson: number; people: number }
interface FormData {
  clientName: string; clientPhone: string; clientEmail: string
  eventType: EventType; eventDate: string; venue: string; people: number
  lines: FormLine[]
  serviceLevel: ServiceLevel; urgency: UrgencyLevel; inflationRate: number
  markupPercent: number; notes: string; status: PresupuestoStatus; validUntil: string
}

function CotizacionForm({ open, onClose, presupuesto }: { open: boolean; onClose: () => void; presupuesto?: Presupuesto | null }) {
  const { addPresupuesto, updatePresupuesto } = usePresupuestoStore()
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [showFactors, setShowFactors] = useState(false)

  const defaultValues: FormData = presupuesto ? {
    clientName: presupuesto.clientName, clientPhone: presupuesto.clientPhone,
    clientEmail: presupuesto.clientEmail, eventType: presupuesto.eventType,
    eventDate: presupuesto.eventDate, venue: presupuesto.venue, people: presupuesto.people,
    lines: presupuesto.lines.map((l) => ({ itemId: l.itemId ?? '', name: l.name, pricePerPerson: l.pricePerPerson, people: l.people })),
    serviceLevel: 'standard', urgency: 'normal', inflationRate: 0,
    markupPercent: presupuesto.markupPercent, notes: presupuesto.notes,
    status: presupuesto.status, validUntil: presupuesto.validUntil,
  } : {
    clientName: '', clientPhone: '', clientEmail: '', eventType: 'otro',
    eventDate: '', venue: '', people: 100, lines: [],
    serviceLevel: 'standard', urgency: 'normal', inflationRate: 0,
    markupPercent: 30, notes: '', status: 'borrador', validUntil: '',
  }

  const { register, control, handleSubmit, watch, setValue } = useForm<FormData>({ defaultValues })
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const watchedLines = useWatch({ control, name: 'lines' }) ?? []
  const watchedPeople = Number(useWatch({ control, name: 'people' })) || 100
  const watchedMarkup = Number(useWatch({ control, name: 'markupPercent' })) || 30
  const watchedService = useWatch({ control, name: 'serviceLevel' }) as ServiceLevel
  const watchedUrgency = useWatch({ control, name: 'urgency' }) as UrgencyLevel
  const watchedInflation = Number(useWatch({ control, name: 'inflationRate' })) || 0

  const factorMultiplier = SERVICE_MULT[watchedService] * URGENCY_MULT[watchedUrgency] * (1 + watchedInflation / 100)
  const baseCost = watchedLines.reduce((s, l) => s + (Number(l?.pricePerPerson) || 0) * (Number(l?.people) || watchedPeople), 0)
  const adjustedCost = baseCost * factorMultiplier
  const markupAmount = adjustedCost * (watchedMarkup / 100)
  const total = adjustedCost + markupAmount
  const factorsApplied = watchedService !== 'standard' || watchedUrgency !== 'normal' || watchedInflation > 0

  function addFromCatalog(item: CatalogItem, qty: number) {
    append({ itemId: item.id, name: item.name, pricePerPerson: item.pricePerPerson, people: qty })
  }

  function onSubmit(data: FormData) {
    const people = Number(data.people)
    const serviceMult = SERVICE_MULT[data.serviceLevel]
    const urgencyMult = URGENCY_MULT[data.urgency]
    const inflMult = 1 + Number(data.inflationRate) / 100
    const factor = serviceMult * urgencyMult * inflMult

    const lines = data.lines.map((l) => {
      const lPeople = Number(l.people) || people
      const adjustedPrice = Number(l.pricePerPerson) * factor
      return {
        id: generateId(),
        itemId: l.itemId || undefined,
        name: l.name,
        pricePerPerson: adjustedPrice,
        people: lPeople,
        subtotal: adjustedPrice * lPeople,
      }
    })
    const sub = lines.reduce((s, l) => s + l.subtotal, 0)
    const markup = sub * (Number(data.markupPercent) / 100)

    const payload = {
      clientName: data.clientName, clientPhone: data.clientPhone, clientEmail: data.clientEmail,
      eventType: data.eventType, eventDate: data.eventDate, venue: data.venue, people,
      lines, markupPercent: Number(data.markupPercent), subtotal: sub,
      markupAmount: markup, total: sub + markup,
      notes: data.notes, status: data.status, validUntil: data.validUntil,
    }

    if (presupuesto) updatePresupuesto(presupuesto.id, payload)
    else addPresupuesto(payload)
    onClose()
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={presupuesto ? `Editar ${presupuesto.number}` : 'Nueva Cotización'} size="xl"
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="cot-form">{presupuesto ? 'Guardar' : 'Crear cotización'}</Button></>}
      >
        <form id="cot-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cliente */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Cliente</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3"><Input label="Nombre completo *" placeholder="García, Juan" {...register('clientName', { required: true })} /></div>
              <Input label="Teléfono" placeholder="+54 9 381 000-0000" {...register('clientPhone')} />
              <Input label="Email" type="email" placeholder="juan@email.com" {...register('clientEmail')} />
              <Select label="Estado" options={STATUS_OPTIONS} {...register('status')} />
            </div>
          </div>

          {/* Evento */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Evento</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select label="Tipo de evento" options={EVENT_TYPE_OPTIONS} {...register('eventType')} />
              <Input label="Fecha del evento" type="date" {...register('eventDate')} />
              <Input label="Personas" type="number" min="1" {...register('people', { valueAsNumber: true })} />
              <Input label="Válido hasta" type="date" {...register('validUntil')} />
              <div className="col-span-2 sm:col-span-4"><Input label="Lugar / Salón" placeholder="Salón Los Olivos, San Miguel de Tucumán" {...register('venue')} /></div>
            </div>
          </div>

          {/* Menú */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Platos y Servicios</h4>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" icon={<ClipboardList size={12} />} onClick={() => setCatalogOpen(true)}>Del catálogo</Button>
                <Button type="button" variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => append({ itemId: '', name: '', pricePerPerson: 0, people: watchedPeople })}>Manual</Button>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <ClipboardList size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Agregá platos del catálogo o ingresá ítems manualmente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, i) => {
                  const lPeople = Number(watchedLines[i]?.people) || watchedPeople
                  const base = (Number(watchedLines[i]?.pricePerPerson) || 0) * lPeople
                  const adj = base * factorMultiplier
                  return (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                      <div className="col-span-5 sm:col-span-6">
                        <Input label={i === 0 ? 'Descripción' : undefined} placeholder="Nombre del plato/servicio" {...register(`lines.${i}.name`, { required: true })} />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <Input label={i === 0 ? '$/persona' : undefined} type="number" step="0.01" min="0" {...register(`lines.${i}.pricePerPerson`, { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <Input label={i === 0 ? 'Personas' : undefined} type="number" min="1" {...register(`lines.${i}.people`, { valueAsNumber: true })} />
                      </div>
                      <div className="col-span-1 flex justify-end pb-0.5">
                        <button type="button" onClick={() => remove(i)} className="h-9 w-9 flex items-center justify-center rounded text-gray-400 hover:text-red-500">
                          <X size={13} />
                        </button>
                      </div>
                      <div className="col-span-12 flex justify-end">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
                          Base: {formatCurrency(base)}{factorsApplied && ` → Ajustado: ${formatCurrency(adj)}`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Factores paramétricos */}
          <div>
            <button type="button" onClick={() => setShowFactors(!showFactors)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Settings2 size={13} />
              Factores de ajuste (servicio, urgencia, inflación)
              {showFactors ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {factorsApplied && <Badge variant="indigo">Activos</Badge>}
            </button>

            {showFactors && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <Select label="Nivel de servicio" options={SERVICE_OPTIONS} {...register('serviceLevel')} />
                <Select label="Urgencia" options={URGENCY_OPTIONS} {...register('urgency')} />
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Inflación mensual: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{watchedInflation}%</span>
                  </label>
                  <input type="range" min={0} max={30} step={0.5} className="w-full accent-indigo-600" {...register('inflationRate', { valueAsNumber: true })} />
                </div>
                {factorsApplied && (
                  <div className="sm:col-span-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                    Multiplicador total aplicado: <strong>×{factorMultiplier.toFixed(3)}</strong>
                    {watchedService !== 'standard' && ` · Servicio ${SERVICE_LABELS[watchedService]}`}
                    {watchedUrgency !== 'normal' && ` · ${URGENCY_LABELS[watchedUrgency]}`}
                    {watchedInflation > 0 && ` · Inflación +${watchedInflation}%`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totales */}
          {fields.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Costo base de platos</span>
                <span className="tabular-nums">{formatCurrency(baseCost)}</span>
              </div>
              {factorsApplied && (
                <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400">
                  <span>Costo ajustado (×{factorMultiplier.toFixed(3)})</span>
                  <span className="tabular-nums">{formatCurrency(adjustedCost)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Ganancia</span>
                  <div className="relative flex items-center">
                    <input type="number" min="0" max="200" className="w-14 h-7 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent" {...register('markupPercent', { valueAsNumber: true })} />
                    <Percent size={11} className="absolute right-1.5 text-gray-400" />
                  </div>
                </div>
                <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{formatCurrency(markupAmount)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-sm text-gray-900 dark:text-gray-100">
                <span>TOTAL</span>
                <span className="tabular-nums text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
              </div>
              {total > 0 && (
                <div className="text-[10px] text-gray-400 text-right">
                  Seña 30%: {formatCurrency(total * 0.3)} · Por persona: {formatCurrency(total / watchedPeople)}
                </div>
              )}
            </div>
          )}

          <Textarea label="Condiciones y notas" placeholder="Forma de pago, señas, observaciones..." rows={2} {...register('notes')} />
        </form>
      </Modal>

      <CatalogBrowser open={catalogOpen} onClose={() => setCatalogOpen(false)} onSelect={addFromCatalog} people={watchedPeople} />
    </>
  )
}

// ─── Generación de PDF profesional Santino ────────────────────────────────────
async function generateSantinoReceipt(p: Presupuesto) {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 18

  // ── Encabezado ──────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(0)
  doc.text('SANTINO EVENTOS', W / 2, 22, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text('Cocina Gastronómica Profesional', W / 2, 29, { align: 'center' })
  doc.text('San Miguel de Tucumán, Tucumán', W / 2, 34, { align: 'center' })

  doc.setDrawColor(0)
  doc.setLineWidth(0.8)
  doc.line(M, 38, W - M, 38)

  // ── Título ──────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(0)
  doc.text('COTIZACIÓN / PRESUPUESTO', W / 2, 47, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`N° ${p.number}`, W / 2, 54, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80)
  doc.text(`Emitida: ${formatDate(p.createdAt)}`, W / 2, 60, { align: 'center' })
  if (p.validUntil) doc.text(`Válida hasta: ${formatDate(p.validUntil)}`, W / 2, 65, { align: 'center' })

  // ── Dos columnas: cliente | evento ───────────────────────────────────────────
  let y = 75
  doc.setDrawColor(180)
  doc.setLineWidth(0.3)
  doc.line(M, y - 2, W - M, y - 2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(0)
  doc.text('DATOS DEL CLIENTE', M, y + 4)
  doc.text('DATOS DEL EVENTO', W / 2 + 4, y + 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(40)

  let ly = y + 10
  doc.text(p.clientName || '—', M, ly)
  doc.text(EVENT_TYPE_LABELS[p.eventType] || '—', W / 2 + 4, ly)
  ly += 5

  if (p.clientPhone) { doc.text(`Tel: ${p.clientPhone}`, M, ly) }
  if (p.eventDate) doc.text(`Fecha: ${formatDate(p.eventDate)}`, W / 2 + 4, ly)
  ly += 5

  if (p.clientEmail) { doc.text(p.clientEmail, M, ly) }
  doc.text(`Personas: ${p.people}`, W / 2 + 4, ly)
  ly += 5

  if (p.venue) doc.text(`Lugar: ${p.venue}`, W / 2 + 4, ly)
  ly += 3

  doc.setDrawColor(180)
  doc.line(M, ly, W - M, ly)

  // ── Tabla de ítems ───────────────────────────────────────────────────────────
  ly += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(0)
  doc.text('DETALLE DE SERVICIOS', M, ly + 4)
  ly += 2

  autoTable(doc, {
    startY: ly + 6,
    head: [['Descripción', 'Precio / Persona', 'Personas', 'Subtotal']],
    body: p.lines.map((l) => [
      l.name,
      formatCurrency(l.pricePerPerson),
      String(l.people),
      formatCurrency(l.subtotal),
    ]),
    styles: { fontSize: 8.5, cellPadding: 2.8 },
    headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [247, 247, 247] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'right', cellWidth: 35 },
      2: { halign: 'right', cellWidth: 22 },
      3: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: M, right: M },
  })

  const tableBottom = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

  // ── Totales ──────────────────────────────────────────────────────────────────
  const tX = W - M - 80
  let tY = tableBottom + 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(60)
  doc.text('Costo base de servicios:', tX, tY)
  doc.text(formatCurrency(p.subtotal), W - M, tY, { align: 'right' })
  tY += 6

  doc.text(`Ganancia (${p.markupPercent}%):`, tX, tY)
  doc.text(formatCurrency(p.markupAmount), W - M, tY, { align: 'right' })
  tY += 2

  doc.setDrawColor(0)
  doc.setLineWidth(0.4)
  doc.line(tX, tY + 1, W - M, tY + 1)
  tY += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(0)
  doc.text('TOTAL:', tX, tY)
  doc.text(formatCurrency(p.total), W - M, tY, { align: 'right' })
  tY += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text(`Precio por persona: ${formatCurrency(p.total / p.people)}`, W - M, tY, { align: 'right' })
  if (p.total > 0) {
    tY += 5
    doc.text(`Seña (30%): ${formatCurrency(p.total * 0.3)}`, W - M, tY, { align: 'right' })
  }

  // ── Condiciones / notas ──────────────────────────────────────────────────────
  let nY = Math.max(tY + 12, tableBottom + 50)
  if (p.notes) {
    doc.setDrawColor(180)
    doc.setLineWidth(0.3)
    doc.line(M, nY, W - M, nY)
    nY += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(0)
    doc.text('CONDICIONES Y NOTAS:', M, nY)
    nY += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(40)
    const lines = doc.splitTextToSize(p.notes, W - M * 2)
    doc.text(lines, M, nY)
    nY += lines.length * 5 + 8
  }

  // ── Firmas ───────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight()
  const sigY = Math.min(nY + 15, pageH - 35)
  doc.setDrawColor(0)
  doc.setLineWidth(0.3)
  doc.line(M, sigY, M + 65, sigY)
  doc.line(W - M - 65, sigY, W - M, sigY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80)
  doc.text('Firma del cliente', M, sigY + 5)
  doc.text('Santino Eventos', W - M - 65, sigY + 5)

  // ── Pie de página ────────────────────────────────────────────────────────────
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.line(M, pageH - 15, W - M, pageH - 15)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(120)
  doc.text('Este documento es una cotización y no constituye una factura fiscal.', W / 2, pageH - 10, { align: 'center' })
  doc.text(`Emitido por Kitchen ERP — ${today()}`, W / 2, pageH - 6, { align: 'center' })

  doc.save(`Cotizacion-${p.number}-${p.clientName.replace(/\s+/g, '_')}.pdf`)
}

// ─── Página principal ──────────────────────────────────────────────────────────
const STATUS_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'borrador', label: 'Borradores' },
  { id: 'enviado', label: 'Enviadas' },
  { id: 'aprobado', label: 'Aprobadas' },
]

export default function Presupuesto() {
  const { presupuestos, deletePresupuesto, updateStatus } = usePresupuestoStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Presupuesto | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = presupuestos
    .filter((p) => activeTab === 'all' || p.status === activeTab)
    .filter((p) => !search || p.clientName.toLowerCase().includes(search.toLowerCase()) || p.number.toLowerCase().includes(search.toLowerCase()))

  const tabs = STATUS_TABS.map((t) => ({
    ...t,
    count: t.id === 'all' ? presupuestos.length : presupuestos.filter((p) => p.status === t.id).length,
  }))

  const totalAprobado = presupuestos.filter((p) => p.status === 'aprobado').reduce((s, p) => s + p.total, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Cotizaciones"
        description={`${presupuestos.length} cotizacione${presupuestos.length !== 1 ? 's' : ''} · ${formatCurrency(totalAprobado)} aprobado`}
        actions={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nueva cotización</Button>}
      />

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <Input placeholder="Buscar por cliente o número..." icon={<Search size={13} />} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={26} />}
            title={search ? 'Sin resultados' : 'Sin cotizaciones'}
            description="Creá cotizaciones profesionales con el catálogo Santino, ajustes de servicio e inflación, y generá recibos en PDF."
            action={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nueva cotización</Button>}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <th className="pl-5 py-3 text-left">N°</th>
                    <th className="px-3 py-3 text-left">Cliente</th>
                    <th className="px-3 py-3 text-left">Evento · Fecha</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="px-3 py-3 text-center">Estado</th>
                    <th className="pr-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                      <td className="pl-5 py-3.5 text-xs font-mono text-gray-500 dark:text-gray-400">{p.number}</td>
                      <td className="px-3 py-3.5 text-xs font-semibold text-gray-900 dark:text-gray-100">{p.clientName || '—'}</td>
                      <td className="px-3 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                        {EVENT_TYPE_LABELS[p.eventType]} · {p.people}p{p.eventDate ? ` · ${formatDate(p.eventDate)}` : ''}
                      </td>
                      <td className="px-3 py-3.5 text-right text-xs font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(p.total)}</td>
                      <td className="px-3 py-3.5 text-center"><Badge variant={STATUS_VARIANT[p.status]}>{PRESUPUESTO_STATUS_LABELS[p.status]}</Badge></td>
                      <td className="pr-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {p.status === 'enviado' && (
                            <button onClick={() => updateStatus(p.id, 'aprobado')} title="Aprobar" className="p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                              <Check size={13} />
                            </button>
                          )}
                          <button onClick={() => generateSantinoReceipt(p)} title="Generar recibo PDF" className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                            <FileDown size={13} />
                          </button>
                          <button onClick={() => { setEditing(p); setFormOpen(true) }} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                            <FileText size={13} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800/60">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.clientName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{p.number} · {EVENT_TYPE_LABELS[p.eventType]} · {p.people}p</div>
                    </div>
                    <Badge variant={STATUS_VARIANT[p.status]}>{PRESUPUESTO_STATUS_LABELS[p.status]}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{formatCurrency(p.total)}</span>
                    <div className="flex gap-1">
                      <button onClick={() => generateSantinoReceipt(p)} className="p-2 rounded text-gray-400 hover:text-indigo-600"><FileDown size={15} /></button>
                      <button onClick={() => { setEditing(p); setFormOpen(true) }} className="p-2 rounded text-gray-400 hover:text-indigo-600"><FileText size={15} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 rounded text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white dark:bg-[#1A1D2E] rounded-xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-sm font-semibold mb-2">Eliminar cotización</h3>
            <p className="text-xs text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={() => { deletePresupuesto(deleteId); setDeleteId(null) }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <CotizacionForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} presupuesto={editing} />
    </div>
  )
}
