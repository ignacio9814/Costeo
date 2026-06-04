import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/shared/components/ui/Card'
import { formatCompact, formatCurrency } from '@/shared/utils/currency'
import type { TimeSeriesPoint } from '@/shared/types'

interface TooltipPayload { dataKey: string; name: string; color: string; value: number }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-gray-400">{p.name}:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const legend = [
  { key: 'ingresos', label: 'Ingresos', color: '#6366f1' },
  { key: 'gastos', label: 'Gastos', color: '#f43f5e' },
]

export function RevenueChart({ data }: { data: TimeSeriesPoint[] }) {
  const isEmpty = data.every((d) => d.ingresos === 0 && d.gastos === 0)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Evolución Mensual</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Últimos 6 meses — ingresos vs gastos</p>
        </div>
        <div className="flex items-center gap-4">
          {legend.map((l) => (
            <div key={l.key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      {isEmpty ? (
        <div className="h-56 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
          Sin datos aún — registrá compras e ingresos para ver la evolución
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 2, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#6366f1" strokeWidth={2} fill="url(#gradI)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#f43f5e" strokeWidth={2} fill="url(#gradG)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
