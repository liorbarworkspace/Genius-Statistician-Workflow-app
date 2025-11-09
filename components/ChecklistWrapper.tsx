import React from 'react';

interface ChecklistWrapperProps {
  onBack: () => void;
  onHome: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ChecklistWrapper: React.FC<ChecklistWrapperProps> = ({ onBack, onHome, title, subtitle, children }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10" aria-label="Back">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      <button onClick={onHome} className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors z-10" aria-label="Home">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      </button>
      <header className="bg-blue-950 text-white p-6 text-center rounded-lg shadow-lg mb-8 relative">
        <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
        <h2 className="text-lg sm:text-xl font-light mt-1 text-slate-300">{subtitle}</h2>
      </header>
      <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
};

export default ChecklistWrapper;