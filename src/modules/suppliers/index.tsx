import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Search, Phone, Mail, Hash } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button, Badge, Input, Textarea, Modal, EmptyState } from '@/shared/components/ui'
import { Card } from '@/shared/components/ui/Card'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { useSuppliersStore } from './store'
import { usePurchasesStore } from '@/modules/purchases/store'
import { formatCurrency } from '@/shared/utils/currency'
import { formatDate } from '@/shared/utils/date'
import type { Supplier } from './types'

type FormData = Omit<Supplier, 'id' | 'createdAt'>

function SupplierForm({
  open,
  onClose,
  supplier,
}: {
  open: boolean
  onClose: () => void
  supplier?: Supplier | null
}) {
  const { addSupplier, updateSupplier } = useSuppliersStore()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: supplier ?? { businessName: '', tradeName: '', cuit: '', phone: '', email: '', address: '', notes: '' },
  })

  function onSubmit(data: FormData) {
    if (supplier) updateSupplier(supplier.id, data)
    else addSupplier(data)
    onClose()
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="supplier-form">{supplier ? 'Guardar cambios' : 'Crear proveedor'}</Button>
        </>
      }
    >
      <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Razón Social"
            placeholder="Distribuidora Norte SRL"
            {...register('businessName', { required: 'Requerido' })}
            error={errors.businessName?.message}
          />
          <Input
            label="Nombre Comercial"
            placeholder="Norte"
            {...register('tradeName')}
          />
          <Input
            label="CUIT"
            placeholder="30-12345678-9"
            {...register('cuit')}
          />
          <Input
            label="Teléfono"
            placeholder="+54 9 381 000-0000"
            {...register('phone')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="contacto@proveedor.com"
            {...register('email')}
          />
          <Input
            label="Dirección"
            placeholder="Av. Principal 123"
            {...register('address')}
          />
        </div>
        <Textarea
          label="Notas"
          placeholder="Condiciones de pago, días de entrega, contacto preferido..."
          rows={2}
          {...register('notes')}
        />
      </form>
    </Modal>
  )
}

export default function Suppliers() {
  const { suppliers, deleteSupplier } = useSuppliersStore()
  const { purchases } = usePurchasesStore()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = suppliers.filter(
    (s) =>
      !search ||
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.tradeName.toLowerCase().includes(search.toLowerCase()) ||
      s.cuit.includes(search)
  )

  const selectedSupplier = suppliers.find((s) => s.id === selectedId)
  const supplierPurchases = purchases.filter((p) => p.supplierId === selectedId)
  const supplierTotal = supplierPurchases.reduce((s, p) => s + p.total, 0)

  function handleEdit(s: Supplier) {
    setEditing(s)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Proveedores"
        description={`${suppliers.length} proveedor${suppliers.length !== 1 ? 'es' : ''} registrado${suppliers.length !== 1 ? 's' : ''}`}
        actions={
          <Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>
            Nuevo proveedor
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <Input
            placeholder="Buscar por nombre o CUIT..."
            icon={<Search size={13} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Users size={26} />}
                title={search ? 'Sin resultados' : 'Sin proveedores'}
                description="Agregá tu primer proveedor para asociarlo a las compras."
                action={
                  <Button size="sm" icon={<Plus size={13} />} onClick={() => setFormOpen(true)}>
                    Nuevo proveedor
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((s) => {
                const sp = purchases.filter((p) => p.supplierId === s.id)
                const total = sp.reduce((t, p) => t + p.total, 0)
                return (
                  <Card
                    key={s.id}
                    padding="none"
                    className={`cursor-pointer transition-all ${selectedId === s.id ? 'ring-2 ring-indigo-500' : 'hover:border-gray-200 dark:hover:border-gray-700'}`}
                    onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(s.businessName || s.tradeName).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                          {s.businessName || s.tradeName}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {s.cuit && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Hash size={10} /> {s.cuit}
                            </span>
                          )}
                          {sp.length > 0 && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              {sp.length} compra{sp.length !== 1 ? 's' : ''} · {formatCurrency(total)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(s) }}
                          className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteId(s.id) }}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div>
          {selectedSupplier ? (
            <Card>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                    {selectedSupplier.businessName || selectedSupplier.tradeName}
                  </h3>
                  {selectedSupplier.tradeName && selectedSupplier.businessName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedSupplier.tradeName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  {selectedSupplier.cuit && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Hash size={12} className="text-gray-400" />
                      CUIT: <span className="font-mono">{selectedSupplier.cuit}</span>
                    </div>
                  )}
                  {selectedSupplier.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Phone size={12} className="text-gray-400" />
                      {selectedSupplier.phone}
                    </div>
                  )}
                  {selectedSupplier.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Mail size={12} className="text-gray-400" />
                      {selectedSupplier.email}
                    </div>
                  )}
                </div>

                {selectedSupplier.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                    {selectedSupplier.notes}
                  </p>
                )}

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Historial de compras
                    </span>
                    <Badge variant="indigo">{formatCurrency(supplierTotal)}</Badge>
                  </div>
                  {supplierPurchases.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Sin compras registradas</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {supplierPurchases.slice(0, 10).map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{formatDate(p.date)}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                            {formatCurrency(p.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <Users size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500">Seleccioná un proveedor para ver el detalle</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white dark:bg-[#1A1D2E] rounded-xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Eliminar proveedor</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={() => { deleteSupplier(deleteId); setDeleteId(null) }}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <SupplierForm open={formOpen} onClose={handleClose} supplier={editing} />
    </div>
  )
}
