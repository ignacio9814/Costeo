import { useEffect, useState } from 'react'
import { ThemeProvider } from './providers/ThemeProvider'
import { AppRouter } from './Router'
import { SetupScreen } from '@/shared/components/SetupScreen'
import { getSupabase } from '@/shared/services/supabase'
import { useAppStore } from '@/shared/stores/useAppStore'
import { usePurchasesStore } from '@/modules/purchases/store'
import { useSuppliersStore } from '@/modules/suppliers/store'
import { useIngredientsStore } from '@/modules/ingredients/store'
import { useInventoryStore } from '@/modules/inventory/store'
import { useRecipesStore } from '@/modules/recipes/store'
import { useFinanceStore } from '@/modules/finance/store'
import { useEventsStore } from '@/modules/events/store'
import { usePresupuestoStore } from '@/modules/presupuesto/store'
import { useProduccionStore } from '@/modules/produccion/store'

function DataLoader() {
  const setDbStatus = useAppStore((s) => s.setDbStatus)
  const loadPurchases = usePurchasesStore((s) => s.load)
  const loadSuppliers = useSuppliersStore((s) => s.load)
  const loadIngredients = useIngredientsStore((s) => s.load)
  const loadInventory = useInventoryStore((s) => s.load)
  const loadRecipes = useRecipesStore((s) => s.load)
  const loadFinance = useFinanceStore((s) => s.load)
  const loadEvents = useEventsStore((s) => s.load)
  const loadPresupuesto = usePresupuestoStore((s) => s.load)
  const loadProduccion = useProduccionStore((s) => s.load)

  useEffect(() => {
    async function init() {
      try {
        const sb = getSupabase()
        const { error } = await sb.from('suppliers').select('id').limit(1)
        if (error && !['42P01', 'PGRST116'].includes(error.code ?? '')) {
          setDbStatus(false, error.message)
          return
        }
        setDbStatus(true)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No se pudo conectar'
        setDbStatus(false, msg)
        return
      }

      void Promise.all([
        loadPurchases(),
        loadSuppliers(),
        loadIngredients(),
        loadInventory(),
        loadRecipes(),
        loadFinance(),
        loadEvents(),
        loadPresupuesto(),
        loadProduccion(),
      ])
    }
    void init()
  }, [])

  return null
}

export default function App() {
  const [showSetup, setShowSetup] = useState(false)

  return (
    <ThemeProvider>
      {showSetup ? (
        <SetupScreen onComplete={() => setShowSetup(false)} />
      ) : (
        <>
          <DataLoader />
          <AppRouter />
        </>
      )}
    </ThemeProvider>
  )
}
