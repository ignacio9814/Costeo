import { useRef, useState } from 'react'
import { Sun, Moon, Search, Menu, Download, Upload, HardDrive, X } from 'lucide-react'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useAppStore } from '@/shared/stores/useAppStore'
import { Input } from '@/shared/components/ui/Input'
import { exportAllData, importBackup, getLastBackupInfo } from '@/shared/utils/dataBackup'

function BackupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { size } = getLastBackupInfo()

  async function handleImport(file: File) {
    setImporting(true)
    setMessage(null)
    const result = await importBackup(file)
    setImporting(false)
    setMessage({ text: result.message, ok: result.success })
    if (result.success) setTimeout(() => window.location.reload(), 1500)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#1A1D2E] rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Copia de Seguridad</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={15} /></button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
            <div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Guardado automático activo</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">{size} en uso</div>
            </div>
          </div>
          <button onClick={() => { exportAllData(); onClose() }} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group text-left">
            <Download size={16} className="text-indigo-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">Exportar copia completa</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">Descarga JSON con todos tus datos</div>
            </div>
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={importing} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all group text-left disabled:opacity-50">
            <Upload size={16} className="text-amber-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">{importing ? 'Importando...' : 'Restaurar desde backup'}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">Seleccioná el archivo JSON</div>
            </div>
          </button>
          {message && (
            <div className={`p-3 rounded-lg text-xs ${message.ok ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
              {message.text}
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f) }} />
      </div>
    </div>
  )
}

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { openMobileSidebar } = useAppStore()
  const [backupOpen, setBackupOpen] = useState(false)

  return (
    <>
      <header className="h-14 flex items-center gap-3 px-4 lg:px-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111827] sticky top-0 z-10">
        <button
          onClick={openMobileSidebar}
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu size={18} />
        </button>
        <div className="flex-1 max-w-xs">
          <Input placeholder="Buscar..." icon={<Search size={13} />} className="h-8" />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setBackupOpen(true)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Copia de seguridad"
          >
            <HardDrive size={16} />
          </button>
        </div>
      </header>
      <BackupModal open={backupOpen} onClose={() => setBackupOpen(false)} />
    </>
  )
}
