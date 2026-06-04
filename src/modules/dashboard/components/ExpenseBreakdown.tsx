import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/shared/components/ui/Card'
import { formatCompact, formatCurrency } from '@/shared/utils/currency'
import type { CategoryExpense } from '@/shared/types'

interface TooltipProps { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }
function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 shadow-lg text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: item.payload.color }} />
        <span className="text-gray-700 dark:text-gray-300">{item.name}:</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(item.value)}</span>
      </div>
    </div>
  )
}

export function ExpenseBreakdown({ data }: { data: CategoryExpense[] }) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Distribución de Gastos</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Mes actual</p>
      </div>
      {data.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600 text-center">
          Sin gastos registrados<br />este mes
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-44 w-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="amount" nameKey="name" strokeWidth={0}>
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2.5">
            {data.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{cat.name}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
