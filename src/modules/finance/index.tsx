import { useState } from 'react'
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button, Badge, Input, Select, Textarea, Modal, EmptyState, Tabs } from '@/shared/components/ui'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useFinanceStore } from './store'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate } from '@/shared/utils/date'
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, CATEGORY_LABELS,
  type FinanceEntry, type FinanceType, type FinanceCategory,
} from './types'

type FormData = { type: FinanceType; category: FinanceCategory; description: string; amount: number; date: string; notes: string }

function FinanceForm({ open, onClose, entry, defaultType }: { open: boolean; onClose: () => void; entry?: FinanceEntry | null; defaultType?: 'ingreso' | 'gasto' }) {
  const { addEntry, updateEntry } = useFinanceStore()
  const { register, watch, handleSubmit, reset } = useForm<FormData>({
    defaultValues: entry ?? {
      type: defaultType ?? 'ingreso',
      category: defaultType === 'gasto' ? 'insumos' : 'recibido_salon',
      description: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '',
    },
  })
  const watchedType = watch('type')
  const categories = watchedType === 'ingreso' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const categoryOptions = categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))

  function onSubmit(data: FormData) {
    if (entry) updateEntry(entry.id, { ...data, amount: Number(data.amount) })
    else addEntry({ ...data, amount: Number(data.amount) })
    onClose()
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? 'Editar Registro' : 'Nuevo Registro'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="finance-form">{entry ? 'Guardar' : 'Registrar'}</Button>
        </>
      }
    >
      <form id="finance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Tipo" options={[{ value: 'ingreso', label: 'Ingreso' }, { value: 'gasto', label: 'Gasto' }]} {...register('type')} />
          <Select label="Categoría" options={categoryOptions} {...register('category')} />
        </div>
        <Input label="Descripción" placeholder="Detalle del registro" {...register('description', { required: true })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Importe" type="number" step="0.01" min="0" {...register('amount', { valueAsNumber: true })} />
          <Input label="Fecha" type="date" {...register('date')} />
        </div>
        <Textarea label="Notas" rows={2} {...register('notes')} />
      </form>
    </Modal>
  )
}

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'ingreso', label: 'Ingresos' },
  { id: 'gasto', label: 'Gastos' },
]

export default function Finance() {
  const { entries, deleteEntry } = useFinanceStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FinanceEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthEntries = entries.filter((e) => e.date.startsWith(currentMonth))
  const monthIncome = monthEntries.filter((e) => e.type === 'ingreso').reduce((s, e) => s + e.amount, 0)
  const monthExpenses = monthEntries.filter((e) => e.type === 'gasto').reduce((s, e) => s + e.amount, 0)
  const monthProfit = monthIncome - monthExpenses

  const filtered = entries
    .filter((e) => activeTab === 'all' || e.type === activeTab)
    .filter((e) => !search || e.description.toLowerCase().includes(search.toLowerCase()) || CATEGORY_LABELS[e.category].toLowerCase().includes(search.toLowerCase()))

  const tabs = TABS.map((t) => ({
    ...t,
    count: t.id === 'all' ? entries.length : entries.filter((e) => e.type === t.id).length,
  }))

  const [quickType, setQuickType] = useState<'ingreso' | 'gasto' | null>(null)

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Finanzas"
        description="Registrá lo que recibís del salón y lo que gastás en la cocina"
        actions={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nuevo registro</Button>}
      />

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => { setQuickType('ingreso'); setFormOpen(true) }}
          className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/60 transition-all text-left group"
        >
          <div className="p-3 rounded-xl bg-emerald-500 text-white flex-shrink-0 group-hover:scale-105 transition-transform">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Registrar ingreso del salón</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Plata recibida, adelantos, transferencias</div>
          </div>
        </button>

        <button
          onClick={() => { setQuickType('gasto'); setFormOpen(true) }}
          className="flex items-center gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/60 transition-all text-left group"
        >
          <div className="p-3 rounded-xl bg-red-500 text-white flex-shrink-0 group-hover:scale-105 transition-transform">
            <TrendingDown size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-red-700 dark:text-red-400">Registrar gasto de cocina</div>
            <div className="text-xs text-red-600 dark:text-red-500 mt-0.5">Insumos, sueldos, servicios, alquiler</div>
          </div>
        </button>
      </div>

      {/* Monthly KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Recibido del Salón', value: monthIncome, icon: <TrendingUp size={16} />, bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
          { label: 'Gasto Operativo', value: monthExpenses, icon: <TrendingDown size={16} />, bg: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
          { label: 'Resultado del Mes', value: monthProfit, icon: <DollarSign size={16} />, bg: monthProfit >= 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white dark:bg-[#1A1D2E] border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>{kpi.icon}</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(kpi.value)}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <Input placeholder="Buscar registros..." icon={<Search size={13} />} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<DollarSign size={26} />}
            title="Sin registros este mes"
            description="Usá los botones de arriba para registrar lo que recibiste del salón o los gastos de cocina."
            action={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Primer registro</Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <th className="pl-5 py-3 text-left">Descripción</th>
                    <th className="px-3 py-3 text-left">Categoría</th>
                    <th className="px-3 py-3 text-left">Fecha</th>
                    <th className="px-3 py-3 text-right">Importe</th>
                    <th className="pr-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                      <td className="pl-5 py-3.5">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{e.description}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={e.type === 'ingreso' ? 'success' : 'danger'}>{CATEGORY_LABELS[e.category]}</Badge>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-gray-500 dark:text-gray-400">{formatDate(e.date)}</td>
                      <td className="px-3 py-3.5 text-right">
                        <span className={`text-xs font-semibold tabular-nums ${e.type === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {e.type === 'ingreso' ? '+' : '-'}{formatCurrency(e.amount)}
                        </span>
                      </td>
                      <td className="pr-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditing(e); setFormOpen(true) }} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"><Pencil size={13} /></button>
                          <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800/60">
              {filtered.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-4 gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{e.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{CATEGORY_LABELS[e.category]} · {formatDate(e.date)}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold tabular-nums ${e.type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {e.type === 'ingreso' ? '+' : '-'}{formatCurrency(e.amount)}
                    </span>
                    <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
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
            <h3 className="text-sm font-semibold mb-2">Eliminar registro</h3>
            <p className="text-xs text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={() => { deleteEntry(deleteId); setDeleteId(null) }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <FinanceForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); setQuickType(null) }} entry={editing} defaultType={quickType ?? undefined} />
    </div>
  )
}
