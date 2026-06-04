import { useState } from 'react'
import { Database, X, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseClient,
} from '@/shared/services/supabase'
import { useAppStore } from '@/shared/stores/useAppStore'

interface Props {
  open: boolean
  onClose: () => void
}

export function ApiKeySettings({ open, onClose }: Props) {
  const { url: currentUrl } = getSupabaseConfig()
  const setDbStatus = useAppStore((s) => s.setDbStatus)

  const [url, setUrl] = useState(currentUrl)
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  if (!open) return null

  async function handleSave() {
    if (!url.trim() || !key.trim()) {
      setResult({ ok: false, msg: 'Completá los dos campos.' })
      return
    }
    if (!url.startsWith('https://')) {
      setResult({ ok: false, msg: 'La URL debe empezar con https://' })
      return
    }

    setTesting(true)
    setResult(null)

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(url.trim(), key.trim())
      const { error } = await client.from('suppliers').select('id').limit(1)

      if (error && !['42P01', 'PGRST116'].includes(error.code ?? '')) {
        throw new Error(error.message)
      }

      saveSupabaseConfig(url.trim(), key.trim())
      resetSupabaseClient()
      setDbStatus(true)
      setResult({ ok: true, msg: '¡Conexión exitosa! Recargando...' })
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const friendly = msg.includes('Failed to fetch') || msg.includes('NetworkError')
        ? 'No se pudo conectar. Verificá que la URL sea correcta.'
        : `Error: ${msg}`
      setResult({ ok: false, msg: friendly })
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#1A1D2E] rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reconectar base de datos</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Obtené las credenciales en tu proyecto de Supabase → <strong>Settings → API</strong>.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxx.supabase.co"
              className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-sm px-3 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Anon Key (public)</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-sm px-3 pr-10 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-xs ${result.ok ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
            {result.ok ? <CheckCircle size={13} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />}
            {result.msg}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={testing || !url || !key}
          className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {testing ? (
            <><RefreshCw size={14} className="animate-spin" /> Verificando...</>
          ) : (
            'Guardar y reconectar'
          )}
        </button>
      </div>
    </div>
  )
}
