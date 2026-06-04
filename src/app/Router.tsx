import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/shared/components/layout/MainLayout'

const Dashboard = lazy(() => import('@/modules/dashboard'))
const Purchases = lazy(() => import('@/modules/purchases'))
const Suppliers = lazy(() => import('@/modules/suppliers'))
const Ingredients = lazy(() => import('@/modules/ingredients'))
const Inventory = lazy(() => import('@/modules/inventory'))
const Recipes = lazy(() => import('@/modules/recipes'))
const Presupuesto = lazy(() => import('@/modules/presupuesto'))
const Events = lazy(() => import('@/modules/events'))
const Produccion = lazy(() => import('@/modules/produccion'))
const Finance = lazy(() => import('@/modules/finance'))
const Analytics = lazy(() => import('@/modules/analytics'))
const Reports = lazy(() => import('@/modules/reports'))
const Alerts = lazy(() => import('@/modules/alerts'))
const Costing = lazy(() => import('@/modules/costing'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <span className="text-xs text-gray-400">Cargando...</span>
      </div>
    </div>
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/finanzas" replace />} />
        <Route path="/dashboard" element={<Lazy><Dashboard /></Lazy>} />
        <Route path="/compras" element={<Lazy><Purchases /></Lazy>} />
        <Route path="/proveedores" element={<Lazy><Suppliers /></Lazy>} />
        <Route path="/insumos" element={<Lazy><Ingredients /></Lazy>} />
        <Route path="/inventario" element={<Lazy><Inventory /></Lazy>} />
        <Route path="/recetas" element={<Lazy><Recipes /></Lazy>} />
        <Route path="/presupuesto" element={<Lazy><Presupuesto /></Lazy>} />
        <Route path="/eventos" element={<Lazy><Events /></Lazy>} />
        <Route path="/produccion" element={<Lazy><Produccion /></Lazy>} />
        <Route path="/finanzas" element={<Lazy><Finance /></Lazy>} />
        <Route path="/analitica" element={<Lazy><Analytics /></Lazy>} />
        <Route path="/reportes" element={<Lazy><Reports /></Lazy>} />
        <Route path="/alertas" element={<Lazy><Alerts /></Lazy>} />
        <Route path="/costeo" element={<Lazy><Costing /></Lazy>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
