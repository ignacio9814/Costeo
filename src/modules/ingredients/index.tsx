import { useState } from 'react'
import { Plus, Pencil, Trash2, Package, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Button, Badge, Input, Select, Textarea, Modal, EmptyState } from '@/shared/components/ui'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useIngredientsStore } from './store'
import { useSuppliersStore } from '@/modules/suppliers/store'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate } from '@/shared/utils/date'
import { INGREDIENT_CATEGORIES, COMMON_UNITS, type Ingredient, type IngredientCategory } from './types'

type FormData = {
  name: string
  category: IngredientCategory
  purchaseUnit: string
  useUnit: string
  conversionFactor: number
  currentCost: number
  minStock: number
  defaultSupplierId: string
  notes: string
}

function IngredientForm({ open, onClose, ingredient }: { open: boolean; onClose: () => void; ingredient?: Ingredient | null }) {
  const { addIngredient, updateIngredient } = useIngredientsStore()
  const { suppliers } = useSuppliersStore()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: ingredient
      ? { name: ingredient.name, category: ingredient.category, purchaseUnit: ingredient.purchaseUnit, useUnit: ingredient.useUnit, conversionFactor: ingredient.conversionFactor, currentCost: ingredient.currentCost, minStock: ingredient.minStock, defaultSupplierId: ingredient.defaultSupplierId ?? '', notes: ingredient.notes }
      : { category: 'otros', purchaseUnit: 'kg', useUnit: 'kg', conversionFactor: 1, currentCost: 0, minStock: 0, defaultSupplierId: '', notes: '' },
  })

  function onSubmit(data: FormData) {
    if (ingredient) {
      updateIngredient(ingredient.id, { ...data, conversionFactor: Number(data.conversionFactor), currentCost: Number(data.currentCost), minStock: Number(data.minStock) })
    } else {
      addIngredient({ ...data, conversionFactor: Number(data.conversionFactor), currentCost: Number(data.currentCost), minStock: Number(data.minStock) })
    }
    onClose()
    reset()
  }

  const categoryOptions = Object.entries(INGREDIENT_CATEGORIES).map(([v, l]) => ({ value: v, label: l }))
  const unitOptions = COMMON_UNITS.map((u) => ({ value: u, label: u }))
  const supplierOptions = [
    { value: '', label: 'Sin proveedor habitual' },
    ...suppliers.map((s) => ({ value: s.id, label: s.businessName || s.tradeName })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ingredient ? 'Editar Insumo' : 'Nuevo Insumo'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="ingredient-form">{ingredient ? 'Guardar' : 'Crear insumo'}</Button>
        </>
      }
    >
      <form id="ingredient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Nombre" placeholder="Harina 000" {...register('name', { required: 'Requerido' })} error={errors.name?.message} />
          </div>
          <Select label="Categoría" options={categoryOptions} {...register('category')} />
          <Select label="Proveedor habitual" options={supplierOptions} {...register('defaultSupplierId')} />
          <Select label="Unidad de compra" options={unitOptions} {...register('purchaseUnit')} />
          <Select label="Unidad de uso" options={unitOptions} {...register('useUnit')} />
          <Input label="Factor de conversión" type="number" step="0.001" hint="Unidades de uso por unidad de compra" {...register('conversionFactor', { valueAsNumber: true })} />
          <Input label="Costo actual (por u. de compra)" type="number" step="0.01" placeholder="0" {...register('currentCost', { valueAsNumber: true })} />
          <Input label="Stock mínimo" type="number" step="0.01" placeholder="0" {...register('minStock', { valueAsNumber: true })} />
        </div>
        <Textarea label="Notas" placeholder="Observaciones..." rows={2} {...register('notes')} />
      </form>
    </Modal>
  )
}

export default function Ingredients() {
  const { ingredients, deleteIngredient } = useIngredientsStore()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [selected, setSelected] = useState<Ingredient | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = ingredients.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase()) || INGREDIENT_CATEGORIES[i.category].toLowerCase().includes(search.toLowerCase())
  )

  function handleClose() { setFormOpen(false); setEditing(null) }

  const priceChartData = selected?.priceHistory.map((p) => ({
    date: formatDate(p.date),
    precio: p.price,
  })) ?? []

  const lastPrice = selected?.priceHistory.at(-1)?.price ?? 0
  const prevPrice = selected?.priceHistory.at(-2)?.price ?? lastPrice
  const priceChange = prevPrice > 0 ? ((lastPrice - prevPrice) / prevPrice) * 100 : 0

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Insumos"
        description={`${ingredients.length} insumo${ingredients.length !== 1 ? 's' : ''} registrado${ingredients.length !== 1 ? 's' : ''}`}
        actions={
          <Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>
            Nuevo insumo
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <Input placeholder="Buscar insumos..." icon={<Search size={13} />} value={search} onChange={(e) => setSearch(e.target.value)} />

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Package size={26} />}
                title={search ? 'Sin resultados' : 'Sin insumos'}
                description="Registrá tus materias primas para costear recetas y controlar el inventario."
                action={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nuevo insumo</Button>}
              />
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((ing) => {
                const ph = ing.priceHistory
                const last = ph.at(-1)?.price ?? ing.currentCost
                const prev = ph.at(-2)?.price ?? last
                const chg = prev > 0 ? ((last - prev) / prev) * 100 : 0
                const isUp = chg > 0
                return (
                  <Card
                    key={ing.id}
                    padding="none"
                    className={`cursor-pointer transition-all ${selected?.id === ing.id ? 'ring-2 ring-indigo-500' : 'hover:border-gray-200 dark:hover:border-gray-700'}`}
                    onClick={() => setSelected(selected?.id === ing.id ? null : ing)}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{ing.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{INGREDIENT_CATEGORIES[ing.category]}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatCurrency(ing.currentCost)}/{ing.purchaseUnit}</span>
                          {ph.length > 1 && (
                            <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isUp ? 'text-red-500' : 'text-emerald-500'}`}>
                              {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                              {Math.abs(chg).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); setEditing(ing); setFormOpen(true) }} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"><Pencil size={13} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteId(ing.id) }} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail + price chart */}
        <div>
          {selected ? (
            <Card>
              <CardHeader
                title={selected.name}
                description={INGREDIENT_CATEGORIES[selected.category]}
              />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Costo actual', formatCurrency(selected.currentCost) + '/' + selected.purchaseUnit],
                    ['Stock mínimo', selected.minStock + ' ' + selected.purchaseUnit],
                    ['U. de compra', selected.purchaseUnit],
                    ['U. de uso', selected.useUnit],
                  ].map(([label, value]) => (
                    <div key={label} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>

                {priceChartData.length > 1 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Evolución de precio</span>
                      <span className={`text-xs font-medium flex items-center gap-1 ${priceChange > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {priceChange > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {Math.abs(priceChange).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={priceChartData} margin={{ top: 4, right: 2, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ fontSize: 11 }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                          <Area type="monotone" dataKey="precio" stroke="#f59e0b" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {selected.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">{selected.notes}</p>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <Package size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500">Seleccioná un insumo para ver el historial de precios</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white dark:bg-[#1A1D2E] rounded-xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Eliminar insumo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={() => { deleteIngredient(deleteId); setDeleteId(null); if (selected?.id === deleteId) setSelected(null) }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <IngredientForm open={formOpen} onClose={handleClose} ingredient={editing} />
    </div>
  )
}
