export interface PricingFactors {
  people: number
  serviceLevel: 'basic' | 'standard' | 'premium'
  urgency: 'normal' | 'urgent' | 'veryUrgent'
  inflationRate: number
}

export interface SelectedDish {
  id: string
  name: string
  pricePerPerson: number
}

export interface PricingResult {
  basePrice: number
  pricePerPerson: number
  totalPrice: number
  rangeMin: number
  rangeMax: number
  confidence: 'high' | 'medium' | 'low'
  breakdown: {
    basePrice: number
    peopleFactor: number
    serviceFactor: number
    urgencyFactor: number
    inflationFactor: number
    scaleDiscount: number
  }
  explanation: string
}

export function calculatePricing(dishes: SelectedDish[], factors: PricingFactors): PricingResult {
  const peopleFactor = factors.people < 20 ? 1.2 : factors.people > 100 ? 0.9 : 1.0
  const serviceFactor = { basic: 0.8, standard: 1.0, premium: 1.5 }[factors.serviceLevel]
  const urgencyFactor = { normal: 1.0, urgent: 1.2, veryUrgent: 1.4 }[factors.urgency]
  const inflationFactor = 1 + factors.inflationRate / 100

  let scaleDiscount = 0
  if (factors.people > 200) scaleDiscount = 0.15
  else if (factors.people > 100) scaleDiscount = 0.10
  else if (factors.people > 50) scaleDiscount = 0.05

  const basePricePerPerson = dishes.reduce((s, d) => s + (Number.isFinite(d.pricePerPerson) ? d.pricePerPerson : 0), 0)
  const pricePerPerson = basePricePerPerson * peopleFactor * serviceFactor * urgencyFactor * inflationFactor
  const subtotal = pricePerPerson * factors.people
  const totalPrice = subtotal - subtotal * scaleDiscount

  const rangeMin = totalPrice * 0.85
  const rangeMax = totalPrice * 1.15

  let confidence: PricingResult['confidence'] = 'high'
  if (dishes.length === 0) confidence = 'low'
  else if (factors.urgency === 'veryUrgent' || factors.people > 300 || dishes.length > 18) confidence = 'medium'
  if (factors.people > 500 || dishes.length > 28) confidence = 'low'

  const parts: string[] = []
  if (dishes.length === 0) parts.push('Sin platos seleccionados')
  else parts.push(`${dishes.length} plato(s): $${basePricePerPerson.toLocaleString('es-AR')}/persona`)
  if (factors.people < 20) parts.push('Recargo evento pequeño (+20%)')
  else if (factors.people > 100) parts.push('Descuento volumen (-10%)')
  if (factors.serviceLevel === 'premium') parts.push('Servicio premium (+50%)')
  else if (factors.serviceLevel === 'basic') parts.push('Servicio básico (-20%)')
  if (factors.urgency === 'veryUrgent') parts.push('Urgencia máxima (+40%)')
  else if (factors.urgency === 'urgent') parts.push('Urgencia (+20%)')
  if (factors.inflationRate > 0) parts.push(`Inflación +${factors.inflationRate}%`)
  if (scaleDiscount > 0) parts.push(`Descuento escala -${scaleDiscount * 100}%`)

  return {
    basePrice: basePricePerPerson,
    pricePerPerson,
    totalPrice,
    rangeMin,
    rangeMax,
    confidence,
    breakdown: { basePrice: basePricePerPerson, peopleFactor, serviceFactor, urgencyFactor, inflationFactor, scaleDiscount },
    explanation: parts.join(' • '),
  }
}
