import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Desktop sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  // Mobile sidebar
  mobileSidebarOpen: boolean
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  // DB connection
  dbConnected: boolean | null  // null = checking, true = ok, false = error
  dbError: string | null
  setDbStatus: (connected: boolean, error?: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      mobileSidebarOpen: false,
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      dbConnected: null,
      dbError: null,
      setDbStatus: (connected, error = null) => set({ dbConnected: connected, dbError: error ?? null }),
    }),
    {
      name: 'kitchen-erp-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
