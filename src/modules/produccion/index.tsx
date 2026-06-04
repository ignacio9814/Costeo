import { useState } from 'react'
import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Sun, Sunset, CheckSquare, Square, Printer, CalendarCheck, Users, X, FileText, TrendingUp, ClipboardList } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button, Input, Select, Modal } from '@/shared/components/ui'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useProduccionStore } from './store'
import { useRecipesStore } from '@/modules/recipes/store'
import { getMondayOf, toDateStr, buildWeekSummary, SHIFT_LABELS, SHIFT_TIMES, COMMON_PRODUCTION_UNITS, type ShiftType, type ProductionDay, type ProductionWeek } from './types'
import { formatCurrency } from '@/shared/utils/currency'
import { cn } from '@/shared/utils/cn'

// ─── Add Item Modal ─────────────────────────────────────────────────────────
function AddItemModal({ open, onClose, onAdd }: {
  open: boolean
  onClose: () => void
  onAdd: (item: { name: string; quantity: number; unit: string; notes: string; recipeId?: string }) => void
}) {
  const { recipes } = useRecipesStore()
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: { recipeId: '', name: '', quantity: 1, unit: 'unidad', notes: '' },
  })

  function onSubmit(data: { recipeId: string; name: string; quantity: number; unit: string; notes: string }) {
    const recipe = recipes.find((r) => r.id === data.recipeId)
    onAdd({ name: data.name || recipe?.name || '', quantity: Number(data.quantity), unit: data.unit, notes: data.notes, recipeId: data.recipeId || undefined })
    reset()
    onClose()
  }

  const recipeOptions = [{ value: '', label: 'Sin receta (manual)' }, ...recipes.map((r) => ({ value: r.id, label: r.name }))]
  const unitOptions = COMMON_PRODUCTION_UNITS.map((u) => ({ value: u, label: u }))

  return (
    <Modal open={open} onClose={onClose} title="Agregar producción" size="sm"
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="add-item">Agregar</Button></>}
    >
      <form id="add-item" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Receta (opcional)" options={recipeOptions} {...register('recipeId')}
          onChange={(e) => { const r = recipes.find((x) => x.id === e.target.value); if (r) setValue('name', r.name); setValue('recipeId', e.target.value) }}
        />
        <Input label="Descripción" placeholder="Ej: Medialunas de manteca" {...register('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Cantidad" type="number" step="1" min="0" {...register('quantity', { valueAsNumber: true })} />
          <Select label="Unidad" options={unitOptions} {...register('unit')} />
        </div>
        <Input label="Notas (opcional)" placeholder="Observaciones..." {...register('notes')} />
      </form>
    </Modal>
  )
}

// ─── Add Employee Modal ──────────────────────────────────────────────────────
function AddEmployeeModal({ open, onClose, onAdd }: {
  open: boolean
  onClose: () => void
  onAdd: (emp: { name: string; amountPaid: number }) => void
}) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', amountPaid: 0 } })

  function onSubmit(data: { name: string; amountPaid: number }) {
    onAdd({ name: data.name, amountPaid: Number(data.amountPaid) })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar empleado al turno" size="sm"
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="add-emp">Agregar</Button></>}
    >
      <form id="add-emp" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nombre del empleado" placeholder="María García" {...register('name', { required: true })} />
        <Input label="Monto cobrado por este turno" type="number" step="100" min="0" placeholder="0" {...register('amountPaid', { valueAsNumber: true })} />
      </form>
    </Modal>
  )
}

