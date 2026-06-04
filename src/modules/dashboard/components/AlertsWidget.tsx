import { AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'
import type { Alert, AlertSeverity } from '@/shared/types'

const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; iconColor: string; bg: string }> = {
  critical: { icon: <AlertCircle size={13} />, iconColor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20' },
  warning: { icon: <AlertTriangle size={13} />, iconColor: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20' },
  info: { icon: <Info size={13} />, iconColor: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20' },
}

export function AlertsWidget({ alerts }: { alerts: Alert[] }) {
  const navigate = useNavigate()
  const unread = alerts.filter((a) => !a.read).length

  return (
    <Card>
      <CardHeader
        title="Alertas Activas"
        description={alerts.length > 0 ? `${unread} sin leer` : 'Todo en orden'}
        action={
          <Button variant="ghost" size="sm" icon={<ArrowRight size={12} />} onClick={() => navigate('/alertas')}>
            Ver
          </Button>
        }
      />
      {alerts.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600">Sin alertas activas.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity]
            return (
              <div key={alert.id} className={cn('flex items-start gap-2.5 p-2.5 rounded-lg text-xs', config.bg)}>
                <span className={cn('mt-0.5 flex-shrink-0', config.iconColor)}>{config.icon}</span>
                <div className="min-w-0">
                  <div className="text-gray-900 dark:text-gray-100 font-medium truncate">{alert.title}</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{alert.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
