import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useFinanceStore } from '@/modules/finance/store'
import { usePurchasesStore } from '@/modules/purchases/store'
import { useIngredientsStore } from '@/modules/ingredients/store'
import { formatCompact, formatCurrency } from '@/shared/utils/currency'
import { CATEGORY_LABELS } from '@/modules/finance/types'

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4']

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 shadow-lg text-xs">
      {label && <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-gray-400">{p.name}:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCompact(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { entries } = useFinanceStore()
  const { purchases } = usePurchasesStore()
  const { ingredients } = useIngredientsStore()

  // Monthly evolution (last 6 months)
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; ingresos: number; gastos: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('es-AR', { month: 'short' })
      months[key] = { month: label, ingresos: 0, gastos: 0 }
    }
    entries.forEach((e) => {
      const key = e.date.slice(0, 7)
      if (months[key]) {
        if (e.type === 'ingreso') months[key].ingresos += e.amount
        else months[key].gastos += e.amount
      }
    })
    purchases.forEach((p) => {
      const key = p.date.slice(0, 7)
      if (months[key]) months[key].gastos += p.total
    })
    return Object.values(months)
  }, [entries, purchases])

  // Expenses by category (this month)
  const categoryData = useMemo(() => {
    const now = new Date()
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const byCategory: Record<string, number> = {}
    entries.filter((e) => e.type === 'gasto' && e.date.startsWith(key)).forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
    })
    return Object.entries(byCategory).map(([cat, amt], i) => ({
      name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
      value: amt,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }))
  }, [entries])

  // Top suppliers by spend
  const supplierData = useMemo(() => {
    const bySupplier: Record<string, number> = {}
    purchases.forEach((p) => {
      const key = p.supplierName || 'Sin nombre'
      bySupplier[key] = (bySupplier[key] ?? 0) + p.total
    })
    return Object.entries(bySupplier)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, total]) => ({ name: name.length > 18 ? name.slice(0, 18) + '...' : name, total }))
  }, [purchases])

  // Ingredients by current cost
  const ingredientData = useMemo(() =>
    [...ingredients]
      .sort((a, b) => b.currentCost - a.currentCost)
      .slice(0, 8)
      .map((i) => ({ name: i.name.length > 14 ? i.name.slice(0, 14) + '...' : i.name, costo: i.currentCost }))
    , [ingredients])

  const hasData = entries.length > 0 || purchases.length > 0

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Analítica" description="Gráficos y tendencias basados en tus datos" />

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 mb-4 text-purple-500">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Sin datos suficientes</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">Registrá compras, finanzas e insumos para ver los gráficos aquí.</p>
        </div>
      ) : (
        <>
          {/* Monthly evolution */}
          <Card>
            <CardHeader title="Evolución Mensual" description="Ingresos vs Gastos — últimos 6 meses" />
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 4, right: 2, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={55} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#6366f1" strokeWidth={2} fill="url(#gI)" dot={false} />
                  <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#f43f5e" strokeWidth={2} fill="url(#gG)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Expenses by category */}
            {categoryData.length > 0 && (
              <Card>
                <CardHeader title="Gastos por Categoría" description="Mes actual" />
                <div className="flex items-center gap-4">
                  <div className="h-44 w-44 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {categoryData.map((_, i) => <Cell key={i} fill={categoryData[i].color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {categoryData.map((c) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{c.name}</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{formatCompact(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Top suppliers */}
            {supplierData.length > 0 && (
              <Card>
                <CardHeader title="Top Proveedores" description="Por volumen de compras" />
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplierData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="total" name="Compras" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Ingredients by cost */}
            {ingredientData.length > 0 && (
              <Card>
                <CardHeader title="Insumos por Costo Actual" description="Por unidad de compra" />
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ingredientData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="costo" name="Costo" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
