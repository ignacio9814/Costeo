import { today } from './id'

const STORE_KEYS = [
  'kitchen-erp-purchases',
  'kitchen-erp-suppliers',
  'kitchen-erp-ingredients',
  'kitchen-erp-inventory',
  'kitchen-erp-recipes',
  'kitchen-erp-finance',
  'kitchen-erp-events',
  'kitchen-erp-presupuesto',
  'kitchen-erp-produccion',
  'kitchen-erp-ui',
]

export interface BackupData {
  version: string
  exportedAt: string
  appName: string
  stores: Record<string, unknown>
}

export function exportAllData(): void {
  const stores: Record<string, unknown> = {}
  for (const key of STORE_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      stores[key] = raw ? JSON.parse(raw) : null
    } catch {
      stores[key] = null
    }
  }

  const backup: BackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'Kitchen ERP',
    stores,
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kitchen-erp-backup-${today()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text()
    const data: BackupData = JSON.parse(text)

    if (!data.stores || !data.version) {
      return { success: false, message: 'El archivo no es un backup válido de Kitchen ERP.' }
    }

    let restored = 0
    for (const [key, value] of Object.entries(data.stores)) {
      if (STORE_KEYS.includes(key) && value !== null) {
        localStorage.setItem(key, JSON.stringify(value))
        restored++
      }
    }

    return { success: true, message: `${restored} módulos restaurados. La página se recargará.` }
  } catch {
    return { success: false, message: 'Error al leer el archivo. Asegurate de que sea un backup válido.' }
  }
}

export function getLastBackupInfo(): { date: string | null; size: string } {
  let total = 0
  for (const key of STORE_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw) total += raw.length
  }
  return {
    date: null, // could store this in localStorage too
    size: total > 1024 * 1024
      ? `${(total / 1024 / 1024).toFixed(1)} MB`
      : `${(total / 1024).toFixed(0)} KB`,
  }
}
