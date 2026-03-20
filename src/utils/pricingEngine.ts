export interface PricingFactors {
  people: number;
  serviceLevel: 'basic' | 'standard' | 'premium';
  urgency: 'normal' | 'urgent' | 'veryUrgent';
  inflationRate: number;
}

export interface SelectedDish {
  id: string;
  name: string;
  pricePerPerson: number;
}

export interface PricingResult {
  basePrice: number;
  pricePerPerson: number;
  totalPrice: number;
  rangeMin: number;
  rangeMax: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown: {
    basePrice: number;
    peopleFactor: number;
    serviceFactor: number;
    urgencyFactor: number;
    inflationFactor: number;
    scaleDiscount: number;
  };
  explanation: string;
}

export const calculatePricing = (
  selectedDishes: SelectedDish[],
  factors: PricingFactors
): PricingResult => {
  // Factores de servicio
  const serviceMultipliers = {
    basic: 0.8,
    standard: 1.0,
    premium: 1.5
  };

  // Factores de urgencia
  const urgencyMultipliers = {
    normal: 1.0,
    urgent: 1.2,
    veryUrgent: 1.4
  };

  // Cálculo de factores
  const peopleFactor = factors.people < 20 ? 1.2 : factors.people > 100 ? 0.9 : 1.0;
  const serviceFactor = serviceMultipliers[factors.serviceLevel];
  const urgencyFactor = urgencyMultipliers[factors.urgency];
  const inflationFactor = 1 + (factors.inflationRate / 100);

  // Descuento por escala
  let scaleDiscount = 0;
  if (factors.people > 200) scaleDiscount = 0.15;
  else if (factors.people > 100) scaleDiscount = 0.10;
  else if (factors.people > 50) scaleDiscount = 0.05;

  // Base por persona: suma de platos seleccionados
  const basePricePerPerson = selectedDishes.reduce((sum, d) => sum + (Number.isFinite(d.pricePerPerson) ? d.pricePerPerson : 0), 0);

  // Precio por persona con todos los factores
  const adjustedBasePrice = basePricePerPerson * peopleFactor * serviceFactor * urgencyFactor * inflationFactor;
  const pricePerPerson = adjustedBasePrice;
  const subtotal = pricePerPerson * factors.people;
  const discountAmount = subtotal * scaleDiscount;
  const totalPrice = subtotal - discountAmount;

  // Rangos estimados
  const rangeMin = totalPrice * 0.85;
  const rangeMax = totalPrice * 1.15;

  // Nivel de confianza
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (selectedDishes.length === 0) confidence = 'low';
  else if (factors.urgency === 'veryUrgent' || factors.people > 300 || selectedDishes.length > 18) confidence = 'medium';
  if (factors.people > 500 || selectedDishes.length > 28) confidence = 'low';

  // Generación de explicación
  const explanation = generateExplanation(selectedDishes, factors, {
    adjustedBasePrice,
    pricePerPerson,
    totalPrice,
    scaleDiscount,
    basePricePerPerson
  });

  return {
    basePrice: basePricePerPerson,
    pricePerPerson,
    totalPrice,
    rangeMin,
    rangeMax,
    confidence,
    breakdown: {
      basePrice: basePricePerPerson,
      peopleFactor,
      serviceFactor,
      urgencyFactor,
      inflationFactor,
      scaleDiscount
    },
    explanation
  };
};

const generateExplanation = (
  selectedDishes: SelectedDish[],
  factors: PricingFactors,
  calculations: {
    basePricePerPerson: number;
    adjustedBasePrice?: number;
    pricePerPerson?: number;
    totalPrice?: number;
    scaleDiscount?: number;
  }
): string => {
  const parts: string[] = [];

  if (selectedDishes.length === 0) {
    parts.push('No hay platos seleccionados todavía');
  } else {
    parts.push(`${selectedDishes.length} plato(s) seleccionado(s): $${calculations.basePricePerPerson.toLocaleString('es-AR')} por persona`);
  }

  if (factors.people < 20) {
    parts.push('Recargo por evento pequeño (+20%)');
  } else if (factors.people > 100) {
    parts.push('Descuento por volumen (-10%)');
  }

  if (factors.serviceLevel === 'premium') {
    parts.push('Servicio premium (+50%)');
  } else if (factors.serviceLevel === 'basic') {
    parts.push('Servicio básico (-20%)');
  }

  if (factors.urgency === 'veryUrgent') {
    parts.push('Urgencia máxima (+40%)');
  } else if (factors.urgency === 'urgent') {
    parts.push('Urgencia (+20%)');
  }

  if (factors.inflationRate > 0) {
    parts.push(`Ajuste por inflación (+${factors.inflationRate}%)`);
  }

  return parts.join(' • ');
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getConfidenceColor = (confidence: 'high' | 'medium' | 'low'): string => {
  switch (confidence) {
    case 'high': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-red-600';
  }
};

export const getConfidenceText = (confidence: 'high' | 'medium' | 'low'): string => {
  switch (confidence) {
    case 'high': return 'Alta confianza';
    case 'medium': return 'Confianza media';
    case 'low': return 'Baja confianza';
  }
};
