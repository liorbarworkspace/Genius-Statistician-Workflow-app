
import React from 'react';
import { LoginRecord } from '../types';

interface LoginHistoryPageProps {
  loginHistory: LoginRecord[];
  onBack: () => void;
}

const LoginHistoryPage: React.FC<LoginHistoryPageProps> = ({ loginHistory, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10" aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        </button>
        <header className="bg-gray-950 text-white p-6 text-center rounded-lg shadow-lg mb-8 relative">
            <h1 className="text-3xl sm:text-4xl font-bold">מעקב התחברויות</h1>
            <h2 className="text-lg sm:text-xl font-light mt-1 text-slate-300">היסטוריית הכניסות למערכת</h2>
        </header>
        <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8">
            {loginHistory.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-right">
                        <thead className="border-b border-slate-600">
                            <tr>
                                <th scope="col" className="text-sm font-medium text-slate-300 px-6 py-4">
                                    משתמש (מייל)
                                </th>
                                <th scope="col" className="text-sm font-medium text-slate-300 px-6 py-4">
                                    תאריך ושעת התחברות
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loginHistory.map((record, index) => (
                                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200 font-mono" dir="ltr">
                                        {record.email}
                                    </td>
                                    <td className="text-sm text-slate-300 font-light px-6 py-4 whitespace-nowrap">
                                        {record.timestamp?.toDate ? record.timestamp.toDate().toLocaleString('he-IL', {
                                            dateStyle: 'full',
                                            timeStyle: 'medium'
                                        }) : 'Invalid Date'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-xl text-slate-400">לא נמצאו רשומות התחברות.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default LoginHistoryPage;
