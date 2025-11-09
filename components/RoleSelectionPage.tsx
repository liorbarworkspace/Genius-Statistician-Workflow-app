
import React from 'react';
import { Role } from '../types';
import Logo from './Logo';

interface RoleSelectionPageProps {
  onSelectRole: (role: Role) => void;
}

const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectRole }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
        <Logo className="w-12 h-12 sm:w-16 sm:h-16" />
        <span>Genius Workflow Hub</span>
      </h1>
      <p className="text-lg sm:text-xl text-slate-400 mb-12">מדריך עבודה לסטטיסטיקאי Genius Sports</p>
      <div className="w-full max-w-sm space-y-6">
        <button
          onClick={() => onSelectRole(Role.Caller)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-2xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105"
        >
          קולרים
        </button>
        <button
          onClick={() => onSelectRole(Role.Operator)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-2xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105"
        >
          אופרייטורים
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionPage;