import { useState } from 'react'
import { Plus, Warehouse, AlertTriangle, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button, Badge, Select, Input, Textarea, Modal, EmptyState, Tabs } from '@/shared/components/ui'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useInventoryStore } from './store'
import { useIngredientsStore } from '@/modules/ingredients/store'
import { formatDate } from '@/shared/utils/date'
import { cn } from '@/shared/utils/cn'
import { MOVEMENT_LABELS, type MovementType } from './types'

const MOVEMENT_TYPE_OPTIONS = Object.entries(MOVEMENT_LABELS).map(([v, l]) => ({ value: v, label: l }))

const MOVEMENT_COLORS: Record<MovementType, string> = {
  entrada: 'text-emerald-500',
  salida: 'text-red-500',
  merma: 'text-amber-500',
  ajuste: 'text-blue-500',
}

const MOVEMENT_ICONS: Record<MovementType, React.ReactNode> = {
  entrada: <ArrowUp size={14} />,
  salida: <ArrowDown size={14} />,
  merma: <AlertTriangle size={14} />,
  ajuste: <RotateCcw size={14} />,
}

interface FormData {
  ingredientId: string
  type: MovementType
  quantity: number
  date: string
  notes: string
}

function MovementForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addMovement } = useInventoryStore()
  const { ingredients } = useIngredientsStore()

  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: { type: 'entrada', quantity: 0, date: new Date().toISOString().split('T')[0], notes: '' },
  })

  const selectedIngredientId = watch('ingredientId')
  const selectedIngredient = ingredients.find((i) => i.id === selectedIngredientId)

  function onSubmit(data: FormData) {
    const ingredient = ingredients.find((i) => i.id === data.ingredientId)
    if (!ingredient) return
    addMovement({
      ingredientId: data.ingredientId,
      ingredientName: ingredient.name,
      type: data.type,
      quantity: Number(data.quantity),
      unit: ingredient.purchaseUnit,
      date: data.date,
      notes: data.notes,
    })
    onClose()
    reset()
  }

  const ingredientOptions = [
    { value: '', label: 'Seleccionar insumo...' },
    ...ingredients.map((i) => ({ value: i.id, label: `${i.name} (${i.purchaseUnit})` })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar Movimiento"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="movement-form">Registrar</Button>
        </>
      }
    >
      <form id="movement-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Insumo" options={ingredientOptions} {...register('ingredientId', { required: true })} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Tipo" options={MOVEMENT_TYPE_OPTIONS} {...register('type')} />
          <Input
            label={`Cantidad${selectedIngredient ? ` (${selectedIngredient.purchaseUnit})` : ''}`}
            type="number"
            step="0.01"
            min="0"
            {...register('quantity', { valueAsNumber: true })}
          />
        </div>
        <Input label="Fecha" type="date" {...register('date')} />
        <Textarea label="Notas" placeholder="Motivo del movimiento..." rows={2} {...register('notes')} />
      </form>
    </Modal>
  )
}

const TABS = [
  { id: 'stock', label: 'Stock Actual' },
  { id: 'movements', label: 'Movimientos' },
]

export default function Inventory() {
  const { stockLevels, movements, getLowStockItems } = useInventoryStore()
  const { ingredients } = useIngredientsStore()
  const [formOpen, setFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('stock')

  const lowStock = getLowStockItems()
  const tabs = TABS.map((t) => ({
    ...t,
    count: t.id === 'stock' ? stockLevels.length : movements.length,
  }))

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Inventario"
        description={`${stockLevels.length} insumo${stockLevels.length !== 1 ? 's' : ''} en stock${lowStock.length > 0 ? ` · ${lowStock.length} con stock bajo` : ''}`}
        actions={
          <Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>
            Nuevo movimiento
          </Button>
        }
      />

      {/* Alerts */}
      {lowStock.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lowStock.map((item) => (
            <div key={item.ingredientId} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 truncate">{item.ingredientName}</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400">
                  Stock: {item.currentStock} {item.unit} · Mínimo: {item.minStock} {item.unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card padding="none">
        <div className="px-5 pt-4 border-b border-gray-100 dark:border-gray-800">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'stock' ? (
          stockLevels.length === 0 ? (
            <EmptyState
              icon={<Warehouse size={26} />}
              title="Sin stock registrado"
              description="Registrá movimientos de entrada para inicializar el stock de cada insumo."
              action={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nuevo movimiento</Button>}
            />
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {stockLevels.map((item) => {
                const isLow = item.minStock > 0 && item.currentStock <= item.minStock
                const pct = item.minStock > 0 ? Math.min((item.currentStock / (item.minStock * 2)) * 100, 100) : 100
                return (
                  <div key={item.ingredientId} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.ingredientName}</span>
                        {isLow && <Badge variant="warning">Stock bajo</Badge>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full w-24">
                          <div
                            className={cn('h-full rounded-full', isLow ? 'bg-amber-500' : 'bg-emerald-500')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                          {item.currentStock} {item.unit}
                          {item.minStock > 0 && ` · mín. ${item.minStock}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">{formatDate(item.lastUpdated)}</span>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          movements.length === 0 ? (
            <EmptyState
              icon={<RotateCcw size={26} />}
              title="Sin movimientos"
              description="Los movimientos de entrada, salida y merma aparecerán aquí."
            />
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {movements.map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3">
                  <div className={cn('flex-shrink-0', MOVEMENT_COLORS[m.type])}>
                    {MOVEMENT_ICONS[m.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{m.ingredientName}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      {MOVEMENT_LABELS[m.type]} · {formatDate(m.date)}
                      {m.notes && ` · ${m.notes}`}
                    </div>
                  </div>
                  <span className={cn('text-sm font-semibold tabular-nums', MOVEMENT_COLORS[m.type])}>
                    {m.type === 'entrada' ? '+' : m.type === 'ajuste' ? '' : '-'}{m.quantity} {m.unit}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <MovementForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
