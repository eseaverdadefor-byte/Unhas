
import { ServiceType, Service } from './types';

export const BUSINESS_HOURS = {
  start: 7,
  end: 19,
};

export const SERVICES: Record<ServiceType, Service> = {
  [ServiceType.MAOS]: {
    id: ServiceType.MAOS,
    nome: 'MÃOS',
    duracaoHoras: 1,
    preco: 35.0,
  },
  [ServiceType.PES]: {
    id: ServiceType.PES,
    nome: 'PÉS',
    duracaoHoras: 1,
    preco: 35.0,
  },
  [ServiceType.MAOS_E_PES]: {
    id: ServiceType.MAOS_E_PES,
    nome: 'MÃOS + PÉS',
    duracaoHoras: 2,
    preco: 60.0, // Special discount price
  },
};

export const COLORS = {
  primary: '#ec4899', // Pink 500
  secondary: '#fbcfe8', // Pink 200
  accent: '#db2777', // Pink 600
  bg: '#fff5f7',
};
