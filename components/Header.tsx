
import React from 'react';
import { UserRole, User } from '../types';
import { LogOut, Scissors } from 'lucide-react';

interface HeaderProps {
  role: UserRole;
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, user, onLogout }) => {
  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="bg-pink-500 p-2 rounded-full">
          <Scissors className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 leading-none">Unhas de Flavi</h1>
          <p className="text-[10px] uppercase tracking-widest text-pink-500 font-bold">Studio de Beleza</p>
        </div>
      </div>
      
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user.nome}</p>
            <p className="text-xs text-gray-500">{role === UserRole.ADMIN ? 'Administrador' : 'Cliente'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Sair"
          >
            <LogOut size={18} className="text-gray-500" />
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
