import { useEffect, useState } from 'react'
import { ThemeProvider } from './providers/ThemeProvider'
import { AppRouter } from './Router'
import { SetupScreen } from '@/shared/components/SetupScreen'
import { isSupabaseConfigured } from '@/shared/services/supabase'
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
  }, [])

  return null
}

export default function App() {
  const [configured, setConfigured] = useState(isSupabaseConfigured())

  function handleSetupComplete() {
    setConfigured(true)
  }

  return (
    <ThemeProvider>
      {!configured ? (
        <SetupScreen onComplete={handleSetupComplete} />
      ) : (
        <>
          <DataLoader />
          <AppRouter />
        </>
      )}
    </ThemeProvider>
  )
}
