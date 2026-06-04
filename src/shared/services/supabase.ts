import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Keys stored in localStorage so the user configures once and the app always works
// (even after clearing env vars or deploying updates)
const LS_URL = 'kitchen-erp-sb-url'
const LS_KEY = 'kitchen-erp-sb-key'

export function getSupabaseConfig(): { url: string; key: string } {
  // Priority: env vars (Netlify/Vercel deployment) → localStorage (user configured)
  const url =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
    localStorage.getItem(LS_URL) ??
    ''
  const key =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
    localStorage.getItem(LS_KEY) ??
    ''
  return { url, key }
}

export function saveSupabaseConfig(url: string, key: string): void {
  localStorage.setItem(LS_URL, url.trim())
  localStorage.setItem(LS_KEY, key.trim())
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig()
  return url.startsWith('https://') && key.length > 20
}

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const { url, key } = getSupabaseConfig()
  if (!url || !key) throw new Error('Supabase not configured')
  _client = createClient(url, key)
  return _client
}

export function resetSupabaseClient(): void {
  _client = null
}
