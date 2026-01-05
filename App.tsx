
import React, { useState, useEffect } from 'react';
import { UserRole, User, Appointment } from './types';
import Header from './components/Header';
import RoleSwitcher from './components/RoleSwitcher';
import ClientView from './components/ClientView';
import AdminView from './components/AdminView';
import { Calendar as CalendarIcon, Clock, Scissors } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CLIENTE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedApps = localStorage.getItem('unhas_flavi_appointments');
      if (savedApps) setAppointments(JSON.parse(savedApps));
      
      const savedUser = localStorage.getItem('unhas_flavi_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (e) {
      console.error("Erro ao carregar dados locais", e);
    }
    setIsLoaded(true);
  }, []);

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
    if (window.confirm("Deseja realmente cancelar este agendamento?")) {
      setAppointments(prev => prev.filter(app => app.id !== id));
    }
  };

  if (!isLoaded) return (
    <div className="flex h-screen items-center justify-center bg-pink-50">
      <div className="animate-bounce text-pink-500 font-bold text-xl">Unhas de Flavi...</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 transition-colors duration-500">
      <Header role={role} onLogout={handleLogout} user={currentUser} />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <RoleSwitcher currentRole={role} onSwitch={setRole} />
        
        <div className="animate-fade-in">
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
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-4 flex justify-around items-center text-gray-400 text-xs md:text-sm shadow-2xl z-50">
        <div className="flex flex-col items-center group cursor-pointer">
          <CalendarIcon size={22} className="mb-1 text-pink-500 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Agenda</span>
        </div>
        <div className="flex flex-col items-center">
          <Clock size={22} className="mb-1 text-pink-400" />
          <span className="font-medium">07h - 19h</span>
        </div>
        <div className="flex flex-col items-center">
          <Scissors size={22} className="mb-1 text-pink-400" />
          <span className="font-medium">Serviços</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
