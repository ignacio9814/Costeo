import { useState } from 'react'
import { Plus, Pencil, Trash2, ChefHat, Search, X } from 'lucide-react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { Button, Badge, Input, Select, Textarea, Modal, EmptyState } from '@/shared/components/ui'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useRecipesStore } from './store'
import { useIngredientsStore } from '@/modules/ingredients/store'
import { formatCurrency } from '@/shared/utils/currency'
import { generateId } from '@/shared/utils/id'
import { RECIPE_CATEGORIES, type Recipe, type RecipeIngredient } from './types'

interface FormIngredient {
  ingredientId: string
  quantity: number
}
interface FormData {
  name: string
  category: string
  portions: number
  ingredients: FormIngredient[]
  sellingPrice: number
  notes: string
}

const FOOD_COST_TARGET = 30 // %

function RecipeForm({ open, onClose, recipe }: { open: boolean; onClose: () => void; recipe?: Recipe | null }) {
  const { addRecipe, updateRecipe } = useRecipesStore()
  const { ingredients } = useIngredientsStore()

  const { register, control, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: recipe
      ? { name: recipe.name, category: recipe.category, portions: recipe.portions, ingredients: recipe.ingredients.map((i) => ({ ingredientId: i.ingredientId, quantity: i.quantity })), sellingPrice: recipe.sellingPrice, notes: recipe.notes }
      : { category: 'Principal', portions: 1, ingredients: [{ ingredientId: '', quantity: 1 }], sellingPrice: 0, notes: '' },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })
  const watchedIng = useWatch({ control, name: 'ingredients' }) ?? []
  const watchedPortions = useWatch({ control, name: 'portions' }) ?? 1
  const watchedSellingPrice = useWatch({ control, name: 'sellingPrice' }) ?? 0

  const ingredientOptions = [
    { value: '', label: 'Seleccionar insumo...' },
    ...ingredients.map((i) => ({ value: i.id, label: `${i.name} (${i.purchaseUnit})` })),
  ]
  const categoryOptions = RECIPE_CATEGORIES.map((c) => ({ value: c, label: c }))

  const totalCost = watchedIng.reduce((sum, fi) => {
    const ing = ingredients.find((i) => i.id === fi.ingredientId)
    return sum + (ing ? ing.currentCost * (Number(fi.quantity) || 0) : 0)
  }, 0)
  const costPerPortion = watchedPortions > 0 ? totalCost / Number(watchedPortions) : 0
  const margin = Number(watchedSellingPrice) - costPerPortion
  const foodCostPct = watchedSellingPrice > 0 ? (costPerPortion / Number(watchedSellingPrice)) * 100 : 0
  const suggestedPrice = FOOD_COST_TARGET > 0 ? costPerPortion / (FOOD_COST_TARGET / 100) : 0

  function onSubmit(data: FormData) {
    const recipeIngredients: RecipeIngredient[] = data.ingredients
      .filter((fi) => fi.ingredientId)
      .map((fi) => {
        const ing = ingredients.find((i) => i.id === fi.ingredientId)!
        return { id: generateId(), ingredientId: fi.ingredientId, ingredientName: ing.name, quantity: Number(fi.quantity), unit: ing.purchaseUnit, unitCost: ing.currentCost, total: ing.currentCost * Number(fi.quantity) }
      })

    const payload = {
      name: data.name,
      category: data.category,
      portions: Number(data.portions),
      ingredients: recipeIngredients,
      totalCost,
      costPerPortion,
      sellingPrice: Number(data.sellingPrice),
      margin,
      foodCostPercentage: foodCostPct,
      notes: data.notes,
    }
    if (recipe) updateRecipe(recipe.id, payload)
    else addRecipe(payload)
    onClose()
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={recipe ? 'Editar Receta' : 'Nueva Receta'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="recipe-form">{recipe ? 'Guardar' : 'Crear receta'}</Button>
        </>
      }
    >
      <form id="recipe-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input label="Nombre de la receta" placeholder="Medialunas de manteca" {...register('name', { required: true })} />
          </div>
          <Select label="Categoría" options={categoryOptions} {...register('category')} />
        </div>
        <Input label="Porciones / unidades que rinde" type="number" min="1" {...register('portions', { valueAsNumber: true })} />

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ingredientes</h4>
            <Button type="button" variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => append({ ingredientId: '', quantity: 1 })}>Agregar</Button>
          </div>
          <div className="space-y-2">
            {fields.map((field, i) => {
              const ing = ingredients.find((x) => x.id === watchedIng[i]?.ingredientId)
              const itemCost = ing ? ing.currentCost * (Number(watchedIng[i]?.quantity) || 0) : 0
              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <Select label={i === 0 ? 'Insumo' : undefined} options={ingredientOptions} {...register(`ingredients.${i}.ingredientId`)} />
                  </div>
                  <div className="col-span-3">
                    <Input label={i === 0 ? 'Cantidad' : undefined} type="number" step="0.01" min="0" {...register(`ingredients.${i}.quantity`, { valueAsNumber: true })} />
                  </div>
                  <div className="col-span-2 pb-0.5">
                    <div className="h-9 flex items-center text-xs text-gray-500 dark:text-gray-400 tabular-nums">{itemCost > 0 ? formatCurrency(itemCost) : '—'}</div>
                  </div>
                  <div className="col-span-1 pb-0.5 flex justify-end">
                    <button type="button" onClick={() => remove(i)} disabled={fields.length === 1} className="h-9 w-9 flex items-center justify-center rounded text-gray-400 hover:text-red-500 disabled:opacity-30">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cost summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Costo total', value: formatCurrency(totalCost) },
            { label: 'Costo por porción', value: formatCurrency(costPerPortion) },
            { label: 'Precio sugerido', value: formatCurrency(suggestedPrice), hint: `FC ${FOOD_COST_TARGET}%` },
          ].map(({ label, value, hint }) => (
            <div key={label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</div>
              {hint && <div className="text-[10px] text-gray-400">{hint}</div>}
            </div>
          ))}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
            <Input label="Precio de venta" type="number" step="0.01" className="border-0 bg-transparent p-0 h-auto text-sm font-bold" {...register('sellingPrice', { valueAsNumber: true })} />
            {foodCostPct > 0 && <div className="text-[10px] text-gray-400 mt-0.5">Food cost: {foodCostPct.toFixed(1)}%</div>}
          </div>
        </div>

        <Textarea label="Procedimiento / Notas" placeholder="Pasos de elaboración..." rows={3} {...register('notes')} />
      </form>
    </Modal>
  )
}

