
import React, { useState, useMemo } from 'react';
import { User, Appointment, ServiceType, AppointmentStatus } from '../types';
import { SERVICES, BUSINESS_HOURS } from '../constants';
import { formatDate, isSunday, generateTimeSlots, getNextHour } from '../utils/dateUtils';
import { Calendar as CalendarIcon, Clock, ChevronRight, CheckCircle2, AlertCircle, Phone, User as UserIcon } from 'lucide-react';

interface ClientViewProps {
  user: User | null;
  onLogin: (name: string, phone: string) => void;
  onLogout: () => void;
  appointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
}

const ClientView: React.FC<ClientViewProps> = ({ user, onLogin, onLogout, appointments, onAddAppointment }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Time Slots Generation & Validation
  const timeSlots = generateTimeSlots(BUSINESS_HOURS.start, BUSINESS_HOURS.end);
  
  const getSlotStatus = (time: string, date: string) => {
    const isOccupied = appointments.some(app => 
      app.date === date && 
      (app.startTime === time || (app.serviceId === ServiceType.MAOS_E_PES && app.endTime === getNextHour(time)) || 
      (app.startTime < time && app.endTime > time))
    );
    return isOccupied ? AppointmentStatus.OCUPADO : AppointmentStatus.DISPONIVEL;
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

    // Final check
    if (service.duracaoHoras === 2 && !isNextSlotAvailable(selectedTime, selectedDate)) {
      setError('O serviço Mãos + Pés exige dois horários seguidos disponíveis.');
      return;
    }

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
    setSuccess(true);
    setStep(5);
  };

  // Login view
  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vinda!</h2>
        <p className="text-gray-500 mb-6">Para agendar seu horário, informe seus dados básicos.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); if(name && phone) onLogin(name, phone); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <UserIcon size={14} className="text-pink-400" /> Nome Completo
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-400 outline-none transition-all"
              placeholder="Ex: Maria Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Phone size={14} className="text-pink-400" /> WhatsApp
            </label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-400 outline-none transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md mt-4"
          >
            Acessar Agenda
          </button>
        </form>
      </div>
    );
  }

  // Step 1: Date Selection
  if (step === 1) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Escolha o Dia</h2>
          <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full">Passo 1 de 4</span>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50">
          <input 
            type="date" 
            min={formatDate(new Date())}
            value={selectedDate}
            onChange={(e) => {
              const val = e.target.value;
              if (isSunday(val)) {
                setError('Não atendemos aos domingos. Por favor, escolha outra data.');
              } else {
                setError('');
                setSelectedDate(val);
              }
            }}
            className="w-full p-4 text-lg border-0 focus:ring-0 outline-none cursor-pointer"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button 
          disabled={!selectedDate || !!error}
          onClick={() => setStep(2)}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          Próximo Passo <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // Step 2: Time Selection
  if (step === 2) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Horários Disponíveis</h2>
          <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full">Passo 2 de 4</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {timeSlots.map(time => {
            const status = getSlotStatus(time, selectedDate);
            const isSelected = selectedTime === time;
            
            return (
              <button
                key={time}
                disabled={status === AppointmentStatus.OCUPADO}
                onClick={() => setSelectedTime(time)}
                className={`py-4 px-2 rounded-xl border text-sm font-semibold transition-all ${
                  status === AppointmentStatus.OCUPADO
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : isSelected
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-105'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                }`}
              >
                {time}
                <div className="text-[10px] opacity-70 mt-1">
                  {status === AppointmentStatus.OCUPADO ? 'Ocupado' : 'Disponível'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 px-6 rounded-2xl"
          >
            Voltar
          </button>
          <button 
            disabled={!selectedTime}
            onClick={() => setStep(3)}
            className="flex-[2] bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            Próximo Passo <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Service Selection
  if (step === 3) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Escolha o Serviço</h2>
          <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full">Passo 3 de 4</span>
        </div>

        <div className="space-y-4">
          {Object.values(SERVICES).map(service => {
            const isSelected = selectedService === service.id;
            const needsTwoSlots = service.duracaoHoras === 2;
            const isPossible = needsTwoSlots ? isNextSlotAvailable(selectedTime, selectedDate) : true;

            return (
              <button
                key={service.id}
                disabled={!isPossible}
                onClick={() => { setSelectedService(service.id); setError(''); }}
                className={`w-full p-5 rounded-2xl border-2 flex justify-between items-center transition-all ${
                  !isPossible
                  ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-pink-50 border-pink-500 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-pink-200'
                }`}
              >
                <div className="text-left">
                  <p className={`font-bold ${isSelected ? 'text-pink-600' : 'text-gray-800'}`}>{service.nome}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={12} /> {service.duracaoHoras} hora{service.duracaoHoras > 1 ? 's' : ''}
                  </p>
                  {!isPossible && (
                    <p className="text-[10px] text-red-500 font-medium mt-1 uppercase tracking-tighter">Horário seguinte ocupado</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">R$ {service.preco.toFixed(2).replace('.', ',')}</p>
                  {service.id === ServiceType.MAOS_E_PES && (
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">DESCONTO</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setStep(2)}
            className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 px-6 rounded-2xl"
          >
            Voltar
          </button>
          <button 
            disabled={!selectedService}
            onClick={() => setStep(4)}
            className="flex-[2] bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            Revisar <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Summary & Confirm
  if (step === 4) {
    const service = selectedService ? SERVICES[selectedService] : null;
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Confirmar Agendamento</h2>
          <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full">Passo 4 de 4</span>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="bg-pink-500 p-4 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <CheckCircle2 size={18} /> Resumo do Serviço
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Cliente</span>
              <span className="font-bold text-gray-800">{user.nome}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Data</span>
              <span className="font-bold text-gray-800">{selectedDate.split('-').reverse().join('/')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Horário</span>
              <span className="font-bold text-gray-800">{selectedTime} - {service?.duracaoHoras === 2 ? getNextHour(getNextHour(selectedTime)) : getNextHour(selectedTime)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Serviço</span>
              <span className="font-bold text-pink-600">{service?.nome}</span>
            </div>
            <div className="flex justify-between py-4 mt-2">
              <span className="text-gray-800 font-bold text-lg">Total</span>
              <span className="text-2xl font-black text-pink-600">R$ {service?.preco.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setStep(3)}
            className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 px-6 rounded-2xl"
          >
            Corrigir
          </button>
          <button 
            onClick={handleBooking}
            className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all"
          >
            Confirmar e Agendar
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Success
  if (step === 5) {
    return (
      <div className="text-center py-10 space-y-6 animate-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500">
            <CheckCircle2 size={60} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-800">Agendado!</h2>
          <p className="text-gray-500 max-w-xs mx-auto">Tudo certo, {user.nome.split(' ')[0]}! Seu horário foi reservado com sucesso.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-sm mx-auto text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lembrete</p>
          <div className="flex gap-4 items-center">
            <div className="bg-pink-50 p-3 rounded-xl text-pink-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-800">{selectedTime} no dia {selectedDate.split('-').reverse().join('/')}</p>
              <p className="text-sm text-gray-500">Comparecer com 5min de antecedência.</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => { setStep(1); setSelectedTime(''); setSelectedService(null); setSuccess(false); }}
          className="w-full max-w-sm bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl"
        >
          Fazer novo agendamento
        </button>
      </div>
    );
  }

  return null;
};

export default ClientView;
