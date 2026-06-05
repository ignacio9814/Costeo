import { useState } from 'react'
import { ChefHat, Database, CheckCircle, ExternalLink, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { saveSupabaseConfig, resetSupabaseClient, isSupabaseConfigured } from '@/shared/services/supabase'

interface SetupScreenProps {
  onComplete: () => void
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<1 | 2 | 3>(1)

  async function handleConnect() {
    if (!url.trim() || !key.trim()) {
      setError('Completá los dos campos.')
      return
    }
    if (!url.startsWith('https://')) {
      setError('La URL debe empezar con https://')
      return
    }

    setTesting(true)
    setError('')

    try {
      // Save and test connection
      saveSupabaseConfig(url.trim(), key.trim())
      resetSupabaseClient()

      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(url.trim(), key.trim())

      // Test with a simple query — if table doesn't exist it returns 42P01 error which is fine
      // We just want to confirm we can reach Supabase
      const { error: connErr } = await client.from('suppliers').select('count').limit(1)

      if (connErr && connErr.code !== '42P01' && connErr.code !== 'PGRST116') {
        throw new Error(connErr.message)
      }

      setTesting(false)
      onComplete()
    } catch (err) {
      setTesting(false)
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('No se pudo conectar. Verificá que la URL sea correcta.')
      } else {
        setError(`Error: ${msg}`)
      }
      saveSupabaseConfig('', '') // clear invalid config
      resetSupabaseClient()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1117] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <ChefHat size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sistema Cofradía</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configuración inicial de base de datos</p>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-[#1A1D2E] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
          {/* Step indicator */}
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s as 1 | 2 | 3)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${step === s ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-gray-400 dark:text-gray-600'}`}
              >
                Paso {s}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                    <Database size={18} className="text-indigo-500" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Crear proyecto en Supabase</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Supabase es una base de datos gratuita en la nube. Tus datos van a estar seguros y accesibles desde cualquier dispositivo, sin importar si actualizás la app.
                </p>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400">
                  ✅ <strong>100% gratuito</strong> hasta 500MB de datos · No necesitás tarjeta de crédito
                </div>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex gap-2"><span className="font-bold text-indigo-500">1.</span> Entrá a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink size={10} /></a></li>
                  <li className="flex gap-2"><span className="font-bold text-indigo-500">2.</span> Creá una cuenta (gratis) con Google o email</li>
                  <li className="flex gap-2"><span className="font-bold text-indigo-500">3.</span> Clic en <strong>"New project"</strong> → dale un nombre cualquiera</li>
                  <li className="flex gap-2"><span className="font-bold text-indigo-500">4.</span> Esperá ~2 minutos mientras se crea</li>
                </ol>
                <button onClick={() => setStep(2)} className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors">
                  Ya creé el proyecto →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                    <Database size={18} className="text-amber-500" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Crear las tablas</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Hay que ejecutar un script SQL una sola vez para crear las tablas de la base de datos.
                </p>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex gap-2"><span className="font-bold text-indigo-500">1.</span> En Supabase: menú lateral → <strong>SQL Editor</strong> → <strong>New query</strong></li>
                  <li className="flex gap-2"><span className="font-bold text-indigo-500">2.</span> Abrí el archivo <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono text-xs">supabase-schema.sql</code> de tu proyecto</li>
                  <li className="flex gap-2"><span className="font-bold text-indigo-500">3.</span> Copiá todo su contenido y pegalo en el SQL Editor</li>
                  <li className="flex gap-2"><span className="font-bold text-indigo-500">4.</span> Clic en <strong>"Run"</strong> (▶)</li>
                </ol>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-500 dark:text-gray-400">
                  El archivo <code className="font-mono">supabase-schema.sql</code> está en la raíz de tu proyecto Kitchen ERP.
                </div>
                <button onClick={() => setStep(3)} className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors">
                  Las tablas están creadas →
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                    <CheckCircle size={18} className="text-emerald-500" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Conectar con la app</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Obtené las credenciales de tu proyecto: <strong>Settings → API</strong> en Supabase.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Project URL
                      <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-500 font-normal hover:underline inline-flex items-center gap-0.5">
                        Obtener <ExternalLink size={9} />
                      </a>
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://xxxxxxxxxxx.supabase.co"
                      className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-sm px-3 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Anon Key (public)
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-sm px-3 pr-10 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      />
                      <button onClick={() => setShowKey(!showKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleConnect}
                  disabled={testing || !url || !key}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {testing ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Verificando conexión...
                    </>
                  ) : (
                    '✓ Conectar y empezar'
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center">
                  Las credenciales se guardan en este dispositivo. Para Netlify/Vercel, configurá las variables de entorno <code className="font-mono">VITE_SUPABASE_URL</code> y <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
