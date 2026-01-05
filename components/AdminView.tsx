
import React, { useState } from 'react';
import { Appointment, ServiceType } from '../types';
import { SERVICES, BUSINESS_HOURS } from '../constants';
import { formatDate, generateTimeSlots } from '../utils/dateUtils';
import { Calendar as CalendarIcon, Clock, Trash2, Phone, User as UserIcon, Scissors, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminViewProps {
  appointments: Appointment[];
  onCancel: (id: string) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ appointments, onCancel }) => {
  const [viewDate, setViewDate] = useState(formatDate(new Date()));
  
  const dailyAppointments = appointments.filter(app => app.date === viewDate);
  const timeSlots = generateTimeSlots(BUSINESS_HOURS.start, BUSINESS_HOURS.end);

  const stats = {
    total: dailyAppointments.length,
    revenue: dailyAppointments.reduce((acc, app) => acc + app.valorTotal, 0)
  };

  const changeDate = (days: number) => {
    const current = new Date(viewDate + 'T12:00:00');
    current.setDate(current.getDate() + days);
    setViewDate(formatDate(current));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      {/* Date Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-500">
          <ChevronLeft />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-gray-800">
            {viewDate.split('-').reverse().join('/')}
          </h2>
          <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">Agenda Diária</span>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-500">
          <ChevronRight />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Agendamentos</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg text-green-600">
            <span className="font-black text-xs">$</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Previsão</p>
            <p className="text-xl font-bold text-gray-800">R$ {stats.revenue.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>

      {/* Agenda List */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm">Cronograma</h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase">07:00 - 19:00</span>
        </div>
        
        <div className="divide-y">
          {timeSlots.map(time => {
            const app = dailyAppointments.find(a => a.startTime === time || (a.startTime < time && a.endTime > time));
            const isSlotStart = app && app.startTime === time;
            const isInsideApp = app && app.startTime < time && app.endTime > time;

            return (
              <div key={time} className={`p-4 flex gap-4 ${isInsideApp ? 'bg-pink-50/30' : ''}`}>
                <div className="w-12 text-sm font-bold text-gray-400 py-1">{time}</div>
                <div className="flex-1">
                  {isSlotStart ? (
                    <div className="bg-white border border-pink-100 rounded-xl p-3 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-black text-gray-800 flex items-center gap-1">
                            <UserIcon size={12} className="text-pink-500" /> {app.userName}
                          </p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-2">
                            <Phone size={10} /> {app.userPhone}
                          </p>
                          <div className="flex gap-2">
                            <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">
                              {SERVICES[app.serviceId].nome}
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                              R$ {app.valorTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => onCancel(app.id)}
                          className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : isInsideApp ? (
                    <div className="h-full border-l-2 border-pink-200 ml-1 pl-4 flex items-center italic text-xs text-gray-400">
                      Continuação: {app?.userName}
                    </div>
                  ) : (
                    <div className="h-full flex items-center italic text-xs text-gray-300">
                      Disponível
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
