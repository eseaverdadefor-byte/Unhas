
export enum ServiceType {
  MAOS = 'MAOS',
  PES = 'PES',
  MAOS_E_PES = 'MAOS_E_PES'
}

export enum AppointmentStatus {
  DISPONIVEL = 'DISPONIVEL',
  RESERVADO = 'RESERVADO',
  OCUPADO = 'OCUPADO'
}

export enum UserRole {
  CLIENTE = 'CLIENTE',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  nome: string;
  telefone: string;
}

export interface Service {
  id: ServiceType;
  nome: string;
  duracaoHoras: number;
  preco: number;
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:00
  endTime: string; // HH:00
  serviceId: ServiceType;
  valorTotal: number;
  status: AppointmentStatus;
}

export interface TimeSlot {
  time: string;
  status: AppointmentStatus;
  appointment?: Appointment;
}
