import { ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate } from '@/shared/utils/date'
import type { RecentPurchase, DocumentType, PurchaseStatus } from '@/shared/types'

const DOC_LABELS: Record<DocumentType, string> = {
  factura_a: 'Factura A', factura_b: 'Factura B', ticket: 'Ticket', remito: 'Remito', recibo: 'Recibo',
}

type BadgeVariant = 'success' | 'warning' | 'default' | 'indigo'
const STATUS_CONFIG: Record<PurchaseStatus, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Confirmado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  draft: { label: 'Borrador', variant: 'default' },
  reconciled: { label: 'Conciliado', variant: 'indigo' },
}

export function RecentPurchasesTable({ purchases }: { purchases: RecentPurchase[] }) {
  const navigate = useNavigate()

  return (
    <Card padding="none">
      <div className="p-5 pb-0">
        <CardHeader
          title="Compras Recientes"
          description={purchases.length > 0 ? `Últimas ${purchases.length} operaciones` : 'Sin compras registradas'}
          action={
            <Button variant="ghost" size="sm" icon={<ExternalLink size={12} />} onClick={() => navigate('/compras')}>
              Ver todas
            </Button>
          }
        />
      </div>
      {purchases.length === 0 ? (
        <div className="px-5 pb-5 text-xs text-gray-400 dark:text-gray-600">
          Registrá tu primera compra para verla aquí.
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {['Proveedor', 'Tipo', 'Fecha', 'Total', 'Estado'].map((h, i) => (
                    <th key={h} className={`py-3 ${i === 0 ? 'pl-5 text-left' : i === 3 ? 'pr-5 text-right' : 'px-3 text-left'} ${i === 4 ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {purchases.map((p) => {
                  const st = STATUS_CONFIG[p.status] ?? { label: p.status, variant: 'default' as BadgeVariant }
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                      <td className="pl-5 py-3.5 text-xs font-medium text-gray-900 dark:text-gray-100">{p.supplier || '—'}</td>
                      <td className="px-3 py-3.5 text-xs text-gray-500 dark:text-gray-400">{DOC_LABELS[p.type] ?? p.type}</td>
                      <td className="px-3 py-3.5 text-xs text-gray-500 dark:text-gray-400">{formatDate(p.date)}</td>
                      <td className="pr-5 py-3.5 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(p.amount)}</td>
                      <td className="px-3 py-3.5 text-center"><Badge variant={st.variant}>{st.label}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800/60">
            {purchases.map((p) => {
              const st = STATUS_CONFIG[p.status] ?? { label: p.status, variant: 'default' as BadgeVariant }
              return (
                <div key={p.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.supplier || '—'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{DOC_LABELS[p.type]} · {formatDate(p.date)}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(p.amount)}</span>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="h-4" />
        </>
      )}
    </Card>
  )
}
