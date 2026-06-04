import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { formatCompact } from '@/shared/utils/currency'

interface KPICardProps {
  label: string
  value: number
  change: number
  format?: 'currency' | 'percentage' | 'number'
  icon: React.ReactNode
  iconBg?: string
  subtitle?: string
  className?: string
}

export function KPICard({
  label,
  value,
  change,
  format = 'currency',
  icon,
  iconBg = 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  subtitle,
  className,
}: KPICardProps) {
  const isUp = change > 0
  const isDown = change < 0

  const display =
    format === 'currency'
      ? formatCompact(value)
      : format === 'percentage'
        ? `${value.toFixed(1)}%`
        : value.toLocaleString('es-AR')

  return (
    <div
      className={cn(
        'rounded-xl bg-white dark:bg-[#1A1D2E]',
        'border border-gray-100 dark:border-gray-800',
        'shadow-sm p-5 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        <div className={cn('p-2 rounded-lg', iconBg)}>{icon}</div>
      </div>

      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums leading-none">
          {display}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {isUp && <TrendingUp size={13} className="text-emerald-500 flex-shrink-0" />}
        {isDown && <TrendingDown size={13} className="text-red-500 flex-shrink-0" />}
        {!isUp && !isDown && <Minus size={13} className="text-gray-400 flex-shrink-0" />}
        <span
          className={cn(
            'text-xs font-medium',
            isUp && 'text-emerald-600 dark:text-emerald-400',
            isDown && 'text-red-600 dark:text-red-400',
            !isUp && !isDown && 'text-gray-500'
          )}
        >
          {isUp ? '+' : ''}
          {change.toFixed(1)}% vs mes anterior
        </span>
      </div>
    </div>
  )
}
