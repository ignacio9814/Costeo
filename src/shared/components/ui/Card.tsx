import { cn } from '@/shared/utils/cn'

type Padding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: Padding
}

const paddings: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ className, padding = 'md', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white dark:bg-[#1A1D2E]',
        'border border-gray-100 dark:border-gray-800',
        'shadow-sm',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}
