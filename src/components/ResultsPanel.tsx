import React, { useMemo, useState } from 'react';
import { Copy, Save, RotateCcw, TrendingUp, TrendingDown, Info, FileSpreadsheet, Receipt } from 'lucide-react';
import { PricingFactors, PricingResult, SelectedDish, formatCurrency, getConfidenceColor, getConfidenceText } from '../utils/pricingEngine';

interface ResultsPanelProps {
  result: PricingResult;
  selectedDishes: SelectedDish[];
  menuName: string;
  factors: PricingFactors;
  onNewQuote: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  selectedDishes,
  menuName,
  factors,
  onNewQuote
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handlePrintReceipt = () => {
    const date = new Date();
    const dateText = date.toLocaleString('es-AR');
    const dishesRows = selectedDishes
      .map(d => {
        return `<tr>
          <td style="padding:8px 0; border-bottom:1px solid #e5e7eb;">${d.name}</td>
          <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; text-align:right; white-space:nowrap;">${formatCurrency(d.pricePerPerson)}</td>
        </tr>`;
      })
      .join('');

    const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Boleta - Santino Eventos</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 24px; color: #111827;">
    <div style="max-width: 720px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
        <div>
          <div style="font-size: 20px; font-weight: 700;">Santino Eventos</div>
          <div style="font-size: 12px; color:#6b7280; margin-top:4px;">Boleta / Recibo</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size: 12px; color:#6b7280;">Fecha</div>
          <div style="font-size: 14px; font-weight: 600;">${dateText}</div>
        </div>
      </div>

      <div style="margin-top: 18px; padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <div style="font-size: 12px; color:#6b7280;">Servicio</div>
        <div style="font-size: 16px; font-weight: 700; text-transform: capitalize;">${factors.serviceLevel}</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div>
            <div style="font-size: 12px; color:#6b7280;">Personas</div>
            <div style="font-size: 14px; font-weight: 600;">${factors.people}</div>
          </div>
          <div>
            <div style="font-size: 12px; color:#6b7280;">Urgencia</div>
            <div style="font-size: 14px; font-weight: 600; text-transform: capitalize;">${factors.urgency}</div>
          </div>
        </div>
        <div style="margin-top: 10px;">
          <div style="font-size: 12px; color:#6b7280;">Menú</div>
          <div style="font-size: 14px; font-weight: 600;">${menuName || 'Menú personalizado'}</div>
        </div>
      </div>

      <div style="margin-top: 18px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Detalle</div>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align:left; font-size: 12px; color:#6b7280; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Plato</th>
              <th style="text-align:right; font-size: 12px; color:#6b7280; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">$/persona</th>
            </tr>
          </thead>
          <tbody>
            ${dishesRows || '<tr><td colspan="2" style="padding:10px 0; color:#6b7280;">(sin platos)</td></tr>'}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 18px; padding-top: 12px; border-top: 2px solid #111827;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size: 14px; font-weight: 700;">TOTAL</div>
          <div style="font-size: 18px; font-weight: 800;">${formatCurrency(result.totalPrice)}</div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top: 6px;">
          <div style="font-size: 12px; color:#6b7280;">Precio por persona</div>
          <div style="font-size: 12px; color:#6b7280; font-weight: 600;">${formatCurrency(result.pricePerPerson)}</div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top: 6px;">
          <div style="font-size: 12px; color:#6b7280;">Rango estimado</div>
          <div style="font-size: 12px; color:#6b7280; font-weight: 600;">${formatCurrency(result.rangeMin)} - ${formatCurrency(result.rangeMax)}</div>
        </div>
      </div>

      <div style="margin-top: 18px; font-size: 11px; color:#6b7280; line-height: 1.4;">
        ${result.explanation}
      </div>

      <div style="margin-top: 16px; font-size: 11px; color:#9ca3af;">
        Generado por Costeo (demo)
      </div>
    </div>
  </body>
</html>`;

    const printDocument = (targetWindow: Window, onAfterPrint?: () => void) => {
      targetWindow.document.open();
      targetWindow.document.write(html);
      targetWindow.document.close();

      setTimeout(() => {
        targetWindow.focus();
        targetWindow.print();
        if (onAfterPrint) {
          setTimeout(onAfterPrint, 500);
        }
      }, 300);
    };

    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (popup) {
      printDocument(popup);
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
      iframe.remove();
      alert('No se pudo abrir la boleta. Revisá si el navegador está bloqueando la impresión.');
      return;
    }

    printDocument(iframeWindow, () => {
      iframe.remove();
    });
  };

  const csvContent = useMemo(() => {
    const rows: string[][] = [];

    const addRow = (...cols: string[]) => rows.push(cols);
    const esc = (v: string) => {
      const s = v ?? '';
      const needs = /[\n\r,"]/g.test(s);
      const out = s.replace(/"/g, '""');
      return needs ? `"${out}"` : out;
    };

    addRow('Empresa', 'Santino Eventos');
    addRow('Fecha', new Date().toLocaleString('es-AR'));
    addRow('');
    addRow('Personas', String(factors.people));
    addRow('Servicio', factors.serviceLevel);
    addRow('Urgencia', factors.urgency);
    addRow('Inflación (%)', String(factors.inflationRate));
    addRow('');
    addRow('Precio por persona', formatCurrency(result.pricePerPerson));
    addRow('Precio total', formatCurrency(result.totalPrice));
    addRow('Rango mínimo', formatCurrency(result.rangeMin));
    addRow('Rango máximo', formatCurrency(result.rangeMax));
    addRow('Confianza', result.confidence);
    addRow('Explicación', result.explanation);
    addRow('');
    addRow('DETALLE DE PLATOS');
    addRow('Plato', 'Precio por persona');
    for (const d of selectedDishes) {
      addRow(d.name, String(Math.round(d.pricePerPerson)));
    }

    return rows.map(r => r.map(esc).join(',')).join('\n');
  }, [factors, result, selectedDishes]);

  const handleExportCsv = () => {
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `presupuesto_santino_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyResult = () => {
    const dishesText = selectedDishes.length > 0
      ? selectedDishes.map(d => `- ${d.name} ($${Math.round(d.pricePerPerson).toLocaleString('es-AR')}/persona)`).join('\n')
      : '- (sin platos seleccionados)';

    const text = `COTIZACIÓN EVENTO GASTRONÓMICO\n\n` +
      `Menú (platos):\n${dishesText}\n\n` +
      `Personas: ${factors.people}\n` +
      `Servicio: ${factors.serviceLevel}\n` +
      `Urgencia: ${factors.urgency}\n\n` +
      `PRECIO TOTAL: ${formatCurrency(result.totalPrice)}\n` +
      `Precio por persona: ${formatCurrency(result.pricePerPerson)}\n` +
      `Rango estimado: ${formatCurrency(result.rangeMin)} - ${formatCurrency(result.rangeMax)}\n\n` +
      `${result.explanation}`;

    navigator.clipboard.writeText(text);
  };

  const handleSaveQuote = () => {
    const quoteData = {
      selectedDishes,
      factors,
      result,
      date: new Date().toISOString()
    };

    const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    quotes.push(quoteData);
    localStorage.setItem('quotes', JSON.stringify(quotes));
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta principal de resultados */}
      <div className="card card-hover bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
            Menú personalizado
          </div>
          
          <div className="space-y-2">
            <div className="text-4xl font-bold text-gradient">
              {formatCurrency(result.totalPrice)}
            </div>
            <div className="text-lg text-gray-600">
              {formatCurrency(result.pricePerPerson)} por persona
            </div>
          </div>

          {/* Rango estimado */}
          <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Rango estimado</span>
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="flex justify-center items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Mínimo</div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(result.rangeMin)}
                </div>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Máximo</div>
                <div className="font-semibold text-orange-600">
                  {formatCurrency(result.rangeMax)}
                </div>
              </div>
            </div>
          </div>

          {/* Confianza */}
          <div className={`flex items-center justify-center space-x-2 text-sm ${getConfidenceColor(result.confidence)}`}>
            <Info className="w-4 h-4" />
            <span>{getConfidenceText(result.confidence)}</span>
          </div>
        </div>
      </div>

      {/* Explicación del cálculo */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Detalle del cálculo
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {result.explanation}
        </p>
      </div>

      {/* Breakdown detallado */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Análisis de factores
          </h3>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showBreakdown ? 'Ocultar' : 'Mostrar'} detalles
          </button>
        </div>

        {showBreakdown && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Precio base</span>
              <span className="font-medium">{formatCurrency(result.breakdown.basePrice)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Factor cantidad</span>
              <span className="font-medium">
                {result.breakdown.peopleFactor === 1.2 ? '+20%' : 
                 result.breakdown.peopleFactor === 0.9 ? '-10%' : 'Sin cambio'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Factor servicio</span>
              <span className="font-medium">
                {result.breakdown.serviceFactor === 1.5 ? '+50%' : 
                 result.breakdown.serviceFactor === 0.8 ? '-20%' : 'Estándar'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Factor urgencia</span>
              <span className="font-medium">
                {result.breakdown.urgencyFactor === 1.4 ? '+40%' : 
                 result.breakdown.urgencyFactor === 1.2 ? '+20%' : 'Normal'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Inflación</span>
              <span className="font-medium">+{(result.breakdown.inflationFactor - 1) * 100}%</span>
            </div>
            
            {result.breakdown.scaleDiscount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Descuento escala</span>
                <span className="font-medium text-green-600">
                  -{result.breakdown.scaleDiscount * 100}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resumen del evento */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen del evento
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Platos seleccionados</span>
            <span className="font-medium">{selectedDishes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cantidad de personas</span>
            <span className="font-medium">{factors.people}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nivel de servicio</span>
            <span className="font-medium capitalize">{factors.serviceLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Urgencia</span>
            <span className="font-medium capitalize">{factors.urgency}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="space-y-3">
        <button
          onClick={handlePrintReceipt}
          className="btn-primary w-full flex items-center justify-center text-base py-3"
        >
          <Receipt className="w-4 h-4 mr-2" />
          Generar boleta
        </button>

        <button
          onClick={handleExportCsv}
          className="btn-success w-full flex items-center justify-center text-base py-3"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar a Excel
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyResult}
            className="btn-secondary flex items-center justify-center"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </button>
          <button
            onClick={handleSaveQuote}
            className="btn-secondary flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </button>
        </div>
        
        <button
          onClick={onNewQuote}
          className="btn-primary w-full flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Nuevo cálculo
        </button>
      </div>
    </div>
  );
};
