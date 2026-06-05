import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Users, Package, Warehouse,
  ChefHat, CalendarDays, DollarSign, BarChart3, FileText,
  Bell, ChevronRight, PanelLeftClose, X, ClipboardList, CalendarCheck,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useAppStore } from '@/shared/stores/useAppStore'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  iconColor: string
}

const navGroups: NavItem[][] = [
  [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} />, iconColor: 'text-indigo-500' },
  ],
  [
    { path: '/compras', label: 'Compras', icon: <ShoppingCart size={17} />, iconColor: 'text-emerald-500' },
    { path: '/proveedores', label: 'Proveedores', icon: <Users size={17} />, iconColor: 'text-blue-500' },
    { path: '/insumos', label: 'Insumos', icon: <Package size={17} />, iconColor: 'text-amber-500' },
    { path: '/inventario', label: 'Inventario', icon: <Warehouse size={17} />, iconColor: 'text-orange-500' },
  ],
  [
    { path: '/recetas', label: 'Recetas', icon: <ChefHat size={17} />, iconColor: 'text-pink-500' },
    { path: '/presupuesto', label: 'Cotizaciones', icon: <ClipboardList size={17} />, iconColor: 'text-violet-500' },
    { path: '/eventos', label: 'Eventos', icon: <CalendarDays size={17} />, iconColor: 'text-purple-500' },
    { path: '/produccion', label: 'Producción', icon: <CalendarCheck size={17} />, iconColor: 'text-cyan-500' },
  ],
  [
    { path: '/finanzas', label: 'Finanzas', icon: <DollarSign size={17} />, iconColor: 'text-teal-500' },
    { path: '/analitica', label: 'Analítica', icon: <BarChart3 size={17} />, iconColor: 'text-purple-500' },
    { path: '/reportes', label: 'Reportes', icon: <FileText size={17} />, iconColor: 'text-slate-500' },
  ],
  [
    { path: '/alertas', label: 'Alertas', icon: <Bell size={17} />, iconColor: 'text-red-500' },
  ],
]

function NavGroup({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-lg text-sm font-medium transition-all duration-150',
              'text-gray-600 dark:text-gray-400',
              'hover:bg-gray-50 dark:hover:bg-gray-800/60',
              'hover:text-gray-900 dark:hover:text-gray-100',
              collapsed ? 'justify-center h-9 w-9 mx-auto' : 'gap-3 px-2.5 py-2',
              isActive &&
                'bg-indigo-50 dark:bg-indigo-500/10 !text-indigo-700 dark:!text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
            )
          }
        >
          <span className={cn('flex-shrink-0', item.iconColor)}>{item.icon}</span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useAppStore()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-30 flex flex-col',
          'bg-white dark:bg-[#111827]',
          'border-r border-gray-100 dark:border-gray-800',
          'transition-all duration-300 ease-in-out',
          'w-60 -translate-x-full',
          mobileSidebarOpen && 'translate-x-0',
          'lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-60'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-3.5 border-b border-gray-100 dark:border-gray-800 gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <ChefHat size={14} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">Sistema Cofradía</div>
              <div className="text-[10px] text-gray-400 truncate">Gestión Gastronómica</div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex p-1.5 rounded-lg text-gray-400 transition-colors flex-shrink-0',
              'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300',
              sidebarCollapsed && 'mx-auto'
            )}
          >
            {sidebarCollapsed ? <ChevronRight size={15} /> : <PanelLeftClose size={15} />}
          </button>
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2" onClick={closeMobileSidebar}>
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="my-2 border-t border-gray-100 dark:border-gray-800/80" />}
              <NavGroup items={group} collapsed={sidebarCollapsed} />
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                SE
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">Santino Eventos</div>
                <div className="text-[10px] text-gray-400 truncate">Administrador</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
