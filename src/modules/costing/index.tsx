import { useState } from 'react'
import { Calculator, Plus, Trash2, TrendingUp, Users, Zap, BarChart2, RotateCcw } from 'lucide-react'
import { Button, Input, Select, Badge } from '@/shared/components/ui'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { calculatePricing, type SelectedDish, type PricingFactors, type PricingResult } from './pricingEngine'
import { formatCurrency } from '@/shared/utils/currency'
import { cn } from '@/shared/utils/cn'
import { generateId } from '@/shared/utils/id'

const DEFAULT_FACTORS: PricingFactors = {
  people: 100,
  serviceLevel: 'standard',
  urgency: 'normal',
  inflationRate: 8.5,
}

const SERVICE_OPTIONS = [
  { value: 'basic', label: 'Básico (-20%)' },
  { value: 'standard', label: 'Estándar' },
  { value: 'premium', label: 'Premium (+50%)' },
]

const URGENCY_OPTIONS = [
  { value: 'normal', label: 'Normal (>15 días)' },
  { value: 'urgent', label: 'Urgente (7–14 días) +20%' },
  { value: 'veryUrgent', label: 'Muy urgente (<7 días) +40%' },
]

const CONFIDENCE_CONFIG = {
  high: { label: 'Alta confianza', variant: 'success' as const, color: 'text-emerald-600 dark:text-emerald-400' },
  medium: { label: 'Confianza media', variant: 'warning' as const, color: 'text-amber-600 dark:text-amber-400' },
  low: { label: 'Baja confianza', variant: 'danger' as const, color: 'text-red-600 dark:text-red-400' },
}

const QUICK_DISHES = [
  { name: 'Isla de Sushi', pricePerPerson: 9500 },
  { name: 'Estación de Asado', pricePerPerson: 8900 },
  { name: 'Mesa de Quesos', pricePerPerson: 4100 },
  { name: 'Barra de Tragos', pricePerPerson: 6800 },
  { name: 'Pernil', pricePerPerson: 5400 },
]

