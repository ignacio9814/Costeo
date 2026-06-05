import { Plus, Wallet, ShoppingBasket, Users, TrendingUp, ShoppingCart, BarChart3, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { KPICard } from '@/shared/components/ui/KPICard'
import { RevenueChart } from './components/RevenueChart'
import { ExpenseBreakdown } from './components/ExpenseBreakdown'
import { RecentPurchasesTable } from './components/RecentPurchasesTable'
import { AlertsWidget } from './components/AlertsWidget'
import { TopProductsWidget } from './components/TopProductsWidget'
import { useDashboardData } from './hooks/useDashboardData'

const KPI_ICONS = [
  <Wallet size={16} />,
  <ShoppingBasket size={16} />,
  <Users size={16} />,
  <TrendingUp size={16} />,
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { kpis, monthlyData, categoryData, recentPurchases, topProducts, alerts, hasRealData } = useDashboardData()

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Dashboard Ejecutivo"
        description="Resumen financiero y operativo del negocio"
        actions={
          <Button icon={<Plus size={14} />} onClick={() => navigate('/compras')}>
            Nueva Compra
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            format={kpi.format}
            iconBg={`${kpi.bgColor} ${kpi.color}`}
            icon={KPI_ICONS[i]}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Empty state for first time users */}
      {!hasRealData && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"><ShoppingCart size={20} /></div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"><DollarSign size={20} /></div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500"><BarChart3 size={20} /></div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Comenzá a cargar datos</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
            Registrá compras, ingresos y gastos para ver los gráficos y estadísticas reales de tu negocio aquí.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="sm" icon={<Plus size={13} />} onClick={() => navigate('/compras')}>Registrar compra</Button>
            <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={() => navigate('/finanzas')}>Registrar ingreso</Button>
          </div>
        </div>
      )}

      {/* Charts */}
      {hasRealData && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <RevenueChart data={monthlyData} />
            </div>
            <ExpenseBreakdown data={categoryData} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <RecentPurchasesTable purchases={recentPurchases} />
            </div>
            <div className="space-y-5">
              <AlertsWidget alerts={alerts} />
              <TopProductsWidget products={topProducts} />
            </div>
          </div>
        </>
      )}

      {/* Show partial data even without full data */}
      {hasRealData && (
        <></>
      )}
    </div>
  )
}
