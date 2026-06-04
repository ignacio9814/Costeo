import { cn } from '@/shared/utils/cn'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'indigo' | 'violet'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
