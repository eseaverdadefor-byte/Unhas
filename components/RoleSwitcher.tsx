
import React from 'react';
import { UserRole } from '../types';
import { User as UserIcon, ShieldCheck } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onSwitch: (role: UserRole) => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onSwitch }) => {
  return (
    <div className="flex bg-gray-200 p-1 rounded-xl mb-6 shadow-inner">
      <button
        onClick={() => onSwitch(UserRole.CLIENTE)}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
          currentRole === UserRole.CLIENTE 
          ? 'bg-white shadow-md text-pink-600 font-semibold' 
          : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <UserIcon size={16} />
        <span>Área do Cliente</span>
      </button>
      <button
        onClick={() => onSwitch(UserRole.ADMIN)}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
          currentRole === UserRole.ADMIN 
          ? 'bg-white shadow-md text-pink-600 font-semibold' 
          : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <ShieldCheck size={16} />
        <span>Painel Admin</span>
      </button>
    </div>
  );
};

export default RoleSwitcher;
