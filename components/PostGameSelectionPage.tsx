import React from 'react';
import { GameDetails } from '../types';

interface PostGameSelectionPageProps {
  savedGames: GameDetails[];
  onSelectGame: (game: GameDetails) => void;
  onBack: () => void;
}

const PostGameSelectionPage: React.FC<PostGameSelectionPageProps> = ({ savedGames, onSelectGame, onBack }) => {

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10" aria-label="Back">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      <header className="bg-red-950 text-white p-6 text-center rounded-lg shadow-lg mb-8 relative">
        <h1 className="text-3xl sm:text-4xl font-bold">בחירת משחק</h1>
        <h2 className="text-lg sm:text-xl font-light mt-1 text-slate-300">בחר את המשחק עבורו תמלא צ'ק ליסט סיום</h2>
      </header>
      <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8">
        {savedGames.length > 0 ? (
          <div className="space-y-4">
            {savedGames.map((game) => (
              <button
                key={game.id}
                onClick={() => onSelectGame(game)}
                className="w-full text-right bg-slate-900/50 hover:bg-slate-700/80 p-4 rounded-lg border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <h3 className="text-xl font-bold text-orange-400">{game.homeTeam} vs {game.awayTeam}</h3>
                  <p className="text-slate-400 mt-1 sm:mt-0">{new Date(`${game.date}T00:00:00`).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-slate-400">לא נמצאו משחקים שמורים.</p>
            <p className="mt-2 text-slate-500">עליך להשלים צ'ק ליסט לפני משחק ולשמור אותו תחילה.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostGameSelectionPage;
