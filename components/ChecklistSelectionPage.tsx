import React from 'react';
import { Role } from '../types';

interface ChecklistSelectionPageProps {
  onSelectChecklist: (type: 'pre' | 'post') => void;
  onNavigateToHistory: () => void;
  onBack: () => void;
  onGoHome: () => void;
  role: Role;
}

const ChecklistSelectionPage: React.FC<ChecklistSelectionPageProps> = ({ onSelectChecklist, onNavigateToHistory, onBack, onGoHome, role }) => {
  const roleName = role === Role.Operator ? 'אופרייטור' : 'קולר';
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-10">
        תדריך {roleName}
      </h1>
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={() => onSelectChecklist('pre')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-8 text-2xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105"
        >
          צ'ק ליסט לפני משחק
        </button>
        <button
          onClick={() => onSelectChecklist('post')}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-8 text-2xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105"
        >
          צ'ק ליסט אחרי משחק
        </button>
         <button
          onClick={onNavigateToHistory}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-8 text-2xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105"
        >
          מעקב משחקים
        </button>
      </div>
       <div className="mt-12">
            <button onClick={onGoHome} className="text-slate-400 hover:text-white transition-colors font-semibold py-2 px-4 rounded-lg">
                החלף תפקיד
            </button>
        </div>
    </div>
  );
};

export default ChecklistSelectionPage;