
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserRole, 
  User, 
  Appointment, 
  AppointmentStatus, 
  ServiceType 
} from './types';
import { SERVICES, BUSINESS_HOURS } from './constants';
import { formatDate, isSunday, generateTimeSlots, getNextHour } from './utils/dateUtils';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User as UserIcon, 
  Scissors, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';

// Components
import Header from './components/Header';
import RoleSwitcher from './components/RoleSwitcher';
import ClientView from './components/ClientView';
import AdminView from './components/AdminView';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CLIENTE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load mock data or local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('unhas_flavi_appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
    
    const savedUser = localStorage.getItem('unhas_flavi_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    setIsLoaded(true);
  }, []);

  // Save appointments when updated
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('unhas_flavi_appointments', JSON.stringify(appointments));
    }
  }, [appointments, isLoaded]);

  const handleLogin = (name: string, phone: string) => {
    const newUser = { id: Math.random().toString(36).substr(2, 9), nome: name, telefone: phone };
    setCurrentUser(newUser);
    localStorage.setItem('unhas_flavi_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('unhas_flavi_user');
  };

  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  if (!isLoaded) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen pb-20">
      <Header role={role} onLogout={handleLogout} user={currentUser} />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <RoleSwitcher currentRole={role} onSwitch={setRole} />
        
        {role === UserRole.CLIENTE ? (
          <ClientView 
            user={currentUser} 
            onLogin={handleLogin}
            onLogout={handleLogout}
            appointments={appointments}
            onAddAppointment={addAppointment}
          />
        ) : (
          <AdminView 
            appointments={appointments}
            onCancel={cancelAppointment}
          />
        )}
      </main>

      {/* Floating Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center text-gray-500 text-xs md:text-sm shadow-lg z-50">
        <div className="flex flex-col items-center">
          <CalendarIcon size={20} className="mb-1 text-pink-500" />
          <span>Agenda</span>
        </div>
        <div className="flex flex-col items-center">
          <Clock size={20} className="mb-1 text-pink-500" />
          <span>07h - 19h</span>
        </div>
        <div className="flex flex-col items-center">
          <Scissors size={20} className="mb-1 text-pink-500" />
          <span>Manicure</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
