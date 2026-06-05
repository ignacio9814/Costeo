import { useState } from 'react'
import { Plus, Pencil, Trash2, ShoppingCart, Search, Camera } from 'lucide-react'
import { Button, Badge, Input, Tabs, EmptyState } from '@/shared/components/ui'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { usePurchasesStore } from './store'
import { PurchaseForm } from './components/PurchaseForm'
import { OCRUploader, type ParsedDocument } from './components/OCRUploader'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate } from '@/shared/utils/date'
import type { Purchase } from './types'

const DOC_LABELS: Record<string, string> = {
  factura_a: 'Factura A', factura_b: 'Factura B',
  ticket: 'Ticket', remito: 'Remito', recibo: 'Recibo',
}

type StatusVariant = 'success' | 'warning' | 'default' | 'indigo'
const STATUS_CONFIG: Record<string, { label: string; variant: StatusVariant }> = {
  confirmed: { label: 'Confirmado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  draft: { label: 'Borrador', variant: 'default' },
  reconciled: { label: 'Conciliado', variant: 'indigo' },
}

const TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'draft', label: 'Borradores' },
]

export default function Purchases() {
  const { purchases, deletePurchase } = usePurchasesStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Purchase | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [ocrOpen, setOcrOpen] = useState(false)
  const [ocrData, setOcrData] = useState<Partial<ParsedDocument> | null>(null)

  const filtered = purchases
    .filter((p) => activeTab === 'all' || p.status === activeTab)
    .filter((p) => !search || p.supplierName.toLowerCase().includes(search.toLowerCase()) || p.number.includes(search))

  const tabs = TABS.map((t) => ({
    ...t,
    count: t.id === 'all' ? purchases.length : purchases.filter((p) => p.status === t.id).length,
  }))

  const totalMonth = purchases
    .filter((p) => p.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, p) => s + p.total, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Compras"
        description={`${purchases.length} registro${purchases.length !== 1 ? 's' : ''} · ${formatCurrency(totalMonth)} este mes`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" icon={<Camera size={13} />} onClick={() => setOcrOpen(true)}>
              Escanear
            </Button>
            <Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>
              Nueva compra
            </Button>
          </div>
        }
      />

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <Input placeholder="Buscar por proveedor o número..." icon={<Search size={13} />} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={28} />}
            title={search ? 'Sin resultados' : 'Sin compras registradas'}
            description="Registrá tu primera compra con el botón Nueva Compra."
            action={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nueva compra</Button>}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <th className="pl-5 py-3 text-left">Proveedor</th>
                    <th className="px-3 py-3 text-left">Tipo</th>
                    <th className="px-3 py-3 text-left">N°</th>
                    <th className="px-3 py-3 text-left">Fecha</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="px-3 py-3 text-center">Estado</th>
                    <th className="pr-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {filtered.map((p) => {
                    const st = STATUS_CONFIG[p.status] ?? { label: p.status, variant: 'default' as StatusVariant }
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="pl-5 py-3.5 text-xs font-medium text-gray-900 dark:text-gray-100">{p.supplierName || '—'}</td>
                        <td className="px-3 py-3.5 text-xs text-gray-500 dark:text-gray-400">{DOC_LABELS[p.type] ?? p.type}</td>
                        <td className="px-3 py-3.5 text-xs text-gray-500 dark:text-gray-400 font-mono">{p.number || '—'}</td>
                        <td className="px-3 py-3.5 text-xs text-gray-500 dark:text-gray-400">{formatDate(p.date)}</td>
                        <td className="px-3 py-3.5 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(p.total)}</td>
                        <td className="px-3 py-3.5 text-center"><Badge variant={st.variant}>{st.label}</Badge></td>
                        <td className="pr-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditing(p); setFormOpen(true) }} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"><Pencil size={13} /></button>
                            <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800/60">
              {filtered.map((p) => {
                const st = STATUS_CONFIG[p.status] ?? { label: p.status, variant: 'default' as StatusVariant }
                return (
                  <div key={p.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{p.supplierName || '—'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{DOC_LABELS[p.type]} · {formatDate(p.date)}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(p.total)}</span>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setEditing(p); setFormOpen(true) }} className="p-2 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-2 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white dark:bg-[#1A1D2E] rounded-xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-sm font-semibold mb-2">Eliminar compra</h3>
            <p className="text-xs text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={() => { deletePurchase(deleteId); setDeleteId(null) }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <OCRUploader
        open={ocrOpen}
        onClose={() => setOcrOpen(false)}
        onConfirm={(data) => { setOcrData(data); setOcrOpen(false); setFormOpen(true) }}
      />
      <PurchaseForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); setOcrData(null) }}
        purchase={editing}
        prefilledData={ocrData ?? undefined}
      />
    </div>
  )
}
