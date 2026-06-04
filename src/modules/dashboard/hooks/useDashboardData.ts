import { useMemo } from 'react'
import { usePurchasesStore } from '@/modules/purchases/store'
import { useFinanceStore } from '@/modules/finance/store'
import { useIngredientsStore } from '@/modules/ingredients/store'
import { useInventoryStore } from '@/modules/inventory/store'
import type { TimeSeriesPoint, CategoryExpense, RecentPurchase, Alert, TopProduct, KPIConfig } from '@/shared/types'
import { CATEGORY_LABELS } from '@/modules/finance/types'

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function prevMonthKey(date: Date) {
  const d = new Date(date)
  d.setMonth(d.getMonth() - 1)
  return monthKey(d)
}

export function useDashboardData() {
  const { purchases } = usePurchasesStore()
  const { entries } = useFinanceStore()
  const { ingredients } = useIngredientsStore()
  const { getLowStockItems } = useInventoryStore()

  const now = new Date()
  const thisMonth = monthKey(now)
  const lastMonth = prevMonthKey(now)

  // ── Plata recibida del salón este mes ─────────────────────────────────────
  const recibidoThisMonth = useMemo(
    () => entries.filter((e) => e.type === 'ingreso' && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0),
    [entries, thisMonth]
  )
  const recibidoLastMonth = useMemo(
    () => entries.filter((e) => e.type === 'ingreso' && e.date.startsWith(lastMonth)).reduce((s, e) => s + e.amount, 0),
    [entries, lastMonth]
  )

  // ── Gasto en compras (insumos del almacén) ────────────────────────────────
  const purchasesThisMonth = useMemo(
    () => purchases.filter((p) => p.date.startsWith(thisMonth) && p.status === 'confirmed').reduce((s, p) => s + p.total, 0),
    [purchases, thisMonth]
  )
  const purchasesLastMonth = useMemo(
    () => purchases.filter((p) => p.date.startsWith(lastMonth) && p.status === 'confirmed').reduce((s, p) => s + p.total, 0),
    [purchases, lastMonth]
  )

  // ── Sueldos (de finanzas) ─────────────────────────────────────────────────
  const sueldosThisMonth = useMemo(
    () => entries.filter((e) => e.category === 'sueldos' && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0),
    [entries, thisMonth]
  )
  const sueldosLastMonth = useMemo(
    () => entries.filter((e) => e.category === 'sueldos' && e.date.startsWith(lastMonth)).reduce((s, e) => s + e.amount, 0),
    [entries, lastMonth]
  )

  // ── Otros gastos operativos ───────────────────────────────────────────────
  const otherGastosThis = useMemo(
    () => entries.filter((e) => e.type === 'gasto' && e.category !== 'sueldos' && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0),
    [entries, thisMonth]
  )

  // ── Total gasto operativo ─────────────────────────────────────────────────
  const gastoTotalThis = purchasesThisMonth + sueldosThisMonth + otherGastosThis
  const gastoTotalLast = purchasesLastMonth + sueldosLastMonth

  // ── Resultado operativo (plata recibida - todo lo que se gastó) ───────────
  const resultadoThis = recibidoThisMonth - gastoTotalThis
  const resultadoLast = recibidoLastMonth - gastoTotalLast

  const pct = (a: number, b: number) => (b !== 0 ? ((a - b) / Math.abs(b)) * 100 : a > 0 ? 100 : 0)

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo((): KPIConfig[] => [
    {
      label: 'Recibido del Salón',
      value: recibidoThisMonth,
      change: pct(recibidoThisMonth, recibidoLastMonth),
      format: 'currency',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      subtitle: now.toLocaleString('es-AR', { month: 'long', year: 'numeric' }),
    },
    {
      label: 'Gasto en Insumos',
      value: purchasesThisMonth,
      change: pct(purchasesThisMonth, purchasesLastMonth),
      format: 'currency',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      subtitle: `${purchases.filter((p) => p.date.startsWith(thisMonth)).length} compras este mes`,
    },
    {
      label: 'Sueldos Pagados',
      value: sueldosThisMonth,
      change: pct(sueldosThisMonth, sueldosLastMonth),
      format: 'currency',
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-500/10',
      subtitle: 'Registrado en Finanzas',
    },
    {
      label: 'Resultado Operativo',
      value: resultadoThis,
      change: pct(resultadoThis, resultadoLast),
      format: 'currency',
      color: resultadoThis >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bgColor: resultadoThis >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10',
      subtitle: 'Recibido − Insumos − Sueldos − Otros',
    },
  ], [recibidoThisMonth, recibidoLastMonth, purchasesThisMonth, purchasesLastMonth, sueldosThisMonth, sueldosLastMonth, resultadoThis, resultadoLast, purchases, thisMonth])

  // ── Monthly evolution ─────────────────────────────────────────────────────
  const monthlyData = useMemo((): TimeSeriesPoint[] => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const key = monthKey(d)
      const label = d.toLocaleString('es-AR', { month: 'short' })
      const ingresos = entries.filter((e) => e.type === 'ingreso' && e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0)
      const gastosFin = entries.filter((e) => e.type === 'gasto' && e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0)
      const gastosPurchases = purchases.filter((p) => p.date.startsWith(key) && p.status === 'confirmed').reduce((s, p) => s + p.total, 0)
      const gastos = gastosFin + gastosPurchases
      return { month: label, ingresos, gastos, ganancia: ingresos - gastos }
    })
  }, [entries, purchases])

  // ── Expense breakdown (this month) ────────────────────────────────────────
  const categoryData = useMemo((): CategoryExpense[] => {
    const colors = ['#f59e0b', '#8b5cf6', '#6366f1', '#f43f5e', '#06b6d4', '#84cc16', '#ec4899']
    const byCategory: Record<string, number> = {}

    entries.filter((e) => e.type === 'gasto' && e.date.startsWith(thisMonth)).forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
    })
    if (purchasesThisMonth > 0) {
      byCategory['insumos_compras'] = (byCategory['insumos_compras'] ?? 0) + purchasesThisMonth
    }

    const total = Object.values(byCategory).reduce((s, v) => s + v, 0)
    if (total === 0) return []

    return Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat, amount], i) => ({
        name: cat === 'insumos_compras' ? 'Compras de insumos' : (CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat),
        amount,
        percentage: Math.round((amount / total) * 100),
        color: colors[i % colors.length],
      }))
  }, [entries, purchasesThisMonth, thisMonth])

  // ── Recent purchases ───────────────────────────────────────────────────────
  const recentPurchases = useMemo((): RecentPurchase[] =>
    purchases.slice(0, 5).map((p) => ({
      id: p.id,
      supplier: p.supplierName,
      date: p.date,
      type: p.type,
      amount: p.total,
      status: p.status,
    }))
  , [purchases])

  // ── Top products ──────────────────────────────────────────────────────────
  const topProducts = useMemo((): TopProduct[] => {
    const byName: Record<string, { amount: number; qty: number; unit: string }> = {}
    purchases.forEach((p) => {
      p.items.forEach((item) => {
        if (!item.name) return
        if (!byName[item.name]) byName[item.name] = { amount: 0, qty: 0, unit: item.unit }
        byName[item.name].amount += item.total
        byName[item.name].qty += item.quantity
      })
    })
    return Object.entries(byName)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([name, data]) => ({ name, amount: data.amount, unit: `${data.qty.toFixed(1)} ${data.unit}`, trend: 0 }))
  }, [purchases])

  // ── Alerts ────────────────────────────────────────────────────────────────
  const alerts = useMemo((): Alert[] => {
    const result: Alert[] = []
    ingredients.forEach((ing) => {
      const h = ing.priceHistory
      if (h.length >= 2) {
        const last = h.at(-1)!; const prev = h.at(-2)!
        const change = prev.price > 0 ? ((last.price - prev.price) / prev.price) * 100 : 0
        if (change > 15) {
          result.push({
            id: `price_${ing.id}`, type: 'price_increase',
            title: `Precio subió: ${ing.name}`,
            description: `+${change.toFixed(1)}% — de $${prev.price.toLocaleString('es-AR')} a $${last.price.toLocaleString('es-AR')}`,
            severity: change > 25 ? 'critical' : 'warning', date: last.date, read: false,
          })
        }
      }
    })
    getLowStockItems().slice(0, 3).forEach((item) => {
      result.push({
        id: `stock_${item.ingredientId}`, type: 'low_stock',
        title: `Stock bajo: ${item.ingredientName}`,
        description: `${item.currentStock} ${item.unit} disponibles (mínimo: ${item.minStock})`,
        severity: item.currentStock === 0 ? 'critical' : 'warning',
        date: item.lastUpdated.split('T')[0], read: false,
      })
    })
    return result.sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a.severity] - ({ critical: 0, warning: 1, info: 2 }[b.severity]))).slice(0, 3)
  }, [ingredients, getLowStockItems])

  const hasRealData = purchases.length > 0 || entries.length > 0

  return { kpis, monthlyData, categoryData, recentPurchases, topProducts, alerts, hasRealData }
}
