
import React, { useState } from 'react';
import { GameDetails, PreGameTasks, PostGameTasks } from '../types';
import { PRE_GAME_TASK_LABELS, INITIAL_PRE_GAME_TASKS, POST_GAME_TASK_LABELS, INITIAL_POST_GAME_TASKS } from '../constants';

interface GameHistoryPageProps {
  savedGames: GameDetails[];
  onBack: () => void;
  onClearHistory: () => void;
  onUpdateGame: (game: GameDetails) => void;
}

const EditableChecklist: React.FC<{
    game: GameDetails;
    onSave: (updatedGame: GameDetails) => void;
    onCancel: () => void;
}> = ({ game, onSave, onCancel }) => {
    const [preGameTasks, setPreGameTasks] = useState<PreGameTasks>(game.preGameTasks || INITIAL_PRE_GAME_TASKS);
    const [postGameTasks, setPostGameTasks] = useState<PostGameTasks | undefined>(game.postGameTasks);
    
    const handlePreGameToggle = (taskId: keyof PreGameTasks) => {
        setPreGameTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const handlePostGameToggle = (taskId: keyof PostGameTasks) => {
        setPostGameTasks(prev => ({ ...(prev || INITIAL_POST_GAME_TASKS), [taskId]: !(prev?.[taskId]) }));
    };
    
    const handleSaveChanges = () => {
        onSave({ ...game, preGameTasks, postGameTasks });
    };

    return (
        <div className="bg-slate-800/50 p-4 mt-4 rounded-md space-y-4">
            <div>
                <h4 className="text-lg font-bold text-orange-400 mb-2">צ'ק ליסט לפני משחק</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {(Object.keys(PRE_GAME_TASK_LABELS) as Array<keyof PreGameTasks>).map(taskId => (
                        <label key={taskId} className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={preGameTasks[taskId]}
                                onChange={() => handlePreGameToggle(taskId)}
                                className="w-5 h-5 rounded bg-slate-700 border-slate-500 text-green-500 focus:ring-green-500"
                            />
                            <span className="ml-3 text-slate-300">{PRE_GAME_TASK_LABELS[taskId]}</span>
                        </label>
                    ))}
                </div>
            </div>
            {postGameTasks && (
                 <div>
                    <h4 className="text-lg font-bold text-orange-400 mb-2 mt-4">צ'ק ליסט אחרי משחק</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {(Object.keys(POST_GAME_TASK_LABELS) as Array<keyof PostGameTasks>).map(taskId => (
                            <label key={taskId} className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postGameTasks[taskId]}
                                    onChange={() => handlePostGameToggle(taskId)}
                                    className="w-5 h-5 rounded bg-slate-700 border-slate-500 text-green-500 focus:ring-green-500"
                                />
                                <span className="ml-3 text-slate-300">{POST_GAME_TASK_LABELS[taskId]}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-700">
                <button 
                    onClick={onCancel} 
                    className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    ביטול
                </button>
                <button 
                    onClick={handleSaveChanges}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    שמור שינויים
                </button>
            </div>
        </div>
    );
};


const GameHistoryPage: React.FC<GameHistoryPageProps> = ({ savedGames, onBack, onClearHistory, onUpdateGame }) => {
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  const handleExportCSV = () => {
    if (savedGames.length === 0) return;

    const headers = ["ID", "Operator Email", "Home Team", "Away Team", "Date", "Time", "League", "Caller Name", "Caller Email", "Home Coaches", "Away Coaches", "Pre-Game Complete", "Post-Game Complete"];
    
    const escapeCsvValue = (value: string = '') => {
        const stringValue = String(value);
        if (stringValue.includes(',')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const csvRows = [
        headers.join(','),
        ...savedGames.map(game => {
            const isPreGameComplete = game.preGameTasks && Object.values(game.preGameTasks).every(Boolean);
            const isPostGameComplete = game.postGameTasks && Object.values(game.postGameTasks).every(Boolean);
            return [
                game.id,
                game.operatorEmail,
                game.homeTeam,
                game.awayTeam,
                game.date,
                game.time,
                escapeCsvValue(game.league),
                escapeCsvValue(game.callerName),
                game.callerEmail,
                escapeCsvValue(game.homeCoaches),
                escapeCsvValue(game.awayCoaches),
                isPreGameComplete ? "Yes" : "No",
                game.postGameTasks ? (isPostGameComplete ? "Yes" : "No") : "N/A"
            ].join(',');
        })
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'genius_israel_game_history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10" aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        </button>
        <header className="bg-purple-950 text-white p-6 text-center rounded-lg shadow-lg mb-8 relative">
            <h1 className="text-3xl sm:text-4xl font-bold">מעקב משחקים</h1>
            <h2 className="text-lg sm:text-xl font-light mt-1 text-slate-300">היסטוריית המשחקים ששמרת</h2>
        </header>
        <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                 <button
                    onClick={onClearHistory}
                    disabled={savedGames.length === 0}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                    נקה היסטוריה
                </button>
                <button
                    onClick={handleExportCSV}
                    disabled={savedGames.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    ייצוא ל-CSV
                </button>
            </div>

            {savedGames.length > 0 ? (
                <div className="space-y-4">
                    {savedGames.map((game) => {
                        const isPreGameComplete = game.preGameTasks && Object.values(game.preGameTasks).every(Boolean);
                        const preGameTasksCount = game.preGameTasks ? Object.values(game.preGameTasks).filter(Boolean).length : 0;
                        const totalPreGameTasks = Object.keys(INITIAL_PRE_GAME_TASKS).length;

                        const isPostGameComplete = game.postGameTasks && Object.values(game.postGameTasks).every(Boolean);
                        const postGameTasksCount = game.postGameTasks ? Object.values(game.postGameTasks).filter(Boolean).length : 0;
                        const totalPostGameTasks = Object.keys(INITIAL_POST_GAME_TASKS).length;
                        
                        const isEditing = editingGameId === game.id;

                        return (
                        <div key={game.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <div className="flex flex-col sm:flex-row justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-orange-400">{game.homeTeam} vs {game.awayTeam}</h3>
                                    <p className="text-slate-400 mt-1 sm:mt-0">{new Date(`${game.date}T00:00:00`).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <button 
                                    onClick={() => setEditingGameId(isEditing ? null : game.id)}
                                    className={`mt-2 sm:mt-0 text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors ${isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isEditing ? 'סגור עריכה' : 'ערוך משימות'}
                                </button>
                            </div>
                            <div className="mt-3 text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <p><span className="font-semibold text-slate-500">שעה:</span> {game.time || 'לא צוין'}</p>
                                <p><span className="font-semibold text-slate-500">ליגה:</span> {game.league || 'לא צוין'}</p>
                                <p><span className="font-semibold text-slate-500">קולר:</span> {game.callerName || 'לא צוין'}</p>
                                <p><span className="font-semibold text-slate-500">מייל קולר:</span> <span dir="ltr" className="inline-block">{game.callerEmail || 'לא צוין'}</span></p>
                                <p><span className="font-semibold text-slate-500">מאמני בית:</span> {game.homeCoaches || 'לא צוין'}</p>
                                <p><span className="font-semibold text-slate-500">מאמני חוץ:</span> {game.awayCoaches || 'לא צוין'}</p>
                            </div>
                            <div className="mt-4 border-t border-slate-700 pt-3 space-y-2">
                                {game.preGameTasks ? (
                                    <p className={`font-bold ${isPreGameComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                                        סטטוס צ'ק ליסט לפני משחק: {isPreGameComplete ? 'הושלם' : `בתהליך (${preGameTasksCount}/${totalPreGameTasks})`}
                                    </p>
                                ) : (
                                    <p className="font-bold text-slate-500">סטטוס צ'ק ליסט לפני משחק: טרם החל</p>
                                )}
                                {game.postGameTasks ? (
                                    <p className={`font-bold ${isPostGameComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                                        סטטוס צ'ק ליסט סיום: {isPostGameComplete ? 'הושלם' : `בתהליך (${postGameTasksCount}/${totalPostGameTasks})`}
                                    </p>
                                ) : (
                                    <p className="font-bold text-slate-500">סטטוס צ'ק ליסט סיום: טרם החל</p>
                                )}
                            </div>
                            {isEditing && (
                                <EditableChecklist 
                                    game={game} 
                                    onSave={(updatedGame) => {
                                        onUpdateGame(updatedGame);
                                        setEditingGameId(null);
                                    }}
                                    onCancel={() => setEditingGameId(null)}
                                />
                            )}
                        </div>
                    )})}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-xl text-slate-400">לא נמצאו משחקים שמורים.</p>
                    <p className="mt-2 text-slate-500">השלם צ'ק ליסט לפני משחק ולחץ על "שמור משחק" כדי להוסיף אותו לכאן.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default GameHistoryPage;