// ─── Weekly Report Modal ─────────────────────────────────────────────────────
function WeeklyReportModal({ open, onClose, week }: { open: boolean; onClose: () => void; week: ProductionWeek }) {
  const summary = buildWeekSummary(week)

  function handlePrint() {
    window.print()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Informe — ${week.weekLabel}`} size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button icon={<Printer size={14} />} onClick={handlePrint}>Imprimir</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Resumen de producción */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <ClipboardList size={15} className="text-indigo-500" />
            Producción de la semana
          </h3>
          {Object.keys(summary.productionByItem).length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-600">Sin producción registrada.</p>
          ) : (
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/60 text-[11px] text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-2.5 text-left">Producto</th>
                    <th className="px-4 py-2.5 text-right">Completado</th>
                    <th className="px-4 py-2.5 text-right">Total planificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {Object.entries(summary.productionByItem).map(([key, data]) => (
                    <tr key={key}>
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100 capitalize">{key}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                        {data.completed} {data.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                        {data.total} {data.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Días trabajados: {summary.daysWorked}
                </span>
                <span className={cn('text-xs font-bold', summary.completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                  Completado: {summary.completionRate}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sueldos */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Users size={15} className="text-violet-500" />
            Personal de la semana
          </h3>
          {Object.keys(summary.employeeTotals).length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-600">Sin empleados registrados.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(summary.employeeTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([name, total]) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
                    </div>
                    <span className="text-sm font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Total sueldos</span>
                <span className="text-sm font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                  {formatCurrency(summary.totalSalaries)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Detalle por día */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <CalendarCheck size={15} className="text-cyan-500" />
            Detalle por día
          </h3>
          <div className="space-y-3">
            {week.days.map((day) => {
              const totalItems = day.manana.items.length + day.tarde.items.length
              if (totalItems === 0 && day.manana.employees.length === 0 && day.tarde.employees.length === 0) return null
              return (
                <div key={day.date} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/60 font-semibold text-xs text-gray-700 dark:text-gray-300">
                    {day.dayLabel}
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800/40">
                    {[day.manana, day.tarde].map((shift, si) => {
                      if (shift.items.length === 0 && shift.employees.length === 0) return null
                      const shiftKey: ShiftType = si === 0 ? 'manana' : 'tarde'
                      return (
                        <div key={shiftKey} className="px-4 py-2.5">
                          <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            {SHIFT_LABELS[shiftKey]}
                          </div>
                          {shift.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-xs mb-1">
                              <span className={item.completed ? 'text-emerald-500' : 'text-gray-400'}>
                                {item.completed ? '✓' : '○'}
                              </span>
                              <span className={cn('text-gray-900 dark:text-gray-100', !item.completed && 'opacity-60')}>
                                {item.name} × {item.quantity} {item.unit}
                              </span>
                            </div>
                          ))}
                          {shift.employees.map((emp) => (
                            <div key={emp.id} className="flex items-center justify-between text-xs mt-1">
                              <span className="text-violet-600 dark:text-violet-400">👤 {emp.name}</span>
                              <span className="font-semibold text-violet-600 dark:text-violet-400 tabular-nums">{formatCurrency(emp.amountPaid)}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Shift Panel ─────────────────────────────────────────────────────────────
function ShiftPanel({ week, day, shift }: { week: ProductionWeek; day: ProductionDay; shift: ShiftType }) {
  const { addItem, toggleItem, removeItem, addEmployee, removeEmployee } = useProduccionStore()
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [addEmpOpen, setAddEmpOpen] = useState(false)
  const shiftData = day[shift]

  const completed = shiftData.items.filter((i) => i.completed).length
  const total = shiftData.items.length
  const totalSalaries = shiftData.employees.reduce((s, e) => s + e.amountPaid, 0)

  const isMorning = shift === 'manana'

  return (
    <div className="flex-1 min-w-0">
      {/* Header del turno */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-t-xl border border-b-0',
        isMorning
          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'
          : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20'
      )}>
        {isMorning ? <Sun size={13} className="text-amber-500" /> : <Sunset size={13} className="text-indigo-500" />}
        <span className={cn('text-xs font-bold flex-1', isMorning ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-400')}>
          {SHIFT_LABELS[shift]}
        </span>
        <span className="text-[9px] text-gray-400">{SHIFT_TIMES[shift]}</span>
        {total > 0 && (
          <span className={cn('text-[10px] font-bold tabular-nums ml-1', completed === total ? 'text-emerald-500' : 'text-gray-400')}>
            {completed}/{total}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={cn(
        'border border-t-0 rounded-b-xl p-3 bg-white dark:bg-[#1A1D2E] min-h-20 space-y-3',
        isMorning ? 'border-amber-100 dark:border-amber-500/20' : 'border-indigo-100 dark:border-indigo-500/20'
      )}>
        {/* Producción */}
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Producción</div>
          <div className="space-y-1">
            {shiftData.items.map((item) => (
              <div key={item.id} className={cn('flex items-center gap-2 group p-1.5 rounded-lg', item.completed ? 'bg-emerald-50 dark:bg-emerald-500/5' : '')}>
                <button onClick={() => void toggleItem(week.id, day.date, shift, item.id)} className="flex-shrink-0 text-gray-400 hover:text-indigo-500 transition-colors">
                  {item.completed ? <CheckSquare size={14} className="text-emerald-500" /> : <Square size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={cn('text-xs', item.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium')}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">× {item.quantity} {item.unit}</span>
                </div>
                <button onClick={() => void removeItem(week.id, day.date, shift, item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setAddItemOpen(true)}
            className="mt-1.5 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors border border-dashed border-gray-200 dark:border-gray-700"
          >
            <Plus size={10} /> Agregar producción
          </button>
        </div>

        {/* Empleados */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Personal</div>
            {totalSalaries > 0 && (
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 tabular-nums">{formatCurrency(totalSalaries)}</span>
            )}
          </div>
          <div className="space-y-1">
            {shiftData.employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-2 group">
                <div className="w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-[9px] text-violet-600 dark:text-violet-400 font-bold flex-shrink-0">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{emp.name}</span>
                <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 tabular-nums">{formatCurrency(emp.amountPaid)}</span>
                <button onClick={() => void removeEmployee(week.id, day.date, shift, emp.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setAddEmpOpen(true)}
            className="mt-1.5 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors border border-dashed border-gray-200 dark:border-gray-700"
          >
            <Users size={10} /> <Plus size={9} /> Empleado
          </button>
        </div>
      </div>

      <AddItemModal open={addItemOpen} onClose={() => setAddItemOpen(false)} onAdd={(item) => void addItem(week.id, day.date, shift, item)} />
      <AddEmployeeModal open={addEmpOpen} onClose={() => setAddEmpOpen(false)} onAdd={(emp) => void addEmployee(week.id, day.date, shift, emp)} />
    </div>
  )
}

// ─── Day Card ────────────────────────────────────────────────────────────────
function DayCard({ week, day }: { week: ProductionWeek; day: ProductionDay }) {
  const totalItems = day.manana.items.length + day.tarde.items.length
  const completedItems = day.manana.items.filter((i) => i.completed).length + day.tarde.items.filter((i) => i.completed).length
  const totalSalaries = [...day.manana.employees, ...day.tarde.employees].reduce((s, e) => s + e.amountPaid, 0)

  return (
    <Card padding="none">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{day.dayLabel}</span>
        <div className="flex items-center gap-3">
          {totalSalaries > 0 && (
            <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 tabular-nums flex items-center gap-1">
              <Users size={9} /> {formatCurrency(totalSalaries)}
            </span>
          )}
          {totalItems > 0 && (
            <span className={cn('text-[10px] font-semibold tabular-nums', completedItems === totalItems ? 'text-emerald-500' : 'text-gray-500')}>
              {completedItems}/{totalItems}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 p-2.5">
        <ShiftPanel week={week} day={day} shift="manana" />
        <ShiftPanel week={week} day={day} shift="tarde" />
      </div>
    </Card>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Produccion() {
  const { weeks, getOrCreateWeek, deleteWeek, load } = useProduccionStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => { void load() }, [])

  const monday = getMondayOf(currentDate)
  const weekStart = toDateStr(monday)
  const currentWeek = weeks.find((w) => w.weekStart === weekStart)

  const weekLabel = (() => {
    const end = new Date(monday); end.setDate(end.getDate() + 6)
    const fmt = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
    return `${fmt(monday)} – ${fmt(end)}`
  })()

  const isThisWeek = toDateStr(getMondayOf(new Date())) === weekStart

  const summary = currentWeek ? buildWeekSummary(currentWeek) : null

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Producción de Semana"
        description="Registro de turnos, producción y personal"
        actions={
          currentWeek && (
            <Button icon={<FileText size={14} />} onClick={() => setReportOpen(true)}>
              Ver informe
            </Button>
          )
        }
      />

      {/* Week navigator */}
      <div className="flex items-center justify-between bg-white dark:bg-[#1A1D2E] rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3">
        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Semana del {weekLabel}</div>
          <div className="flex items-center justify-center gap-3 mt-0.5">
            {isThisWeek && <span className="text-[10px] text-indigo-500 font-medium">Semana actual</span>}
            {!isThisWeek && <button onClick={() => setCurrentDate(new Date())} className="text-[10px] text-indigo-500 hover:text-indigo-700 underline">Ir a esta semana</button>}
            {summary && summary.totalSalaries > 0 && (
              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1">
                <Users size={9} /> Sueldos: {formatCurrency(summary.totalSalaries)}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {!currentWeek ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 mb-4">
              <CalendarCheck size={28} className="text-cyan-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Sin planificación para esta semana
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-xs">
              Creá la planificación para registrar la producción y el personal de cada turno.
            </p>
            <Button icon={<Plus size={14} />} onClick={() => getOrCreateWeek(currentDate)}>
              Crear semana
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Summary bar */}
          {summary && (Object.keys(summary.productionByItem).length > 0 || summary.totalSalaries > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Ítems planificados', value: Object.values(summary.productionByItem).reduce((s, v) => s + v.total, 0).toString(), icon: <ClipboardList size={14} />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                { label: 'Completados', value: `${summary.completionRate}%`, icon: <CheckSquare size={14} />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                { label: 'Empleados', value: Object.keys(summary.employeeTotals).length.toString(), icon: <Users size={14} />, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
                { label: 'Total sueldos', value: formatCurrency(summary.totalSalaries), icon: <TrendingUp size={14} />, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-[#1A1D2E] rounded-xl border border-gray-100 dark:border-gray-800 p-3.5">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mb-2', stat.bg, stat.color)}>
                    {stat.icon}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                  <div className={cn('text-lg font-bold tabular-nums', stat.color)}>{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Days */}
          <div className="space-y-4">
            {currentWeek.days.map((day) => (
              <DayCard key={day.date} week={currentWeek} day={day} />
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => { if (confirm('¿Eliminar toda la planificación de esta semana?')) void deleteWeek(currentWeek.id) }}
              className="text-xs text-red-500 hover:text-red-700 hover:underline"
            >
              Eliminar planificación de esta semana
            </button>
          </div>

          {reportOpen && (
            <WeeklyReportModal open={reportOpen} onClose={() => setReportOpen(false)} week={currentWeek} />
          )}
        </>
      )}
    </div>
  )
}