export default function Costing() {
  const [dishes, setDishes] = useState<SelectedDish[]>([])
  const [factors, setFactors] = useState<PricingFactors>(DEFAULT_FACTORS)
  const [newDish, setNewDish] = useState({ name: '', pricePerPerson: '' })
  const [result, setResult] = useState<PricingResult | null>(null)

  function addDish() {
    if (!newDish.name || !newDish.pricePerPerson) return
    setDishes((d) => [...d, { id: generateId(), name: newDish.name, pricePerPerson: Number(newDish.pricePerPerson) }])
    setNewDish({ name: '', pricePerPerson: '' })
    setResult(null)
  }

  function removeDish(id: string) {
    setDishes((d) => d.filter((x) => x.id !== id))
    setResult(null)
  }

  function addQuickDish(dish: { name: string; pricePerPerson: number }) {
    setDishes((d) => [...d, { id: generateId(), ...dish }])
    setResult(null)
  }

  function calculate() {
    setResult(calculatePricing(dishes, factors))
  }

  function reset() {
    setDishes([])
    setFactors(DEFAULT_FACTORS)
    setResult(null)
    setNewDish({ name: '', pricePerPerson: '' })
  }

  const baseSum = dishes.reduce((s, d) => s + d.pricePerPerson, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Costeo de Eventos"
        description="Calculadora paramétrica de presupuestos gastronómicos"
        actions={
          result && (
            <Button variant="secondary" size="sm" icon={<RotateCcw size={13} />} onClick={reset}>
              Nuevo cálculo
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Left: dishes + params */}
        <div className="space-y-5">
          {/* Dishes */}
          <Card>
            <CardHeader title="Menú del Evento" description="Platos y precio por persona" />

            {/* Quick add */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Platos rápidos:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_DISHES.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => addQuickDish(d)}
                    className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    + {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual add */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Nombre del plato"
                  value={newDish.name}
                  onChange={(e) => setNewDish((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addDish()}
                />
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  placeholder="$/persona"
                  value={newDish.pricePerPerson}
                  onChange={(e) => setNewDish((p) => ({ ...p, pricePerPerson: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addDish()}
                />
              </div>
              <Button icon={<Plus size={14} />} onClick={addDish} />
            </div>

            {/* Dish list */}
            {dishes.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                <Calculator size={24} className="mx-auto mb-2" />
                <p className="text-xs">Agregá platos para calcular el presupuesto</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {dishes.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 group">
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{d.name}</span>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {formatCurrency(d.pricePerPerson)}/p
                      </span>
                      <button onClick={() => removeDish(d.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{dishes.length} plato{dishes.length !== 1 ? 's' : ''} · Base/persona:</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{formatCurrency(baseSum)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader title="Parámetros del Evento" />
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Cantidad de personas: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{factors.people}</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={1500}
                  step={10}
                  value={factors.people}
                  onChange={(e) => { setFactors((f) => ({ ...f, people: Number(e.target.value) })); setResult(null) }}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>10</span><span>1500</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Nivel de servicio"
                  options={SERVICE_OPTIONS}
                  value={factors.serviceLevel}
                  onChange={(e) => { setFactors((f) => ({ ...f, serviceLevel: e.target.value as PricingFactors['serviceLevel'] })); setResult(null) }}
                />
                <Select
                  label="Urgencia"
                  options={URGENCY_OPTIONS}
                  value={factors.urgency}
                  onChange={(e) => { setFactors((f) => ({ ...f, urgency: e.target.value as PricingFactors['urgency'] })); setResult(null) }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Ajuste por inflación mensual: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{factors.inflationRate}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={0.5}
                  value={factors.inflationRate}
                  onChange={(e) => { setFactors((f) => ({ ...f, inflationRate: Number(e.target.value) })); setResult(null) }}
                  className="w-full accent-indigo-600"
                />
              </div>

              <Button
                className="w-full"
                icon={<Calculator size={15} />}
                disabled={dishes.length === 0}
                onClick={calculate}
              >
                Calcular presupuesto
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: results */}
        <div>
          {result ? (
            <div className="space-y-4">
              {/* Main result */}
              <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 border-0">
                <div className="text-center py-4">
                  <p className="text-indigo-200 text-xs font-medium mb-2">PRESUPUESTO TOTAL</p>
                  <p className="text-white text-4xl font-bold tabular-nums">{formatCurrency(result.totalPrice)}</p>
                  <p className="text-indigo-200 text-sm mt-2">{formatCurrency(result.pricePerPerson)}/persona · {factors.people} personas</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-indigo-200 text-xs">Rango: {formatCurrency(result.rangeMin)} – {formatCurrency(result.rangeMax)}</span>
                  </div>
                  <div className="mt-3">
                    <Badge variant={CONFIDENCE_CONFIG[result.confidence].variant}>
                      {CONFIDENCE_CONFIG[result.confidence].label}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Explanation */}
              <Card>
                <CardHeader title="Desglose del cálculo" />
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                  {result.explanation}
                </p>
              </Card>

              {/* Factor breakdown */}
              <Card>
                <CardHeader title="Factores aplicados" />
                <div className="space-y-3">
                  {[
                    { label: 'Base por persona', value: formatCurrency(result.breakdown.basePrice), icon: <Calculator size={14} /> },
                    { label: 'Factor personas', value: `×${result.breakdown.peopleFactor}`, icon: <Users size={14} />, color: result.breakdown.peopleFactor !== 1 ? (result.breakdown.peopleFactor > 1 ? 'text-amber-500' : 'text-emerald-500') : 'text-gray-500' },
                    { label: 'Factor servicio', value: `×${result.breakdown.serviceFactor}`, icon: <Zap size={14} />, color: result.breakdown.serviceFactor !== 1 ? (result.breakdown.serviceFactor > 1 ? 'text-amber-500' : 'text-emerald-500') : 'text-gray-500' },
                    { label: 'Factor urgencia', value: `×${result.breakdown.urgencyFactor}`, icon: <TrendingUp size={14} />, color: result.breakdown.urgencyFactor > 1 ? 'text-red-500' : 'text-gray-500' },
                    { label: 'Factor inflación', value: `×${result.breakdown.inflationFactor.toFixed(3)}`, icon: <BarChart2 size={14} />, color: 'text-orange-500' },
                    result.breakdown.scaleDiscount > 0 && { label: 'Descuento escala', value: `-${(result.breakdown.scaleDiscount * 100).toFixed(0)}%`, icon: <TrendingUp size={14} />, color: 'text-emerald-500' },
                  ].filter(Boolean).map((item) => {
                    if (!item) return null
                    return (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-gray-400', item.color)}>{item.icon}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                        </div>
                        <span className={cn('text-xs font-semibold tabular-nums', item.color ?? 'text-gray-900 dark:text-gray-100')}>
                          {item.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Export */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const text = `PRESUPUESTO KITCHEN ERP\n\nTotal: ${formatCurrency(result.totalPrice)}\nPor persona: ${formatCurrency(result.pricePerPerson)}\nPersonas: ${factors.people}\n\n${result.explanation}`
                    navigator.clipboard.writeText(text)
                  }}
                >
                  Copiar resultado
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.print()}
                >
                  Imprimir
                </Button>
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-64">
              <div className="flex flex-col items-center justify-center h-full min-h-48 text-center">
                <Calculator size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Agregá platos y configurá los parámetros</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">El presupuesto aparecerá aquí</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