export default function Recipes() {
  const { recipes, deleteRecipe } = useRecipesStore()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Recipe | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = recipes.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()))

  function foodCostColor(pct: number) {
    if (pct < 25) return 'success'
    if (pct < 35) return 'warning'
    return 'danger'
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Recetas"
        description={`${recipes.length} receta${recipes.length !== 1 ? 's' : ''}`}
        actions={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nueva receta</Button>}
      />

      <div className="mb-4">
        <Input placeholder="Buscar recetas..." icon={<Search size={13} />} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ChefHat size={26} />}
            title={search ? 'Sin resultados' : 'Sin recetas'}
            description="Creá recetas para calcular automáticamente el food cost y precio sugerido."
            action={<Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>Nueva receta</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{r.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{r.category}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{r.portions} porciones</span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => { setEditing(r); setFormOpen(true) }} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"><Pencil size={13} /></button>
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                  <div className="text-[10px] text-gray-400">Costo/porción</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(r.costPerPortion)}</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                  <div className="text-[10px] text-gray-400">Precio venta</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{r.sellingPrice > 0 ? formatCurrency(r.sellingPrice) : '—'}</div>
                </div>
              </div>
              {r.foodCostPercentage > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Food cost</span>
                  <Badge variant={foodCostColor(r.foodCostPercentage) as 'success' | 'warning' | 'danger'}>
                    {r.foodCostPercentage.toFixed(1)}%
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white dark:bg-[#1A1D2E] rounded-xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-sm font-semibold mb-2">Eliminar receta</h3>
            <p className="text-xs text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={() => { deleteRecipe(deleteId); setDeleteId(null) }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <RecipeForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} recipe={editing} />
    </div>
  )
}
