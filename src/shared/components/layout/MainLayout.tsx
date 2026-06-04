import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAppStore } from '@/shared/stores/useAppStore'
import { cn } from '@/shared/utils/cn'

export default function MainLayout() {
  const { sidebarCollapsed } = useAppStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1117]">
      <Sidebar />
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          // Mobile: no margin (sidebar is overlay)
          'ml-0',
          // Desktop: margin based on sidebar width
          sidebarCollapsed ? 'lg:ml-[60px]' : 'lg:ml-60'
        )}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
