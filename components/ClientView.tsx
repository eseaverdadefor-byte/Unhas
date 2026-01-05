
import React, { useState } from 'react';
import { User, Appointment, ServiceType, AppointmentStatus } from '../types';
import { SERVICES, BUSINESS_HOURS } from '../constants';
import { formatDate, isSunday, generateTimeSlots, getNextHour } from '../utils/dateUtils';
import { Clock, ChevronRight, CheckCircle2, AlertCircle, Phone, User as UserIcon, ChevronLeft } from 'lucide-react';

interface ClientViewProps {
  user: User | null;
  onLogin: (name: string, phone: string) => void;
  onLogout: () => void;
  appointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
}

const ClientView: React.FC<ClientViewProps> = ({ user, onLogin, appointments, onAddAppointment }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [error, setError] = useState('');

  const timeSlots = generateTimeSlots(BUSINESS_HOURS.start, BUSINESS_HOURS.end);
  
  const getSlotStatus = (time: string, date: string) => {
    return appointments.some(app => 
      app.date === date && 
      (app.startTime === time || 
       (app.serviceId === ServiceType.MAOS_E_PES && app.endTime > time && app.startTime <= time) ||
       (time >= app.startTime && time < app.endTime))
    ) ? AppointmentStatus.OCUPADO : AppointmentStatus.DISPONIVEL;
  };

  const isNextSlotAvailable = (time: string, date: string) => {
    const nextHour = getNextHour(time);
    if (parseInt(nextHour.split(':')[0]) >= BUSINESS_HOURS.end) return false;
    return getSlotStatus(nextHour, date) === AppointmentStatus.DISPONIVEL;
  };

  const handleBooking = () => {
    if (!user || !selectedService || !selectedTime || !selectedDate) return;
    const service = SERVICES[selectedService];
    const endTime = service.duracaoHoras === 2 ? getNextHour(getNextHour(selectedTime)) : getNextHour(selectedTime);

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.nome,
      userPhone: user.telefone,
      date: selectedDate,
      startTime: selectedTime,
      endTime: endTime,
      serviceId: selectedService,
      valorTotal: service.preco,
      status: AppointmentStatus.OCUPADO
    };

    onAddAppointment(newAppointment);
    setStep(5);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vinda!</h2>
        <p className="text-gray-500 mb-8">Agende seu momento de beleza em poucos segundos.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); if(name && phone) onLogin(name, phone); }} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <UserIcon size={16} className="text-pink-400" /> Nome Completo
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-pink-50/30 border border-gray-100 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
              placeholder="Como prefere ser chamada?"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <Phone size={16} className="text-pink-400" /> WhatsApp
            </label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-pink-50/30 border border-gray-100 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-pink-200 active:scale-[0.98]"
          >
            Ver Horários Disponíveis
          </button>
        </form>
      </div>
    );
  }

  // Passos do Agendamento
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        {step > 1 && step < 5 && (
          <button onClick={() => setStep(step - 1)} className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors">
            <ChevronLeft />
          </button>
        )}
        <div className="flex-1 text-center">
            {step < 5 && <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Passo {step} de 4</span>}
        </div>
      </div>

      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Qual dia você prefere?</h2>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50">
            <input 
              type="date" 
              min={formatDate(new Date())}
              value={selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                if (isSunday(val)) setError('Domingo é nosso dia de descanso 🌸 Escolha outro dia.');
                else { setError(''); setSelectedDate(val); }
              }}
              className="w-full text-center p-2 text-xl border-none focus:ring-0 outline-none cursor-pointer font-bold text-pink-600"
            />
          </div>
          {error && <p className="text-red-500 text-sm flex items-center gap-2 bg-red-50 p-4 rounded-2xl border border-red-100"><AlertCircle size={16}/> {error}</p>}
          <button disabled={!!error} onClick={() => setStep(2)} className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50">Continuar</button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Horários para {selectedDate.split('-').reverse().join('/')}</h2>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map(time => {
              const status = getSlotStatus(time, selectedDate);
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  disabled={status === AppointmentStatus.OCUPADO}
                  onClick={() => setSelectedTime(time)}
                  className={`py-4 rounded-2xl border-2 font-bold transition-all ${
                    status === AppointmentStatus.OCUPADO ? 'bg-gray-100 text-gray-300 border-gray-100' :
                    isSelected ? 'bg-pink-500 text-white border-pink-500 scale-105 shadow-pink-200 shadow-lg' :
                    'bg-white text-gray-700 border-pink-50 hover:border-pink-200'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          <button disabled={!selectedTime} onClick={() => setStep(3)} className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">Próximo Passo <ChevronRight size={18}/></button>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Escolha o serviço</h2>
          {Object.values(SERVICES).map(service => {
            const isSelected = selectedService === service.id;
            const canBook = service.duracaoHoras === 1 || isNextSlotAvailable(selectedTime, selectedDate);
            return (
              <button
                key={service.id}
                disabled={!canBook}
                onClick={() => setSelectedService(service.id)}
                className={`w-full p-6 rounded-3xl border-2 flex justify-between items-center transition-all ${
                  !canBook ? 'opacity-40 grayscale cursor-not-allowed border-gray-100' :
                  isSelected ? 'bg-pink-50 border-pink-500' : 'bg-white border-pink-50'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-lg text-gray-800">{service.nome}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Clock size={12}/> {service.duracaoHoras}h de duração</p>
                </div>
                <p className="text-xl font-black text-pink-600">R$ {service.preco.toFixed(2)}</p>
              </button>
            );
          })}
          <button disabled={!selectedService} onClick={() => setStep(4)} className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl mt-4">Revisar Agendamento</button>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Quase lá!</h2>
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
             <div className="flex justify-between border-b border-pink-50 pb-3">
               <span className="text-gray-400">Data</span>
               <span className="font-bold">{selectedDate.split('-').reverse().join('/')}</span>
             </div>
             <div className="flex justify-between border-b border-pink-50 pb-3">
               <span className="text-gray-400">Horário</span>
               <span className="font-bold">{selectedTime}</span>
             </div>
             <div className="flex justify-between border-b border-pink-50 pb-3">
               <span className="text-gray-400">Serviço</span>
               <span className="font-bold text-pink-600">{selectedService && SERVICES[selectedService].nome}</span>
             </div>
             <div className="flex justify-between pt-2">
               <span className="text-lg font-bold">Total</span>
               <span className="text-2xl font-black text-pink-500">R$ {selectedService && SERVICES[selectedService].preco.toFixed(2)}</span>
             </div>
          </div>
          <button onClick={handleBooking} className="w-full bg-pink-500 text-white font-bold py-5 rounded-3xl shadow-xl shadow-pink-100 text-lg">Confirmar Agora</button>
        </div>
      )}

      {step === 5 && (
        <div className="text-center py-12 space-y-6 animate-fade-in">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Agendado!</h2>
          <p className="text-gray-500">Seu horário foi reservado com sucesso. Flavi te espera com carinho! 🌸</p>
          <button onClick={() => setStep(1)} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold">Voltar ao início</button>
        </div>
      )}
    </div>
  );
};

export default ClientView;
