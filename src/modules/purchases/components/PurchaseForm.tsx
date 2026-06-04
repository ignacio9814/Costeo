import { useEffect, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { Plus, Trash2, Package } from 'lucide-react'
import { Modal, Button, Input, Select, Textarea } from '@/shared/components/ui'
import { usePurchasesStore, calcTotals } from '../store'
import { useSuppliersStore } from '@/modules/suppliers/store'
import { useInventoryStore } from '@/modules/inventory/store'
import { useIngredientsStore } from '@/modules/ingredients/store'
import type { Supplier } from '@/modules/suppliers/types'
import { formatCurrency } from '@/shared/utils/currency'
import { today } from '@/shared/utils/id'
import type { Purchase, PurchaseItem } from '../types'
import type { InvoiceItem } from '@/shared/utils/claudeOCR'

interface FormItem {
  name: string
  quantity: number
  unit: string
  unitPrice: number
}

interface FormData {
  supplierId: string
  supplierName: string
  type: string
  number: string
  date: string
  items: FormItem[]
  taxRate: number
  notes: string
  status: string
}

const DOC_TYPES = [
  { value: 'factura_a', label: 'Factura A' },
  { value: 'factura_b', label: 'Factura B' },
  { value: 'ticket', label: 'Ticket' },
  { value: 'remito', label: 'Remito' },
  { value: 'recibo', label: 'Recibo' },
]

const TAX_RATES = [
  { value: '0', label: 'Sin IVA (0%)' },
  { value: '10.5', label: 'IVA 10.5%' },
  { value: '21', label: 'IVA 21%' },
]

const UNITS = ['kg', 'g', 'L', 'ml', 'unidad', 'docena', 'caja', 'bolsa', 'bandeja']

interface PurchaseFormProps {
  open: boolean
  onClose: () => void
  purchase?: Purchase | null
  prefilledData?: {
    supplierName?: string
    cuit?: string
    date?: string
    total?: number
    subtotal?: number
    taxRate?: number
    type?: string
    number?: string
    items?: InvoiceItem[]
  }
}

// ─── Inventory + price sync ───────────────────────────────────────────────────
function useInventorySync() {
  const { addMovement } = useInventoryStore()
  const { ingredients, updatePrice } = useIngredientsStore()

  function syncItems(
    items: PurchaseItem[],
    date: string,
    supplierName: string,
    supplierId?: string
  ): number {
    let synced = 0
    for (const item of items) {
      const ingredient = ingredients.find(
        (ing) => ing.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      )
      if (ingredient) {
        // Add inventory movement
        addMovement({
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          type: 'entrada',
          quantity: item.quantity,
          unit: ingredient.purchaseUnit,
          date,
          notes: `Compra: ${supplierName || 'proveedor'}`,
        })
        // Update ingredient price history if unit price changed
        if (item.unitPrice > 0 && item.unitPrice !== ingredient.currentCost) {
          updatePrice(ingredient.id, item.unitPrice, supplierId, supplierName)
        }
        synced++
      }
    }
    return synced
  }

  function getMatchedCount(items: FormItem[]): number {
    return items.filter((fi) =>
      fi.name.trim().length > 0 &&
      ingredients.some((ing) => ing.name.toLowerCase().trim() === fi.name.toLowerCase().trim())
    ).length
  }

  return { syncItems, getMatchedCount }
}

export function PurchaseForm({ open, onClose, purchase, prefilledData }: PurchaseFormProps) {
  const { addPurchase, updatePurchase } = usePurchasesStore()
  const { suppliers } = useSuppliersStore()
  const { syncItems, getMatchedCount } = useInventorySync()
  const [syncedCount, setSyncedCount] = useState<number | null>(null)

  // Map prefilledData.items (InvoiceItem[]) to FormItem[]
  const prefilledItems: FormItem[] = (prefilledData?.items ?? []).map((it) => ({
    name: it.name ?? '',
    quantity: Number(it.quantity) || 1,
    unit: it.unit || 'unidad',
    unitPrice: Number(it.unitPrice) || 0,
  }))

  const defaultValues: FormData = {
    supplierId: purchase?.supplierId ?? '',
    supplierName: purchase?.supplierName ?? prefilledData?.supplierName ?? '',
    type: purchase?.type ?? prefilledData?.type ?? 'factura_b',
    number: purchase?.number ?? prefilledData?.number ?? '',
    date: purchase?.date ?? prefilledData?.date ?? today(),
    items: purchase?.items.map(({ name, quantity, unit, unitPrice }) => ({ name, quantity, unit, unitPrice }))
      ?? (prefilledItems.length > 0 ? prefilledItems : [{ name: '', quantity: 1, unit: 'kg', unitPrice: 0 }]),
    taxRate: purchase?.taxRate ?? prefilledData?.taxRate ?? 21,
    notes: purchase?.notes ?? '',
    status: purchase?.status ?? 'confirmed',
  }

  const { register, control, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({ defaultValues })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = useWatch({ control, name: 'items' }) ?? []
  const watchedTaxRate = useWatch({ control, name: 'taxRate' }) ?? 21
  const watchedSupplierId = useWatch({ control, name: 'supplierId' }) ?? ''

  useEffect(() => {
    if (open) {
      reset(defaultValues)
      setSyncedCount(null)
    }
  }, [open])

  const subtotal = watchedItems.reduce((s, i) => s + (Number(i?.quantity) || 0) * (Number(i?.unitPrice) || 0), 0)
  const taxes = subtotal * (Number(watchedTaxRate) / 100)
  const total = subtotal + taxes
  const matchedToInventory = getMatchedCount(watchedItems)

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.businessName || s.tradeName }))

  function onSupplierSelect(id: string) {
    setValue('supplierId', id)
    const sup = suppliers.find((s) => s.id === id)
    if (sup) setValue('supplierName', sup.businessName || sup.tradeName)
  }

  function onSubmit(data: FormData) {
    const itemsWithTotals: PurchaseItem[] = data.items
      .filter((i) => i.name.trim())
      .map((item, i) => ({
        id: purchase?.items[i]?.id ?? crypto.randomUUID(),
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        total: Number(item.quantity) * Number(item.unitPrice),
      }))

    const { subtotal: sb, taxes: tx, total: tot } = calcTotals(itemsWithTotals, Number(data.taxRate))

    const payload = {
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      type: data.type as Purchase['type'],
      number: data.number,
      date: data.date,
      items: itemsWithTotals,
      subtotal: sb,
      taxRate: Number(data.taxRate),
      taxes: tx,
      total: tot,
      notes: data.notes,
      status: data.status as Purchase['status'],
    }

    if (purchase) {
      updatePurchase(purchase.id, payload)
    } else {
      addPurchase(payload)
    }

    // Auto-sync to inventory + prices when confirmed
    if (data.status === 'confirmed') {
      const count = syncItems(itemsWithTotals, data.date, data.supplierName, data.supplierId || undefined)
      if (count > 0) {
        setSyncedCount(count)
        setTimeout(onClose, 1800)
        return
      }
    }

    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={purchase ? 'Editar Compra' : 'Nueva Compra'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="purchase-form">
            {purchase ? 'Guardar cambios' : 'Registrar compra'}
          </Button>
        </>
      }
    >
      {syncedCount !== null ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
            <Package size={28} className="text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Compra registrada
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            {syncedCount} ítem{syncedCount !== 1 ? 's' : ''} agregado{syncedCount !== 1 ? 's' : ''} al inventario automáticamente
          </p>
        </div>
      ) : (
        <form id="purchase-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Proveedor */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Proveedor</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {supplierOptions.length > 0 && (
                <Select
                  label="Seleccionar de la lista"
                  options={[{ value: '', label: 'Seleccionar proveedor...' }, ...supplierOptions]}
                  onChange={(e) => onSupplierSelect(e.target.value)}
                  value={watchedSupplierId}
                />
              )}
              <Input
                label="Nombre del proveedor"
                placeholder="Nombre o razón social"
                {...register('supplierName', { required: 'Requerido' })}
                error={errors.supplierName?.message}
              />
            </div>
          </div>

          {/* Comprobante */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Comprobante</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select label="Tipo" options={DOC_TYPES} {...register('type')} />
              <Input label="Número" placeholder="0001-00000001" {...register('number')} />
              <Input label="Fecha" type="date" {...register('date', { required: 'Requerida' })} error={errors.date?.message} />
              <Select label="IVA" options={TAX_RATES} {...register('taxRate')} />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Items ({fields.length})
                </h4>
                {matchedToInventory > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium">
                    {matchedToInventory} → inventario
                  </span>
                )}
              </div>
              <Button type="button" variant="ghost" size="sm" icon={<Plus size={13} />} onClick={() => append({ name: '', quantity: 1, unit: 'kg', unitPrice: 0 })}>
                Agregar
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input label={index === 0 ? 'Descripción' : undefined} placeholder="Nombre del producto" {...register(`items.${index}.name`, { required: true })} />
                  </div>
                  <div className="col-span-2">
                    <Input label={index === 0 ? 'Cant.' : undefined} type="number" step="0.01" min="0" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                  </div>
                  <div className="col-span-2">
                    <Select label={index === 0 ? 'Unidad' : undefined} options={UNITS.map((u) => ({ value: u, label: u }))} {...register(`items.${index}.unit`)} />
                  </div>
                  <div className="col-span-2">
                    <Input label={index === 0 ? 'Precio u.' : undefined} type="number" step="0.01" min="0" placeholder="0" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} />
                  </div>
                  <div className="col-span-1 flex justify-end pb-0.5">
                    <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Subtotal</span><span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>IVA ({watchedTaxRate}%)</span><span className="tabular-nums">{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100">
                <span>Total</span><span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Inventory hint */}
          {matchedToInventory > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
              <Package size={12} />
              <span>
                Al confirmar, <strong>{matchedToInventory} ítem{matchedToInventory !== 1 ? 's' : ''}</strong> se agregarán automáticamente al inventario.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Estado"
              options={[
                { value: 'draft', label: 'Borrador' },
                { value: 'pending', label: 'Pendiente' },
                { value: 'confirmed', label: 'Confirmado' },
              ]}
              {...register('status')}
            />
            <Textarea label="Notas (opcional)" placeholder="Observaciones..." rows={1} {...register('notes')} />
          </div>
        </form>
      )}
    </Modal>
  )
}
