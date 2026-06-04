import { cn } from '@/shared/utils/cn'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap',
            'transition-colors border-b-2 -mb-px',
            active === tab.id
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full tabular-nums',
                active === tab.id
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
