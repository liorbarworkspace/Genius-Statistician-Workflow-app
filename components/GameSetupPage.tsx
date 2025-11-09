import React, { useState, useMemo, useEffect } from 'react';
import { GameDetails } from '../types';

interface GameSetupPageProps {
  onSetupComplete: (details: GameDetails) => void;
  savedGames: GameDetails[];
  onBack: () => void;
  operatorEmail: string;
  setOperatorEmail: (email: string) => void;
}

const GameSetupPage: React.FC<GameSetupPageProps> = ({ onSetupComplete, savedGames, onBack, operatorEmail, setOperatorEmail }) => {
  const [details, setDetails] = useState<Omit<GameDetails, 'id'>>({
    operatorEmail: operatorEmail,
    homeTeam: '',
    awayTeam: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    league: 'לאומית',
    callerName: '',
    callerEmail: '',
    homeCoaches: '',
    awayCoaches: '',
  });
  const [otherLeague, setOtherLeague] = useState('');

  useEffect(() => {
    setDetails(prev => ({ ...prev, operatorEmail }));
  }, [operatorEmail]);

  const uniqueHomeTeams = useMemo(() => [...new Map(savedGames.map(item => [item.homeTeam, item])).values()], [savedGames]);
  const uniqueAwayTeams = useMemo(() => [...new Map(savedGames.map(item => [item.awayTeam, item])).values()], [savedGames]);
  const uniqueCallers = useMemo(() => [...new Map(savedGames.filter(g => g.callerName).map(item => [item.callerName, item])).values()], [savedGames]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const newDetails = { ...details };

    if (name === 'operatorEmail') {
        setOperatorEmail(value); // Update parent state directly for persistence
        return; // Let useEffect handle updating local state
    }

    (newDetails as any)[name] = value;

    if (name === 'homeTeam') {
        const matchedGame = savedGames.find(game => game.homeTeam === value);
        if (matchedGame) {
            newDetails.homeCoaches = matchedGame.homeCoaches;
        }
    }
     if (name === 'awayTeam') {
        const matchedGame = savedGames.find(game => game.awayTeam === value);
        if (matchedGame) {
            newDetails.awayCoaches = matchedGame.awayCoaches;
        }
    }
    if (name === 'callerName') {
        const matchedGame = savedGames.find(game => game.callerName === value);
        if (matchedGame) {
            newDetails.callerEmail = matchedGame.callerEmail;
        }
    }
    
    setDetails(newDetails);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.homeTeam || !details.awayTeam || !operatorEmail) {
        alert('אנא מלא את שדות החובה: אימייל, קבוצה מארחת וקבוצה אורחת.');
        return;
    }
    const finalLeague = details.league === 'אחר' ? otherLeague : details.league;
    onSetupComplete({ ...details, operatorEmail, league: finalLeague, id: new Date().toISOString() });
  };

  return (
     <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10" aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        </button>
        <header className="bg-blue-950 text-white p-6 text-center rounded-lg shadow-lg mb-8 relative">
            <h1 className="text-3xl sm:text-4xl font-bold">הגדרת משחק חדש</h1>
            <h2 className="text-lg sm:text-xl font-light mt-1 text-slate-300">מלא את הפרטים כדי להתחיל בצ'ק ליסט</h2>
        </header>
        <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="operatorEmail" className="block text-lg font-bold text-orange-400 mb-2">מייל עבודה שלך (Genius)<span className="text-red-500">*</span></label>
                    <input type="email" name="operatorEmail" value={operatorEmail} onChange={handleChange} placeholder="your.email@geniusports.com" required className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" dir="ltr" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="homeTeam" className="block text-lg font-bold text-orange-400 mb-2">קבוצה מארחת (באנגלית)<span className="text-red-500">*</span></label>
                        <input type="text" list="homeTeams" name="homeTeam" value={details.homeTeam} onChange={handleChange} placeholder="בחר או הקלד שם קבוצה..." required autoComplete="off" className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" dir="ltr"/>
                        <datalist id="homeTeams">
                            {uniqueHomeTeams.map(game => <option key={game.id} value={game.homeTeam} />)}
                        </datalist>
                    </div>
                    <div>
                        <label htmlFor="awayTeam" className="block text-lg font-bold text-orange-400 mb-2">קבוצה אורחת (באנגלית)<span className="text-red-500">*</span></label>
                        <input type="text" list="awayTeams" name="awayTeam" value={details.awayTeam} onChange={handleChange} placeholder="בחר או הקלד שם קבוצה..." required autoComplete="off" className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" dir="ltr"/>
                        <datalist id="awayTeams">
                            {uniqueAwayTeams.map(game => <option key={game.id} value={game.awayTeam} />)}
                        </datalist>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="date" className="block text-lg font-bold text-orange-400 mb-2">תאריך</label>
                        <input type="date" name="date" value={details.date} onChange={handleChange} className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" />
                    </div>
                     <div>
                        <label htmlFor="time" className="block text-lg font-bold text-orange-400 mb-2">שעת משחק</label>
                        <input type="time" name="time" value={details.time} onChange={handleChange} className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="league" className="block text-lg font-bold text-orange-400 mb-2">ליגה</label>
                    <div className="flex gap-4">
                        <select name="league" value={details.league} onChange={handleChange} className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors">
                            <option>לאומית</option>
                            <option>ליגת העל נשים</option>
                            <option>משחקי הכנה לאומית</option>
                            <option>משחקי הכנה נשים</option>
                            <option>אחר</option>
                        </select>
                        {details.league === 'אחר' && (
                             <input type="text" name="otherLeague" value={otherLeague} onChange={(e) => setOtherLeague(e.target.value)} placeholder="שם ליגה מותאם אישית" className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" />
                        )}
                    </div>
                </div>
                
                 <div className="pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-center mb-4">פרטים אופציונליים (ימולאו אוטומטית מבחירת הצעה)</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label htmlFor="callerName" className="block text-lg font-bold text-slate-300 mb-2">שם הקולר</label>
                           <input type="text" list="callers" name="callerName" value={details.callerName} onChange={handleChange} className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="בחר או הקלד שם קולר..."/>
                           <datalist id="callers">
                                {uniqueCallers.map(game => <option key={game.id} value={game.callerName} />)}
                           </datalist>
                        </div>
                         <div>
                           <label htmlFor="callerEmail" className="block text-lg font-bold text-slate-300 mb-2">מייל הקולר</label>
                           <input type="email" name="callerEmail" value={details.callerEmail} onChange={handleChange} className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" dir="ltr" />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="homeCoaches" className="block text-lg font-bold text-slate-300 mb-2">מאמני קבוצה מארחת (מופרד בפסיק)</label>
                            <input type="text" name="homeCoaches" value={details.homeCoaches} onChange={handleChange} className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="ימולא אוטומטית מבחירת קבוצה"/>
                        </div>
                        <div>
                            <label htmlFor="awayCoaches" className="block text-lg font-bold text-slate-300 mb-2">מאמני קבוצה אורחת (מופרד בפסיק)</label>
                            <input type="text" name="awayCoaches" value={details.awayCoaches} onChange={handleChange} className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="ימולא אוטומטית מבחירת קבוצה"/>
                        </div>
                    </div>
                 </div>

                <div className="pt-6 flex justify-center">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 text-xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105">
                        התחל צ'ק ליסט {'\u2190'}
                    </button>
                </div>
            </form>
        </div>
     </div>
  );
};

export default GameSetupPage;