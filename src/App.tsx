import React, { useCallback, useState } from 'react';
import { Header } from './components/Header';
import { QuoteForm } from './components/QuoteForm';
import { ResultsPanel } from './components/ResultsPanel';
import { PricingFactors, PricingResult, SelectedDish } from './utils/pricingEngine';

export interface QuoteState {
  selectedDishes: SelectedDish[];
  menuName: string;
  factors: PricingFactors;
  result: PricingResult | null;
}

const App: React.FC = () => {
  const [quoteState, setQuoteState] = useState<QuoteState>({
    selectedDishes: [],
    menuName: '',
    factors: {
      people: 50,
      serviceLevel: 'standard',
      urgency: 'normal',
      inflationRate: 8.5
    },
    result: null
  });

  const handleSelectedDishesChange = useCallback((selectedDishes: SelectedDish[]) => {
    setQuoteState(prev => ({
      ...prev,
      selectedDishes,
      result: null
    }));
  }, []);

  const handleMenuNameChange = useCallback((menuName: string) => {
    setQuoteState(prev => ({
      ...prev,
      menuName,
      result: null
    }));
  }, []);

  const handleFactorsChange = useCallback((factors: Partial<PricingFactors>) => {
    setQuoteState(prev => ({
      ...prev,
      factors: { ...prev.factors, ...factors },
      result: null
    }));
  }, []);

  const handleCalculate = useCallback((result: PricingResult) => {
    setQuoteState(prev => ({
      ...prev,
      result
    }));
  }, []);

  const handleNewQuote = useCallback(() => {
    setQuoteState({
      selectedDishes: [],
      menuName: '',
      factors: {
        people: 50,
        serviceLevel: 'standard',
        urgency: 'normal',
        inflationRate: 8.5
      },
      result: null
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <QuoteForm
            selectedDishes={quoteState.selectedDishes}
            menuName={quoteState.menuName}
            factors={quoteState.factors}
            onSelectedDishesChange={handleSelectedDishesChange}
            onMenuNameChange={handleMenuNameChange}
            onFactorsChange={handleFactorsChange}
            onCalculate={handleCalculate}
          />

          {quoteState.result ? (
            <ResultsPanel
              result={quoteState.result}
              selectedDishes={quoteState.selectedDishes}
              menuName={quoteState.menuName}
              factors={quoteState.factors}
              onNewQuote={handleNewQuote}
            />
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Resultados de cotización
                </h3>
                <p className="text-gray-500">
                  Completa los datos del formulario y presiona "Calcular" para ver el presupuesto estimado.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
