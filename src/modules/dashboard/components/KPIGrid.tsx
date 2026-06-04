import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react'
import { KPICard } from '@/shared/components/ui/KPICard'
import { kpiData } from '../data/mockData'

const icons = [
  <DollarSign size={16} />,
  <TrendingDown size={16} />,
  <TrendingUp size={16} />,
  <Percent size={16} />,
]

export function KPIGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpiData.map((kpi, i) => (
        <KPICard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          change={kpi.change}
          format={kpi.format}
          iconBg={`${kpi.bgColor} ${kpi.color}`}
          icon={icons[i]}
          subtitle={kpi.subtitle}
        />
      ))}
    </div>
  )
}
