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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      mobileSidebarOpen: false,
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
    }),
    {
      name: 'kitchen-erp-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
