import { useState } from 'react'
import { FileDown, Table2, Calendar, BarChart3, Package, CalendarCheck, ClipboardList } from 'lucide-react'
import { Button, Select, Input, Tabs } from '@/shared/components/ui'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { usePurchasesStore } from '@/modules/purchases/store'
import { useFinanceStore } from '@/modules/finance/store'
import { useIngredientsStore } from '@/modules/ingredients/store'
import { useSuppliersStore } from '@/modules/suppliers/store'
import { useEventsStore } from '@/modules/events/store'
import { useInventoryStore } from '@/modules/inventory/store'
import { useProduccionStore } from '@/modules/produccion/store'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate } from '@/shared/utils/date'
import { today } from '@/shared/utils/id'
import { CATEGORY_LABELS } from '@/modules/finance/types'
import { EVENT_TYPE_LABELS } from '@/modules/presupuesto/types'
import { MOVEMENT_LABELS } from '@/modules/inventory/types'
import { buildWeekSummary } from '@/modules/produccion/types'

type ReportType =
  | 'purchases' | 'finance' | 'ingredients' | 'suppliers'
  | 'events' | 'produccion' | 'inventario'

interface ReportConfig {
  id: ReportType
  label: string
  icon: React.ReactNode
  description: string
  needsDateRange: boolean
}

const REPORTS: ReportConfig[] = [
  { id: 'purchases', label: 'Compras', icon: <Package size={15} />, description: 'Todas las compras del período con proveedores y totales', needsDateRange: true },
  { id: 'finance', label: 'Finanzas', icon: <BarChart3 size={15} />, description: 'Ingresos, gastos y resultado operativo del período', needsDateRange: true },
  { id: 'events', label: 'Eventos', icon: <Calendar size={15} />, description: 'Eventos y cotizaciones con costos y márgenes', needsDateRange: false },
  { id: 'produccion', label: 'Producción Semanal', icon: <CalendarCheck size={15} />, description: 'Producción, personal y sueldos por semana', needsDateRange: false },
  { id: 'inventario', label: 'Movimientos de Inventario', icon: <ClipboardList size={15} />, description: 'Entradas, salidas y mermas de insumos', needsDateRange: true },
  { id: 'ingredients', label: 'Insumos y Precios', icon: <Package size={15} />, description: 'Listado completo de insumos con precios actuales e historial', needsDateRange: false },
  { id: 'suppliers', label: 'Proveedores', icon: <Table2 size={15} />, description: 'Listado de proveedores con resumen de compras', needsDateRange: false },
]

function firstOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function csvDownload(filename: string, headers: string[], rows: string[][]) {
  const BOM = '﻿'
  const csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

async function pdfDownload(title: string, subtitle: string, headers: string[], rows: string[][]) {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF({ orientation: rows[0]?.length > 5 ? 'landscape' : 'portrait' })
  const W = doc.internal.pageSize.getWidth()

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(0)
  doc.text('SANTINO EVENTOS', W / 2, 18, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(80)
  doc.text('Cocina Gastronómica · San Miguel de Tucumán', W / 2, 24, { align: 'center' })

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(0)
  doc.text(title, 14, 36)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(80)
  doc.text(subtitle, 14, 42)

  autoTable(doc, {
    head: [headers], body: rows, startY: 48,
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 247, 247] },
  })

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(130)
  doc.text(`Generado el ${formatDate(today())} · Kitchen ERP`, 14, finalY + 10)

  doc.save(`${title.replace(/\s+/g, '_')}_${today()}.pdf`)
}

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('purchases')
  const [dateFrom, setDateFrom] = useState(firstOfMonth())
  const [dateTo, setDateTo] = useState(today())
  const [generating, setGenerating] = useState(false)

  const { purchases } = usePurchasesStore()
  const { entries } = useFinanceStore()
  const { ingredients } = useIngredientsStore()
  const { suppliers } = useSuppliersStore()
  const { events } = useEventsStore()
  const { movements } = useInventoryStore()
  const { weeks } = useProduccionStore()

  const currentReport = REPORTS.find((r) => r.id === reportType)!

  function getReportData(): { headers: string[]; rows: string[][]; subtitle: string } {
    switch (reportType) {
      case 'purchases': {
        const filtered = purchases.filter((p) => p.date >= dateFrom && p.date <= dateTo)
        const total = filtered.reduce((s, p) => s + p.total, 0)
        return {
          subtitle: `${dateFrom} → ${dateTo} · ${filtered.length} compras · Total: ${formatCurrency(total)}`,
          headers: ['Proveedor', 'Tipo', 'N°', 'Fecha', 'Subtotal', 'IVA', 'Total', 'Estado'],
          rows: filtered.map((p) => [
            p.supplierName, p.type, p.number, formatDate(p.date),
            formatCurrency(p.subtotal), formatCurrency(p.taxes), formatCurrency(p.total), p.status,
          ]),
        }
      }
      case 'finance': {
        const filtered = entries.filter((e) => e.date >= dateFrom && e.date <= dateTo)
        const income = filtered.filter((e) => e.type === 'ingreso').reduce((s, e) => s + e.amount, 0)
        const expenses = filtered.filter((e) => e.type === 'gasto').reduce((s, e) => s + e.amount, 0)
        const purchasesIn = purchases.filter((p) => p.date >= dateFrom && p.date <= dateTo && p.status === 'confirmed').reduce((s, p) => s + p.total, 0)
        return {
          subtitle: `${dateFrom} → ${dateTo} · Recibido: ${formatCurrency(income)} · Gastos: ${formatCurrency(expenses + purchasesIn)} · Resultado: ${formatCurrency(income - expenses - purchasesIn)}`,
          headers: ['Tipo', 'Categoría', 'Descripción', 'Fecha', 'Importe'],
          rows: [
            ...filtered.map((e) => [
              e.type === 'ingreso' ? 'Ingreso' : 'Gasto',
              CATEGORY_LABELS[e.category] ?? e.category,
              e.description, formatDate(e.date),
              `${e.type === 'ingreso' ? '+' : '-'}${formatCurrency(e.amount)}`,
            ]),
            purchases.filter((p) => p.date >= dateFrom && p.date <= dateTo && p.status === 'confirmed').map((p) => [
              'Gasto', 'Compra de insumos', p.supplierName || 'Proveedor', formatDate(p.date), `-${formatCurrency(p.total)}`,
            ]),
          ].flat(),
        }
      }
      case 'events': {
        return {
          subtitle: `${events.length} evento${events.length !== 1 ? 's' : ''} registrado${events.length !== 1 ? 's' : ''}`,
          headers: ['Nombre', 'Cliente', 'Tipo', 'Fecha', 'Personas', 'Costo', 'Precio venta', 'Margen', 'Estado'],
          rows: events.map((e) => [
            e.name, e.clientName, EVENT_TYPE_LABELS[e.eventType as keyof typeof EVENT_TYPE_LABELS] ?? e.eventType,
            e.date ? formatDate(e.date) : '—', String(e.people),
            formatCurrency(e.totalCost), e.sellingPrice > 0 ? formatCurrency(e.sellingPrice) : '—',
            e.margin !== 0 ? formatCurrency(e.margin) : '—', e.status,
          ]),
        }
      }
      case 'produccion': {
        const rows: string[][] = []
        for (const week of weeks) {
          const summary = buildWeekSummary(week)
          rows.push([week.weekLabel, 'RESUMEN', '', '', `${summary.daysWorked} días trabajados`, `${summary.completionRate}% completado`, formatCurrency(summary.totalSalaries), ''])
          for (const [item, data] of Object.entries(summary.productionByItem)) {
            rows.push([week.weekLabel, 'Producción', item, '', `${data.completed} ${data.unit} completados`, `${data.total} ${data.unit} planificados`, '', ''])
          }
          for (const [name, total] of Object.entries(summary.employeeTotals)) {
            rows.push([week.weekLabel, 'Personal', name, '', '', '', formatCurrency(total), ''])
          }
          rows.push(['', '', '', '', '', '', '', ''])
        }
        const totalSalaries = weeks.reduce((s, w) => s + buildWeekSummary(w).totalSalaries, 0)
        return {
          subtitle: `${weeks.length} semana${weeks.length !== 1 ? 's' : ''} · Total sueldos: ${formatCurrency(totalSalaries)}`,
          headers: ['Semana', 'Tipo', 'Detalle', 'Notas', 'Completado', 'Total', 'Importe', 'Extra'],
          rows,
        }
      }
      case 'inventario': {
        const filtered = movements.filter((m) => m.date >= dateFrom && m.date <= dateTo)
        const salidas = filtered.filter((m) => m.type === 'salida' || m.type === 'merma')
        return {
          subtitle: `${dateFrom} → ${dateTo} · ${filtered.length} movimientos · ${salidas.length} salidas/mermas`,
          headers: ['Insumo', 'Tipo', 'Cantidad', 'Unidad', 'Fecha', 'Notas'],
          rows: filtered.map((m) => [
            m.ingredientName, MOVEMENT_LABELS[m.type], String(m.quantity), m.unit, formatDate(m.date), m.notes || '—',
          ]),
        }
      }
      case 'ingredients': {
        return {
          subtitle: `${ingredients.length} insumo${ingredients.length !== 1 ? 's' : ''} registrado${ingredients.length !== 1 ? 's' : ''}`,
          headers: ['Nombre', 'Categoría', 'U. Compra', 'Costo Actual', 'Stock Mínimo', 'Proveedor', 'Historial precios'],
          rows: ingredients.map((i) => [
            i.name, i.category, i.purchaseUnit, formatCurrency(i.currentCost),
            `${i.minStock} ${i.purchaseUnit}`,
            suppliers.find((s) => s.id === i.defaultSupplierId)?.businessName ?? '—',
            `${i.priceHistory.length} registros`,
          ]),
        }
      }
      case 'suppliers': {
        return {
          subtitle: `${suppliers.length} proveedor${suppliers.length !== 1 ? 'es' : ''}`,
          headers: ['Razón Social', 'Nombre Comercial', 'CUIT', 'Teléfono', 'Email', 'N° Compras', 'Total Compras'],
          rows: suppliers.map((s) => {
            const sp = purchases.filter((p) => p.supplierId === s.id)
            return [
              s.businessName, s.tradeName, s.cuit, s.phone, s.email,
              String(sp.length), formatCurrency(sp.reduce((t, p) => t + p.total, 0)),
            ]
          }),
        }
      }
    }
  }

  async function handleExport(format: 'csv' | 'pdf') {
    setGenerating(true)
    try {
      const data = getReportData()
      if (format === 'csv') {
        csvDownload(`${currentReport.label}_${today()}.csv`, data.headers, data.rows)
      } else {
        await pdfDownload(currentReport.label, data.subtitle, data.headers, data.rows)
      }
    } finally {
      setGenerating(false)
    }
  }

  const preview = getReportData()
  const hasData = preview.rows.length > 0

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Reportes" description="Exportá datos en PDF o Excel de cualquier módulo" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Selector de reporte */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">Tipo de reporte</h3>
          {REPORTS.map((r) => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${reportType === r.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20' : 'bg-white dark:bg-[#1A1D2E] border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-indigo-200 dark:hover:border-indigo-500/30'}`}
            >
              <span className={`flex-shrink-0 ${reportType === r.id ? 'text-indigo-500' : 'text-gray-400'}`}>{r.icon}</span>
              <div className="min-w-0">
                <div className="font-medium text-xs truncate">{r.label}</div>
                <div className="text-[10px] text-gray-400 truncate leading-snug mt-0.5">{r.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Panel derecho */}
        <div className="lg:col-span-3 space-y-4">
          {/* Configuración */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">{currentReport.label}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{currentReport.description}</p>

            {currentReport.needsDateRange && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Input label="Desde" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <Input label="Hasta" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">{preview.rows.length} filas</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{preview.subtitle}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="secondary" size="sm" icon={<Table2 size={13} />} loading={generating} disabled={!hasData} onClick={() => handleExport('csv')}>
                  Excel (CSV)
                </Button>
                <Button size="sm" icon={<FileDown size={13} />} loading={generating} disabled={!hasData} onClick={() => handleExport('pdf')}>
                  PDF
                </Button>
              </div>
            </div>
          </Card>

          {/* Vista previa */}
          {hasData ? (
            <Card padding="none">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Vista previa — primeras {Math.min(preview.rows.length, 8)} filas de {preview.rows.length}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {preview.headers.map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                    {preview.rows.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[200px] truncate">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 8 && (
                  <div className="px-4 py-3 text-xs text-gray-400 text-center border-t border-gray-50 dark:border-gray-800/60">
                    ... y {preview.rows.length - 8} filas más — el reporte completo se exporta en el archivo
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-10 text-gray-400 dark:text-gray-600">
                <FileDown size={28} className="mx-auto mb-3" />
                <p className="text-sm font-medium">Sin datos para este reporte</p>
                <p className="text-xs mt-1">Ajustá el rango de fechas o cargá datos primero.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
