
import React from 'react';

interface WIPPageProps {
  onBack: () => void;
  roleName: string;
}

const WIPPage: React.FC<WIPPageProps> = ({ onBack, roleName }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      <div className="bg-slate-800 p-10 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-orange-500 mb-4">🚧 בעבודה 🚧</h1>
        <p className="text-xl text-slate-300">
          החלק של ה<span className="font-bold">{roleName}</span> נמצא בפיתוח ויעלה בקרוב.
        </p>
        <button
          onClick={onBack}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          חזרה
        </button>
      </div>
    </div>
  );
};

export default WIPPage;
