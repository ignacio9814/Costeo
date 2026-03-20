export interface AppConfig {
  company: {
    name: string;
    location: string;
    contact: {
      phone: string;
      email: string;
      whatsapp: string;
    };
  };
  pricing: {
    defaultInflationRate: number;
    minPeople: number;
    maxPeople: number;
    defaultMargin: number;
  };
  ui: {
    currency: string;
    locale: string;
    timezone: string;
  };
}

export const defaultConfig: AppConfig = {
  company: {
    name: 'Santino Eventos',
    location: 'San Miguel de Tucumán',
    contact: {
      phone: '+54 9 381 123-4567',
      email: 'contacto@costeo.com',
      whatsapp: '+54 9 381 123-4567'
    }
  },
  pricing: {
    defaultInflationRate: 8.5, // % mensual
    minPeople: 10,
    maxPeople: 1500,
    defaultMargin: 0.30 // 30%
  },
  ui: {
    currency: 'ARS',
    locale: 'es-AR',
    timezone: 'America/Argentina/Tucuman'
  }
};

export const serviceLevels = [
  { id: 'basic', name: 'Básico', description: 'Servicio estándar con atención esencial' },
  { id: 'standard', name: 'Estándar', description: 'Servicio completo con personal capacitado' },
  { id: 'premium', name: 'Premium', description: 'Servicio de lujo con atención personalizada' }
];

export const urgencyLevels = [
  { id: 'normal', name: 'Normal', description: 'Más de 15 días', minDays: 15 },
  { id: 'urgent', name: 'Urgente', description: '7-14 días', minDays: 7, maxDays: 14 },
  { id: 'veryUrgent', name: 'Muy Urgente', description: 'Menos de 7 días', maxDays: 6 }
];
