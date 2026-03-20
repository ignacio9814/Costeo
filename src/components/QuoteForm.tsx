import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, Minus, Calculator, BookOpen, PlusCircle, Upload, CheckCircle2, FileText } from 'lucide-react';
import { santinoItems, getDishCategoryName } from '../data/santinoCatalog';
import { findSuggestedDishPrices } from '../data/suggestedDishPrices';
import { santinoMenus, expandMenuToSelectedDishes } from '../data/santinoMenus';
import { PricingFactors, PricingResult, SelectedDish, calculatePricing, formatCurrency } from '../utils/pricingEngine';
import { importMenuFromFile } from '../utils/menuImport';

interface QuoteFormProps {
  selectedDishes: SelectedDish[];
  menuName: string;
  factors: PricingFactors;
  onSelectedDishesChange: (selectedDishes: SelectedDish[]) => void;
  onMenuNameChange: (menuName: string) => void;
  onFactorsChange: (factors: Partial<PricingFactors>) => void;
  onCalculate: (result: PricingResult) => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  selectedDishes,
  menuName,
  factors,
  onSelectedDishesChange,
  onMenuNameChange,
  onFactorsChange,
  onCalculate
}) => {
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [selectedMenuOptionName, setSelectedMenuOptionName] = useState<string>('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPriceText, setCustomItemPriceText] = useState<string>('');
  const [suggestedSearchText, setSuggestedSearchText] = useState('');
  const [importFeedback, setImportFeedback] = useState('');

  const selectedMenu = useMemo(() => {
    return santinoMenus.find(m => m.id === selectedMenuId) ?? null;
  }, [selectedMenuId]);

  const menuOptions = useMemo(() => {
    return selectedMenu?.options ?? [];
  }, [selectedMenu]);

  useEffect(() => {
    if (!selectedMenuId) {
      onMenuNameChange('');
      return;
    }

    const menu = santinoMenus.find(m => m.id === selectedMenuId) ?? null;
    if (!menu) {
      onMenuNameChange('');
      return;
    }

    if ((menu.options?.length ?? 0) > 0) {
      const fallbackOption = menu.options?.[0]?.name || '';
      const optionToUse = selectedMenuOptionName || fallbackOption;
      if (fallbackOption && !selectedMenuOptionName) setSelectedMenuOptionName(fallbackOption);
      const dishes = expandMenuToSelectedDishes(menu, optionToUse || undefined);
      onSelectedDishesChange(dishes);
      onMenuNameChange(`${menu.name} — ${optionToUse || fallbackOption}`.trim());
      return;
    }

    const dishes = expandMenuToSelectedDishes(menu, undefined);
    onSelectedDishesChange(dishes);
    onMenuNameChange(menu.name);
  }, [onMenuNameChange, onSelectedDishesChange, selectedMenuId, selectedMenuOptionName]);

  const handleCalculateClick = () => {
    try {
      const people = Number.isFinite(factors.people) ? factors.people : 10;
      const safePeople = Math.max(10, Math.min(1500, Math.round(people)));
      const inflation = Number.isFinite(factors.inflationRate) ? factors.inflationRate : 0;
      const safeInflation = Math.max(0, inflation);

      const safeDishes = selectedDishes.map(d => ({
        ...d,
        pricePerPerson: Number.isFinite(d.pricePerPerson) ? d.pricePerPerson : 0
      }));

      const result = calculatePricing(safeDishes, {
        ...factors,
        people: safePeople,
        inflationRate: safeInflation
      });
      onCalculate(result);
    } catch (e) {
      // Mensaje simple para uso en celular
      alert('Hubo un error al calcular. Revisá que haya platos seleccionados y que los precios estén completos.');
      // Log para debug
      // eslint-disable-next-line no-console
      console.error('Error al calcular presupuesto', e);
    }
  };

  const suggestedPriceItems = useMemo(() => {
    return findSuggestedDishPrices(suggestedSearchText);
  }, [suggestedSearchText]);

  const handleRemoveDish = (dishId: string) => {
    onSelectedDishesChange(selectedDishes.filter(d => d.id !== dishId));
  };

  const handleEditDishPrice = (dishId: string, pricePerPerson: number) => {
    onSelectedDishesChange(
      selectedDishes.map(d => (d.id === dishId ? { ...d, pricePerPerson } : d))
    );
  };

  const handleAddCustomItem = () => {
    const name = customItemName.trim();
    if (!name) return;
    const raw = customItemPriceText.trim();
    const parsed = raw === '' ? NaN : Number(raw);
    const price = Number.isFinite(parsed) ? parsed : 0;
    if (price <= 0) return;
    const id = `custom:${name}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9:]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    onSelectedDishesChange([
      ...selectedDishes,
      { id, name, pricePerPerson: price }
    ]);
    setCustomItemName('');
    setCustomItemPriceText('');
  };

  const handleQuickCustomItem = (name: string) => {
    setCustomItemName(name);
  };

  const handleUseSuggestedPrice = (name: string, price: number, unitLabel: string) => {
    const itemName = unitLabel === 'por kg' ? `${name} (${unitLabel})` : name;
    const id = `suggested:${itemName}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9:]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const existingItem = selectedDishes.find((dish) => dish.id === id);
    if (existingItem) {
      handleEditDishPrice(existingItem.id, price);
      return;
    }

    onSelectedDishesChange([
      ...selectedDishes,
      { id, name: itemName, pricePerPerson: price }
    ]);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importMenuFromFile(file, santinoItems);

      onSelectedDishesChange(result.importedItems);
      onMenuNameChange(result.suggestedMenuName);
      setSelectedMenuId('');
      setSelectedMenuOptionName('');

      const parts: string[] = [];
      if (result.recognizedCount > 0) parts.push(`${result.recognizedCount} plato(s) reconocidos`);
      if (result.unknownCount > 0) parts.push(`${result.unknownCount} item(s) para completar precio manual`);
      setImportFeedback(parts.join(' • ') || 'Archivo importado');
    } catch (error) {
      setImportFeedback('No se pudo leer el archivo. Usá TXT, CSV o JSON.');
      console.error('Error al importar menú', error);
    } finally {
      event.target.value = '';
    }
  };

  const basePricePerPerson = useMemo(() => {
    return selectedDishes.reduce((sum, d) => sum + (Number.isFinite(d.pricePerPerson) ? d.pricePerPerson : 0), 0);
  }, [selectedDishes]);

  const orderedSelectedDishes = useMemo(() => {
    const isAddedDish = (dish: SelectedDish) => dish.id.startsWith('custom:') || dish.id.startsWith('suggested:');

    const added = selectedDishes.filter(isAddedDish);
    const original = selectedDishes.filter((dish) => !isAddedDish(dish));

    return [...added, ...original];
  }, [selectedDishes]);

  return (
    <div className="space-y-6">
      <div className="card card-hover border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">1</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Elegí o subí un menú
              </h2>
              <p className="text-sm text-blue-800 mt-1">Este es el primer paso. Elegí un menú base o cargá uno desde un archivo para empezar rápido.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={selectedMenuId}
              onChange={(e) => {
                setSelectedMenuId(e.target.value);
                setSelectedMenuOptionName('');
              }}
              className="select-field text-base sm:col-span-2"
            >
              <option value="">Seleccionar menú...</option>
              {santinoMenus.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <label className="btn-secondary text-base py-3 flex items-center justify-center cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              Subir archivo
              <input
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-xs text-blue-700 bg-blue-100 border border-blue-200 rounded-lg px-3 py-2">Sección azul: define la base del presupuesto. Formatos admitidos: TXT, CSV y JSON.</div>

          {selectedMenu && (
            <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
              <div className="font-medium text-gray-900">{selectedMenu.name}</div>
              <div className="text-sm text-gray-600 mt-1">{selectedMenu.description}</div>

              {menuOptions.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm text-gray-700 mb-2">Elegí una opción</div>
                  <select
                    value={selectedMenuOptionName}
                    onChange={(e) => setSelectedMenuOptionName(e.target.value)}
                    className="select-field text-base"
                  >
                    <option value="">(Por defecto) {menuOptions[0]?.name}</option>
                    {menuOptions.map(o => (
                      <option key={o.name} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {menuName && (
                <div className="mt-3 text-sm text-green-700 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Seleccionado: <span className="font-semibold text-gray-900 ml-1">{menuName}</span>
                </div>
              )}
            </div>
          )}

          {importFeedback && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{importFeedback}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card card-hover border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">2</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Search className="w-5 h-5 mr-2 text-green-600" />
                Revisá y ajustá el menú
              </h2>
              <p className="text-sm text-green-800 mt-1">Sección verde: acá podés personalizar el menú, sumar platos y corregir precios fácilmente.</p>
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 shadow-sm text-sm font-bold">2A</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Agregar plato o estación personalizada</div>
                <div className="text-sm text-gray-600">Usá esta parte si necesitás sumar algo que no está en el menú base ni en la ficha técnica. Ej: Isla de Sushi, Estación de Asado, Barra de Tragos, Mesa de Quesos…</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Isla de Sushi', 'Estación de Asado', 'Pernil', 'Mesa de Quesos'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleQuickCustomItem(item)}
                  className="px-3 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 text-sm font-medium"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                placeholder="Nombre (ej: Isla de Sushi)"
                className="input-field text-base sm:col-span-2"
              />
              <input
                type="number"
                min={0}
                value={customItemPriceText}
                onChange={(e) => setCustomItemPriceText(e.target.value)}
                placeholder="Precio por persona (ARS)"
                className="input-field text-base"
              />
            </div>
            <button
              onClick={handleAddCustomItem}
              className="btn-success w-full mt-3 text-base py-3 flex items-center justify-center"
              disabled={!customItemName.trim() || !(Number(customItemPriceText) > 0)}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Agregar al menú
            </button>
            <div className="text-xs text-gray-500 mt-2">
              Escribí el precio por persona. Ej: 2500
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">2B. Referencia de precio sugerido</h3>
                <p className="text-sm text-amber-900 mt-1">Esta sección no agrega platos sola. Solo muestra valores orientativos para ayudarte a decidir un precio inicial.</p>
              </div>
            </div>

            <div className="bg-amber-100 border border-amber-300 rounded-lg px-3 py-3 text-sm text-amber-900 mb-3">
              Primero revisás la referencia. Recién cuando tocás <span className="font-semibold">Usar sugerido</span>, ese plato pasa al menú en edición.
            </div>

            <div className="relative">
              <input
                type="text"
                value={suggestedSearchText}
                onChange={(e) => setSuggestedSearchText(e.target.value)}
                placeholder="Ej: sfijas, asado árabe, pernil, sushi"
                className="input-field pr-10 text-base border-amber-200 focus:border-amber-400"
              />
              <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="mt-3 space-y-2">
              {suggestedPriceItems.map((item) => (
                <div key={item.id} className="border-2 border-amber-200 rounded-xl p-3 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <div className="font-semibold text-gray-900 break-words">{item.name}</div>
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold px-2.5 py-1 border border-amber-200">
                          Solo referencia
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      <div className="text-xs text-amber-700 mt-1 font-semibold">Sugerido: {formatCurrency(item.suggestedPrice)} {item.unitLabel}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUseSuggestedPrice(item.name, item.suggestedPrice, item.unitLabel)}
                      className="w-full sm:w-auto text-base py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
                    >
                      Usar sugerido
                    </button>
                  </div>
                </div>
              ))}

              {suggestedPriceItems.length === 0 && (
                <div className="text-sm text-gray-700 bg-white border border-amber-200 rounded-lg p-3">
                  No encontramos sugerencias para esa búsqueda todavía.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="min-w-0">
                <div className="text-sm text-green-700 font-medium">2C. Menú en edición</div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedDishes.length} plato(s)
                </div>
                <div className="text-sm text-gray-600 mt-1">Revisá acá los platos cargados desde el menú, archivo o agregados manualmente.</div>
              </div>
              <div className="sm:text-right">
                <div className="text-sm text-gray-500">Base por persona</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(basePricePerPerson)}
                </div>
              </div>
            </div>

            {selectedDishes.length === 0 ? (
              <div className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
                Todavía no hay platos cargados. Elegí un menú, subí un archivo o agregá platos manualmente.
              </div>
            ) : (
              <div className="space-y-3">
                {orderedSelectedDishes.map(dish => {
                  const isAddedDish = dish.id.startsWith('custom:') || dish.id.startsWith('suggested:');

                  return (
                  <div
                    key={dish.id}
                    className={`rounded-xl border p-3 shadow-sm ${
                      isAddedDish
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="min-w-0 mb-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="font-medium text-gray-900 text-base leading-tight break-words">{dish.name}</div>
                        {isAddedDish && (
                          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 border border-emerald-200">
                            Agregado al menú original
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{getDishCategoryName(dish.id.split(':')[0])}</div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <input
                        type="number"
                        min={0}
                        value={dish.pricePerPerson}
                        onChange={(e) => handleEditDishPrice(dish.id, Number(e.target.value) || 0)}
                        className="w-full sm:w-32 px-3 py-3 border border-gray-300 rounded-lg text-center text-base"
                        aria-label={`Precio por persona: ${dish.name}`}
                      />
                      <button
                        onClick={() => handleRemoveDish(dish.id)}
                        className="w-full sm:w-auto px-4 py-3 rounded-lg bg-red-100 hover:bg-red-200 transition-colors text-red-700 font-semibold"
                        aria-label={`Quitar ${dish.name}`}
                      >
                        <span className="flex items-center justify-center gap-1"><Minus className="w-4 h-4" />Eliminar</span>
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>

        </div>
      </div>

      <>
          <div className="card card-hover border-2 border-violet-100 bg-gradient-to-br from-violet-50 to-white">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">3</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-violet-600" />
                  Definí el evento y calculá
                </h3>
                <p className="text-sm text-violet-800 mt-1">Sección violeta: completá cantidad de personas, revisá inflación si hace falta y calculá el costo final.</p>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Cantidad de Personas</h4>
            <p className="text-sm text-gray-600 mb-4">Indicá cuántas personas asistirán para calcular correctamente el presupuesto.</p>
            <div className="space-y-3">
              <input
                type="range"
                min="10"
                max="1500"
                value={factors.people}
                onChange={(e) => onFactorsChange({ people: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  min="10"
                  max="1500"
                  value={factors.people}
                  onChange={(e) => onFactorsChange({ people: parseInt(e.target.value) || 10 })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <span className="text-sm text-gray-500">personas</span>
              </div>
            </div>
          </div>

          <div className="card card-hover border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajuste por Inflación
            </h3>
            <p className="text-sm text-amber-800 mb-4">Usá este ajuste para contemplar aumentos de precios si el evento es a futuro.</p>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={factors.inflationRate}
                onChange={(e) => onFactorsChange({ inflationRate: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={factors.inflationRate}
                  onChange={(e) => onFactorsChange({ inflationRate: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <span className="text-sm text-gray-500">% mensual</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculateClick}
            className="btn-primary w-full text-xl py-5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            disabled={selectedDishes.length === 0}
          >
            <Calculator className="w-5 h-5 mr-2" />
            Calcular costo del evento
          </button>
      </>
    </div>
  );
};
