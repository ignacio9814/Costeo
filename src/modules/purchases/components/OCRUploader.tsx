import { useRef, useState } from 'react'
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react'
import { Modal, Button } from '@/shared/components/ui'

export interface ParsedDocument {
  supplierName: string
  cuit: string
  date: string
  total: number
  subtotal: number
  taxRate: number
  taxes: number
  type: string
  number: string
  items: { name: string; quantity: number; unit: string; unitPrice: number }[]
}

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (d: Partial<ParsedDocument>) => void
}

type State = 'idle' | 'analyzing' | 'done' | 'error'

export function OCRUploader({ open, onClose, onConfirm }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<{ base64: string; mediaType: string } | null>(null)
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<Partial<ParsedDocument> | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setPreview(null)
    setImageData(null)
    setState('idle')
    setResult(null)
    setErrorMsg('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type
      setImageData({ base64, mediaType })
      setState('idle')
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  async function analyze() {
    if (!imageData) return
    setState('analyzing')
    setErrorMsg('')
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData.base64, mediaType: imageData.mediaType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error del servidor')
      setResult(data)
      setState('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setState('error')
    }
  }

  function handleConfirm() {
    if (result) {
      onConfirm(result)
      handleClose()
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Escanear factura con IA" size="md"
      footer={
        state === 'done' ? (
          <>
            <Button variant="secondary" onClick={reset} icon={<RotateCcw size={13} />}>Nueva foto</Button>
            <Button onClick={handleConfirm} icon={<CheckCircle size={13} />}>Usar estos datos</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button onClick={analyze} disabled={!imageData || state === 'analyzing'}
              icon={state === 'analyzing' ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}>
              {state === 'analyzing' ? 'Analizando...' : 'Analizar factura'}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {/* Drop zone */}
        {!preview && (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all"
          >
            <Upload size={28} className="mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Arrastrá la foto o hacé clic</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — foto de celular funciona perfecto</p>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="relative">
            <img src={preview} alt="Factura" className="w-full max-h-64 object-contain rounded-xl border border-gray-200 dark:border-gray-700" />
            {state === 'idle' && (
              <button onClick={reset} className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow text-gray-500 hover:text-red-500">
                <X size={14} />
              </button>
            )}
            {state === 'analyzing' && (
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-xl">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Claude está leyendo la factura...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-red-700 dark:text-red-400">Error al analizar</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {state === 'done' && result && (
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={15} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Datos extraídos — revisá antes de confirmar</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <Field label="Proveedor" value={result.supplierName} />
              <Field label="CUIT" value={result.cuit} />
              <Field label="Tipo" value={result.type} />
              <Field label="Número" value={result.number} />
              <Field label="Fecha" value={result.date} />
              <Field label="IVA" value={result.taxRate != null ? `${result.taxRate}%` : undefined} />
              <Field label="Subtotal" value={result.subtotal != null ? `$${result.subtotal.toLocaleString('es-AR')}` : undefined} />
              <Field label="Total" value={result.total != null ? `$${result.total.toLocaleString('es-AR')}` : undefined} />
            </div>
            {result.items && result.items.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Ítems ({result.items.length})
                </p>
                <div className="space-y-1">
                  {result.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50 rounded px-2.5 py-1.5">
                      <span className="truncate flex-1">{item.name}</span>
                      <span className="ml-3 flex-shrink-0 text-gray-500">{item.quantity} {item.unit} × ${item.unitPrice.toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </Modal>
  )
}

function Field({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <span className="text-gray-400 dark:text-gray-500">{label}: </span>
      <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  )
}
