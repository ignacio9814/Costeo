import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { formatCurrency } from '@/shared/utils/currency'
import { cn } from '@/shared/utils/cn'
import type { TopProduct } from '@/shared/types'

export function TopProductsWidget({ products }: { products: TopProduct[] }) {
  const maxAmount = products[0]?.amount ?? 1

  return (
    <Card>
      <CardHeader title="Insumos más Comprados" description="Por costo total acumulado" />
      {products.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600">Sin compras registradas aún.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product, i) => {
            const isUp = product.trend > 0
            return (
              <div key={product.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 dark:text-gray-700 w-4 text-center tabular-nums">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate mr-2">{product.name}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 tabular-nums flex-shrink-0">{formatCurrency(product.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full flex-1">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(product.amount / maxAmount) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{product.unit}</span>
                    {product.trend !== 0 && (
                      <span className={cn('flex items-center gap-0.5 text-[10px] font-semibold flex-shrink-0', isUp ? 'text-red-500' : 'text-emerald-500')}>
                        {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        {Math.abs(product.trend)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
