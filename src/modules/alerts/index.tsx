import { useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCheck, Bell, TrendingUp } from 'lucide-react'
import { Button, Badge, Tabs } from '@/shared/components/ui'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useIngredientsStore } from '@/modules/ingredients/store'
import { useInventoryStore } from '@/modules/inventory/store'
import { usePurchasesStore } from '@/modules/purchases/store'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate, formatRelative } from '@/shared/utils/date'
import { cn } from '@/shared/utils/cn'

type AlertSeverity = 'critical' | 'warning' | 'info'
type AlertType = 'price_increase' | 'low_stock' | 'large_purchase' | 'no_purchases'

interface GeneratedAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  date: string
  module: string
  path: string
}

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: React.ReactNode; iconColor: string; bg: string; label: string }> = {
  critical: { icon: <AlertCircle size={15} />, iconColor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20', label: 'Crítico' },
  warning: { icon: <AlertTriangle size={15} />, iconColor: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20', label: 'Aviso' },
  info: { icon: <Info size={15} />, iconColor: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20', label: 'Info' },
}

const SEVERITY_BADGE: Record<AlertSeverity, 'danger' | 'warning' | 'info'> = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
}

const TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'critical', label: 'Críticas' },
  { id: 'warning', label: 'Avisos' },
  { id: 'info', label: 'Info' },
]

export default function Alerts() {
  const { ingredients } = useIngredientsStore()
  const { getLowStockItems } = useInventoryStore()
  const { purchases } = usePurchasesStore()
  const [activeTab, setActiveTab] = useState('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const today = new Date().toISOString().split('T')[0]

  const alerts: GeneratedAlert[] = useMemo(() => {
    const result: GeneratedAlert[] = []

    // Price increase alerts (>15% in last 2 price points)
    ingredients.forEach((ing) => {
      const history = ing.priceHistory
      if (history.length >= 2) {
        const last = history.at(-1)!
        const prev = history.at(-2)!
        const change = ((last.price - prev.price) / prev.price) * 100
        if (change > 20) {
          result.push({
            id: `price_${ing.id}`,
            type: 'price_increase',
            severity: 'critical',
            title: `Aumento brusco de precio: ${ing.name}`,
            description: `Subió un ${change.toFixed(1)}% — de ${formatCurrency(prev.price)} a ${formatCurrency(last.price)} por ${ing.purchaseUnit}`,
            date: last.date,
            module: 'Insumos',
            path: '/insumos',
          })
        } else if (change > 10) {
          result.push({
            id: `price_${ing.id}`,
            type: 'price_increase',
            severity: 'warning',
            title: `Aumento de precio: ${ing.name}`,
            description: `Subió un ${change.toFixed(1)}% — de ${formatCurrency(prev.price)} a ${formatCurrency(last.price)} por ${ing.purchaseUnit}`,
            date: last.date,
            module: 'Insumos',
            path: '/insumos',
          })
        }
      }
    })

    // Low stock alerts
    getLowStockItems().forEach((item) => {
      result.push({
        id: `stock_${item.ingredientId}`,
        type: 'low_stock',
        severity: item.currentStock === 0 ? 'critical' : 'warning',
        title: `Stock bajo: ${item.ingredientName}`,
        description: `Stock actual: ${item.currentStock} ${item.unit} · Mínimo configurado: ${item.minStock} ${item.unit}`,
        date: item.lastUpdated.split('T')[0],
        module: 'Inventario',
        path: '/inventario',
      })
    })

    // Large purchase alert (>2x average)
    if (purchases.length > 3) {
      const avg = purchases.reduce((s, p) => s + p.total, 0) / purchases.length
      purchases.slice(0, 5).forEach((p) => {
        if (p.total > avg * 2.5) {
          result.push({
            id: `purchase_${p.id}`,
            type: 'large_purchase',
            severity: 'info',
            title: `Compra inusualmente alta`,
            description: `${p.supplierName}: ${formatCurrency(p.total)} el ${formatDate(p.date)} (promedio: ${formatCurrency(avg)})`,
            date: p.date,
            module: 'Compras',
            path: '/compras',
          })
        }
      })
    }

    // No purchases this month
    const thisMonth = today.slice(0, 7)
    const purchasesThisMonth = purchases.filter((p) => p.date.startsWith(thisMonth))
    if (purchasesThisMonth.length === 0 && purchases.length > 0) {
      result.push({
        id: 'no_purchases_month',
        type: 'no_purchases',
        severity: 'info',
        title: 'Sin compras este mes',
        description: 'No hay compras registradas en el mes actual.',
        date: today,
        module: 'Compras',
        path: '/compras',
      })
    }

    return result.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 }
      return order[a.severity] - order[b.severity]
    })
  }, [ingredients, getLowStockItems, purchases, today])

  const visible = alerts
    .filter((a) => !dismissed.has(a.id))
    .filter((a) => activeTab === 'all' || a.severity === activeTab)

  const tabs = TABS.map((t) => ({
    ...t,
    count: t.id === 'all'
      ? alerts.filter((a) => !dismissed.has(a.id)).length
      : alerts.filter((a) => !dismissed.has(a.id) && a.severity === t.id).length,
  }))

  function dismissAll() {
    setDismissed(new Set(alerts.map((a) => a.id)))
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Alertas"
        description={`${visible.length} alerta${visible.length !== 1 ? 's' : ''} activa${visible.length !== 1 ? 's' : ''}`}
        actions={
          visible.length > 0 && (
            <Button variant="secondary" size="sm" icon={<CheckCheck size={13} />} onClick={dismissAll}>
              Descartar todas
            </Button>
          )
        }
      />

      <Card padding="none">
        <div className="px-5 pt-4 border-b border-gray-100 dark:border-gray-800">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mb-4">
              <CheckCheck size={28} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Todo en orden</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              {alerts.length > 0 ? 'Todas las alertas fueron descartadas.' : 'Cuando haya alertas de precios, stock o compras anómalas aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {visible.map((alert) => {
              const config = SEVERITY_CONFIG[alert.severity]
              return (
                <div key={alert.id} className="flex items-start gap-4 p-5">
                  <div className={cn('p-2 rounded-lg border flex-shrink-0 mt-0.5', config.bg)}>
                    <span className={config.iconColor}>{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                        {alert.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={SEVERITY_BADGE[alert.severity]}>{config.label}</Badge>
                        <button
                          onClick={() => setDismissed((d) => new Set([...d, alert.id]))}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-400">{formatRelative(alert.date)}</span>
                      <span className="text-[10px] text-gray-400">·</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">{alert.module}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
