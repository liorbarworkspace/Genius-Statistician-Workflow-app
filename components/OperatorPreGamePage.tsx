
import React, { useState, useCallback, useEffect } from 'react';
import ChecklistWrapper from './ChecklistWrapper';
import { GameDetails } from '../types';
import { PRE_GAME_TASK_LABELS, INITIAL_PRE_GAME_TASKS } from '../constants';

interface OperatorPreGamePageProps {
  onBack: () => void;
  onHome: () => void;
  onSaveGame: (details: GameDetails) => void;
  onNavigateToPostGame: () => void;
  gameDetails: GameDetails;
}

type ParsedName = {
    firstName: string;
    lastName: string;
};

// FIX: Moved TaskItem outside the component and passed dependencies as props to fix type errors.
const TaskItem: React.FC<{ id: keyof typeof INITIAL_PRE_GAME_TASKS; children: React.ReactNode; isChecked: boolean; onToggle: (id: keyof typeof INITIAL_PRE_GAME_TASKS) => void; }> = ({ id, children, isChecked, onToggle }) => (
    <div
        className={`flex items-start sm:items-center space-x-4 space-x-reverse cursor-pointer p-2 rounded-md transition-colors hover:bg-slate-700/50 ${isChecked ? 'text-slate-500' : 'text-slate-200'}`}
        onClick={() => onToggle(id)}
    >
        <div className={`w-6 h-6 border-2 rounded-md flex-shrink-0 flex items-center justify-center mt-1 sm:mt-0 ${isChecked ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
            {isChecked && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className={`flex-grow ${isChecked ? 'line-through' : ''}`}>{children}</span>
    </div>
);

// FIX: Moved NameParserResult outside the component and passed dependencies as props to fix type errors.
const NameParserResult: React.FC<{ name: ParsedName; index: number; type: string; copied: string | null; onCopy: (text: string, id: string) => void; }> = ({ name, index, type, copied, onCopy }) => (
    <div className="bg-slate-900/50 p-3 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg">
       <div className="flex items-center justify-between">
           <span className="font-semibold text-slate-400 ml-2">שם פרטי:</span>
           <span className="font-mono text-white flex-grow text-right">{name.firstName}</span>
           <button onClick={() => onCopy(name.firstName, `${type}-fname-${index}`)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors mr-2">
                {copied === `${type}-fname-${index}` ? '✓' : 'העתק'}
           </button>
       </div>
       <div className="flex items-center justify-between">
           <span className="font-semibold text-slate-400 ml-2">שם משפחה:</span>
           <span className="font-mono text-white flex-grow text-right">{name.lastName}</span>
           <button onClick={() => onCopy(name.lastName, `${type}-lname-${index}`)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors mr-2">
                {copied === `${type}-lname-${index}` ? '✓' : 'העתק'}
           </button>
       </div>
   </div>
);


const OperatorPreGamePage: React.FC<OperatorPreGamePageProps> = ({ onBack, onHome, onSaveGame, onNavigateToPostGame, gameDetails }) => {
    const [tasks, setTasks] = useState(gameDetails.preGameTasks || INITIAL_PRE_GAME_TASKS);
    const [teamName, setTeamName] = useState(gameDetails.homeTeam);
    const [callerName, setCallerName] = useState(gameDetails.callerName);
    const [callerEmail, setCallerEmail] = useState(gameDetails.callerEmail);
    const [refereesRaw, setRefereesRaw] = useState('');
    const [parsedReferees, setParsedReferees] = useState<ParsedName[]>([]);
    const [supervisorRaw, setSupervisorRaw] = useState('');
    const [parsedSupervisor, setParsedSupervisor] = useState<ParsedName | null>(null);
    const [homeCoachesRaw, setHomeCoachesRaw] = useState(gameDetails.homeCoaches);
    const [awayCoachesRaw, setAwayCoachesRaw] = useState(gameDetails.awayCoaches);
    const [parsedHomeCoaches, setParsedHomeCoaches] = useState<ParsedName[]>([]);
    const [parsedAwayCoaches, setParsedAwayCoaches] = useState<ParsedName[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [showIncompleteTasksModal, setShowIncompleteTasksModal] = useState(false);
    const [incompleteTasksList, setIncompleteTasksList] = useState<string[]>([]);

    useEffect(() => {
        setTasks(gameDetails.preGameTasks || INITIAL_PRE_GAME_TASKS);
    }, [gameDetails]);

    const handleToggleTask = (taskId: keyof typeof INITIAL_PRE_GAME_TASKS) => {
        setTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const handleCopy = useCallback((text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(id);
            setTimeout(() => setCopied(null), 2000); // Reset after 2 seconds
        });
    }, []);
    
    const saveAndNotify = () => {
        const finalDetails: GameDetails = {
            ...gameDetails,
            homeTeam: teamName,
            awayTeam: gameDetails.awayTeam,
            callerName,
            callerEmail,
            homeCoaches: homeCoachesRaw,
            awayCoaches: awayCoachesRaw,
            preGameTasks: tasks, // Save pre-game tasks state
        };
        onSaveGame(finalDetails);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
    };

    const handleSaveGame = () => {
        const incompleteTaskKeys = (Object.keys(INITIAL_PRE_GAME_TASKS) as Array<keyof typeof INITIAL_PRE_GAME_TASKS>).filter(
            key => !tasks[key]
        );

        if (incompleteTaskKeys.length > 0) {
            const incompleteTaskLabels = incompleteTaskKeys.map(key => PRE_GAME_TASK_LABELS[key]);
            setIncompleteTasksList(incompleteTaskLabels);
            setShowIncompleteTasksModal(true);
        } else {
            saveAndNotify();
        }
    };

    const handleConfirmSaveAnyway = () => {
        saveAndNotify();
        setShowIncompleteTasksModal(false);
    };
    
    const handleCalendarReminder = () => {
        if (!gameDetails.date || !gameDetails.time) {
            alert("אנא הגדר תאריך ושעה למשחק בדף ההגדרות כדי ליצור תזכורת.");
            return;
        }

        const gameDateTime = new Date(`${gameDetails.date}T${gameDetails.time}`);
        if (isNaN(gameDateTime.getTime())) {
            alert("תאריך או שעה לא תקינים.");
            return;
        }
        
        // Event starts 30 minutes before the game
        const reminderTime = new Date(gameDateTime.getTime() - 30 * 60 * 1000);
        // Event has a 15 minute duration
        const endTime = new Date(reminderTime.getTime() + 15 * 60 * 1000);

        const formatDateForGoogle = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
        
        const calendarUrl = new URL('https://www.google.com/calendar/render');
        calendarUrl.searchParams.append('action', 'TEMPLATE');
        calendarUrl.searchParams.append('text', `תזכורת: שלח הודעת READY למשחק ${gameDetails.homeTeam}`);
        
        const detailsText = `שלח צילום מסך והודעת "${teamName} READY" לקבוצת ה-WhatsApp של האופרייטורים.\n\n(מומלץ להוסיף התראה של 5 דקות לאירוע זה ביומן).`;
        calendarUrl.searchParams.append('details', detailsText);
        
        calendarUrl.searchParams.append('dates', `${formatDateForGoogle(reminderTime)}/${formatDateForGoogle(endTime)}`);
        
        window.open(calendarUrl.toString(), '_blank');
    };

    const parseNameList = (rawString: string): ParsedName[] => {
        return rawString.split(',')
            .map(name => name.trim())
            .filter(name => name)
            .map(fullName => {
                const parts = fullName.split(/\s+/);
                const firstName = parts.shift() || '';
                const lastName = parts.join(' ');
                return { firstName, lastName };
            });
    }

    useEffect(() => {
        setParsedReferees(parseNameList(refereesRaw));
    }, [refereesRaw]);
    
    useEffect(() => {
        setParsedHomeCoaches(parseNameList(homeCoachesRaw));
    }, [homeCoachesRaw]);

    useEffect(() => {
        setParsedAwayCoaches(parseNameList(awayCoachesRaw));
    }, [awayCoachesRaw]);


    useEffect(() => {
        if (!supervisorRaw.trim()) {
            setParsedSupervisor(null);
            return;
        }
        const names = parseNameList(supervisorRaw);
        setParsedSupervisor(names.length > 0 ? names[0] : null);
    }, [supervisorRaw]);

    const message1 = `${teamName.trim() || 'TeamName'} Reached`;
    const message2 = `${teamName.trim() || 'TeamName'} READY`;
    const messageToCaller = `היי ${callerName.trim() || 'קולר'}, מה המייל עבודה שלך ב-Genius? אני צריך להזין אותו למערכת. תודה!`;


  return (
    <ChecklistWrapper onBack={onBack} onHome={onHome} title="Genius Sports Israel 🇮🇱" subtitle="🏀 תדריך אופרייטור - צ'קליסט לפני משחק">
        
        {showIncompleteTasksModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" dir="rtl">
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-lg border-2 border-yellow-500">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-4">משימות לא הושלמו</h3>
                    <p className="text-slate-300 mb-6">שימ/י לב, המשימות הבאות עדיין לא סומנו כבוצעו:</p>
                    <ul className="list-disc list-inside bg-slate-900/50 p-4 rounded-md text-slate-200 space-y-2 mb-8">
                        {incompleteTasksList.map((task, index) => (
                            <li key={index}>{task}</li>
                        ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row-reverse gap-4">
                        <button
                            onClick={handleConfirmSaveAnyway}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            שמור בכל מקרה
                        </button>
                        <button
                            onClick={() => setShowIncompleteTasksModal(false)}
                            className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            סגור וחזור לסימון
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-6">

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label htmlFor="teamName" className="block text-lg font-bold text-orange-400 mb-2">שם הקבוצה המארחת (באנגלית):</label>
                    <input
                        type="text"
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="לדוגמה: Karmiel"
                        className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                        dir="ltr"
                    />
                </div>
                 <div>
                    <label htmlFor="callerName" className="block text-lg font-bold text-orange-400 mb-2">שם הקולר שעובד איתך:</label>
                    <input
                        type="text"
                        id="callerName"
                        value={callerName}
                        onChange={(e) => setCallerName(e.target.value)}
                        placeholder="לדוגמה: דני"
                        className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            <h3 className="text-2xl text-orange-400 border-b border-slate-600 pb-2 mb-4">🏁 משימות לפני המשחק</h3>

            <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">📍</span>
                    <span>הגעה ואישור מיקום:</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="arrival_announce" isChecked={tasks.arrival_announce} onToggle={handleToggleTask}>יש להגיע לאולם <strong className="text-orange-400">שעה</strong> לפני שריקת הפתיחה ולהודיע בקבוצת הווטסאפ.</TaskItem>
                </div>
                <div className="bg-red-900/50 border-r-4 border-red-500 text-red-200 p-4 my-4 rounded-md">
                    <p className="font-semibold"><span className="font-bold text-red-400 ml-1">🔴 קריטי:</span> נוסח ההודעה הנדרש:</p>
                    <div dir="ltr" className="my-2 p-2 bg-slate-900 rounded font-mono text-center text-lg">{message1}</div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button onClick={() => handleCopy(message1, 'copy1')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            {copied === 'copy1' ? 'הועתק!' : 'העתק טקסט'}
                        </button>
                        <a href={`https://wa.me/?text=${encodeURIComponent(message1)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            שלח בוואטסאפ
                        </a>
                    </div>
                    <span className="text-sm block mt-2 text-blue-400 font-bold">(לקבוצה: Genius Sports Israel 🇮🇱)</span>
                </div>
            </div>

            <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">🖥️</span>
                    <span>הקמת עמדת עבודה וציוד:</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="setup_station" isChecked={tasks.setup_station} onToggle={handleToggleTask}>לארגן את שולחן העבודה: <strong className="text-orange-400">מדפסת, דפים, כבלים, מחשב</strong> ומערכת FIBA.</TaskItem>
                </div>
            </div>

            <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">📧</span>
                    <span>אימות כתובת עבודה של הקולר:</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="verify_caller_email" isChecked={tasks.verify_caller_email} onToggle={handleToggleTask}>
                        <strong>בקש</strong> את כתובת ה<strong className="text-orange-400">מייל עבודה</strong> של הקולר והזן למערכת FIBA.
                    </TaskItem>
                </div>
                <div className="bg-blue-900/30 border border-blue-700 p-4 my-4 rounded-md">
                    <p className="font-semibold text-blue-300">שלח הודעה לקולר לבקשת המייל:</p>
                    <div className="my-2 p-2 bg-slate-900 rounded font-sans text-right text-base">{messageToCaller}</div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button onClick={() => handleCopy(messageToCaller, 'copyCallerMsg')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            {copied === 'copyCallerMsg' ? 'הועתק!' : 'העתק הודעה'}
                        </button>
                        <a href={`https://wa.me/?text=${encodeURIComponent(messageToCaller)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            שלח בוואטסאפ
                        </a>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="callerEmail" className="block text-lg font-bold text-blue-300 mb-2">הדבק כאן את המייל של הקולר:</label>
                        <div className="relative">
                            <input
                                type="email"
                                id="callerEmail"
                                value={callerEmail}
                                onChange={(e) => setCallerEmail(e.target.value)}
                                placeholder="caller.name@geniusports.com"
                                className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                                dir="ltr"
                            />
                            {callerEmail && (
                                <button
                                    onClick={() => handleCopy(callerEmail, 'copyEmail')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                                >
                                    {copied === 'copyEmail' ? 'הועתק!' : 'העתק'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="operatorEmail" className="block text-lg font-bold text-blue-300 mb-2">המייל שלך (Operator):</label>
                        <div className="relative">
                            <input
                                type="email"
                                id="operatorEmail"
                                value={gameDetails.operatorEmail}
                                readOnly
                                className="w-full bg-slate-800 text-slate-300 p-3 rounded-md border-2 border-slate-600 focus:outline-none transition-colors"
                                dir="ltr"
                            />
                            <button
                                onClick={() => handleCopy(gameDetails.operatorEmail, 'copyOpEmail')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                            >
                                {copied === 'copyOpEmail' ? 'הועתק!' : 'העתק'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">⚙️</span>
                    <span>פעולות ראשוניות בתוכנה:</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="initial_software_actions" isChecked={tasks.initial_software_actions} onToggle={handleToggleTask}>
                        ודא פתיחה של המשחק הנכון (<strong className="text-red-400">קריטי</strong>), בדוק Computer System Specs, סמן כמות צופים (SPECTATORS) ואת האולם המארחת.
                    </TaskItem>
                </div>
            </div>

            <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">⚖️</span>
                    <span>עדכון שמות שופטים ומשקיף:</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="update_officials" isChecked={tasks.update_officials} onToggle={handleToggleTask}>הכנס את שמות השופטים והמשקיף (לפי <a dir="ltr" className="text-blue-400 hover:underline inline-block" href="https://ibasketball.co.il/" target="_blank" rel="noopener noreferrer">אתר האיגוד</a>).</TaskItem>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-700 p-4 my-4 rounded-md space-y-6">
                    <div>
                        <label htmlFor="refereesInput" className="block text-lg font-bold text-blue-300 mb-2">הדבק כאן את רשימת השופטים (מופרדים בפסיק):</label>
                        <textarea
                            id="refereesInput"
                            value={refereesRaw}
                            onChange={(e) => setRefereesRaw(e.target.value)}
                            placeholder="לדוגמה: ישראל ישראלי, דוד לוי..."
                            className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                            rows={2}
                        />
                         {parsedReferees.length > 0 && (
                            <div className="mt-3 space-y-3">
                                {/* FIX: Passing props to the extracted NameParserResult component */}
                                {parsedReferees.map((official, index) => (
                                    <NameParserResult key={index} name={official} index={index} type="ref" copied={copied} onCopy={handleCopy} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="supervisorInput" className="block text-lg font-bold text-blue-300 mb-2">הדבק כאן את שם המשקיף:</label>
                        <input
                            id="supervisorInput"
                            type="text"
                            value={supervisorRaw}
                            onChange={(e) => setSupervisorRaw(e.target.value)}
                            placeholder="לדוגמה: משה כהן"
                            className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                         {parsedSupervisor && (
                            <div className="mt-3 space-y-3">
                                <NameParserResult name={parsedSupervisor} index={0} type="sup" copied={copied} onCopy={handleCopy} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="confirm_officials" isChecked={tasks.confirm_officials} onToggle={handleToggleTask}><strong className="text-orange-400">חובה לוודא את כל השמות מול המזכירות</strong> לפני תחילת האירוע.</TaskItem>
                </div>
            </div>

            <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">🏷️</span>
                    <span>אימות רשימות הקבוצות (שחקנים):</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="print_rosters" isChecked={tasks.print_rosters} onToggle={handleToggleTask}>הדפס את רשימות שחקני ומאמני שתי הקבוצות.</TaskItem>
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="verify_rosters" isChecked={tasks.verify_rosters} onToggle={handleToggleTask}><strong className="text-orange-400">אמת</strong> את הנתונים מול התוכנה, <strong className="text-orange-400">המזכירות</strong>, <strong className="text-orange-400">נציגי הקבוצות</strong> והכנס את ה<strong className="text-orange-400">צבע הנכון</strong> של הקבוצות לתוכנה.</TaskItem>
                </div>
                 <div className="bg-blue-900/30 border border-blue-700 p-4 my-4 rounded-md space-y-6">
                    {/* Home Team Coaches */}
                    <div>
                        <label htmlFor="homeCoachesInput" className="block text-lg font-bold text-blue-300 mb-2">
                            מאמני הקבוצה המארחת ({gameDetails.homeTeam}) (מופרדים בפסיק):
                        </label>
                        <textarea
                            id="homeCoachesInput"
                            value={homeCoachesRaw}
                            onChange={(e) => setHomeCoachesRaw(e.target.value)}
                            placeholder="לדוגמה: מאמן ראשי, עוזר מאמן"
                            className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                            rows={2}
                        />
                        {parsedHomeCoaches.length > 0 && (
                            <div className="mt-3">
                                <h5 className="text-lg font-bold text-blue-200 mb-2">שמות מופרדים (העתק למערכת):</h5>
                                <div className="space-y-3">
                                    {parsedHomeCoaches.map((coach, index) => (
                                        <NameParserResult key={`home-${index}`} name={coach} index={index} type="home-coach" copied={copied} onCopy={handleCopy} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Away Team Coaches */}
                    <div>
                        <label htmlFor="awayCoachesInput" className="block text-lg font-bold text-blue-300 mb-2">
                            מאמני הקבוצה האורחת ({gameDetails.awayTeam}) (מופרדים בפסיק):
                        </label>
                        <textarea
                            id="awayCoachesInput"
                            value={awayCoachesRaw}
                            onChange={(e) => setAwayCoachesRaw(e.target.value)}
                            placeholder="לדוגמה: מאמן ראשי, עוזר מאמן"
                            className="w-full bg-slate-700 text-white p-3 rounded-md border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                            rows={2}
                        />
                        {parsedAwayCoaches.length > 0 && (
                            <div className="mt-3">
                                <h5 className="text-lg font-bold text-blue-200 mb-2">שמות מופרדים (העתק למערכת):</h5>
                                <div className="space-y-3">
                                    {parsedAwayCoaches.map((coach, index) => (
                                        <NameParserResult key={`away-${index}`} name={coach} index={index} type="away-coach" copied={copied} onCopy={handleCopy} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-3 mt-4">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                     <TaskItem id="enter_coach_names" isChecked={tasks.enter_coach_names} onToggle={handleToggleTask}>הכנס את שמות המאמנים לתוכנה.</TaskItem>
                </div>

                <div className="bg-yellow-900/50 border-r-4 border-yellow-500 text-yellow-200 p-4 my-4 font-semibold rounded-md">
                    <span className="font-bold text-yellow-400 ml-1">⚠️ שימו לב ל:</span>
                    <ul className="list-disc pr-5 mt-2 space-y-1">
                        <li><strong className="text-red-500 font-black text-lg">משחקי ליגה:</strong> אין לרשום שמות שחקנים ידנית. מותר לשנות <strong className="text-red-500 font-black text-lg">מספרים</strong> בלבד.</li>
                        <li><strong className="text-red-500 font-black text-lg">משחקי אימון:</strong> <strong className="text-red-500 font-black text-lg">יש</strong> להזין ידנית שמות ומספרים.</li>
                        <li>לכל בעיה, פנה ישירות ל<strong className="text-red-500 font-black text-lg">ליאור</strong>.</li>
                    </ul>
                </div>
            </div>

            <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">✅</span>
                    <span>בדיקת מוכנות מערכת (30 דק' לפני):</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="check_system_ready" isChecked={tasks.check_system_ready} onToggle={handleToggleTask}>היכנס ל־ <strong dir="ltr" className="bg-slate-700 p-1 rounded text-red-400 font-bold text-lg">Help {'\u2192'} Match Information</strong> וודא שהמשחק מוכן.</TaskItem>
                    {/* FIX: Passing props to the extracted TaskItem component */}
                     <TaskItem id="send_ready_screenshot" isChecked={tasks.send_ready_screenshot} onToggle={handleToggleTask}>שלח צילום מסך עם ההודעה הנדרשת בקבוצת הווטסאפ.</TaskItem>
                </div>

                <div className="mt-4">
                     <button
                        onClick={handleCalendarReminder}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        הוסף תזכורת ליומן
                    </button>
                </div>

                <div className="bg-red-900/50 border-r-4 border-red-500 text-red-200 p-4 my-4 rounded-md">
                    <p className="font-semibold"><span className="font-bold text-red-400 ml-1">🔴 קריטי:</span> אישור זה מאפשר פתיחת שידור גלובלי. נוסח ההודעה:</p>
                    <div dir="ltr" className="my-2 p-2 bg-slate-900 rounded font-mono text-center text-lg">{message2}</div>
                     <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button onClick={() => handleCopy(message2, 'copy2')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            {copied === 'copy2' ? 'הועתק!' : 'העתק טקסט'}
                        </button>
                        <a href={`https://wa.me/?text=${encodeURIComponent(message2)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            שלח בוואטסאפ
                        </a>
                    </div>
                    <span className="text-sm block mt-2 text-blue-400 font-bold">(לקבוצה: Israel Operators FIBA)</span>
                </div>
            </div>

            <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">📺</span>
                    <span>בדיקת איכות שידור TV:</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="check_tv_broadcast" isChecked={tasks.check_tv_broadcast} onToggle={handleToggleTask}>לוודא שיש שידור תקין ב<a dir="ltr" className="text-blue-400 hover:underline inline-block" href="https://tv.ibasketball.co.il/" target="_blank" rel="noopener noreferrer">אתר הוידאו של איגוד הכדורסל</a>.</TaskItem>
                </div>
            </div>

            <h3 className="text-2xl text-orange-400 border-b border-slate-600 pb-2 mb-4 pt-6">▶️ משימות במהלך המשחק</h3>

             <div className="border-b-2 border-slate-700 pb-6">
                <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">🏀</span>
                    <span>דיווח סטטיסטיקות מחצית:</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="report_halftime_stats" isChecked={tasks.report_halftime_stats} onToggle={handleToggleTask}>בסיום המחצית (Quarter 2), להפיק דו"ח <strong className="text-orange-400">BOX SCORE</strong> ולשלוח לקבוצת הווטסאפ.</TaskItem>
                </div>
                 <div className="bg-yellow-900/50 border-r-4 border-yellow-500 text-yellow-200 p-4 my-4 font-semibold rounded-md">
                    <span className="font-bold text-yellow-400 ml-1">⚠️ חשוב:</span> וודא שהדוח נשלח מיד בתום המחצית. <span className="text-sm block mt-1 text-blue-400 font-bold">(לקבוצה: Genius Sports Israel 🇮🇱)</span>
                </div>
            </div>
            
            <div className="pb-6">
                 <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
                    <span className="text-3xl ml-4">🏁</span>
                    <span>דיווח סטטיסטיקות סיום:</span>
                </h4>
                <div className="space-y-3">
                    {/* FIX: Passing props to the extracted TaskItem component */}
                    <TaskItem id="report_final_stats" isChecked={tasks.report_final_stats} onToggle={handleToggleTask}>בסיום המשחק, להפיק דו"ח <strong className="text-orange-400">BOX SCORE</strong> סופי ולשלוח לקבוצת הווטסאפ.</TaskItem>
                </div>
                 <div className="bg-yellow-900/50 border-r-4 border-yellow-500 text-yellow-200 p-4 my-4 font-semibold rounded-md">
                    <span className="font-bold text-yellow-400 ml-1">⚠️ חשוב:</span> וודא שהדוח נשלח מיד בתום אישור התוצאה. <span className="text-sm block mt-1 text-blue-400 font-bold">(לקבוצה: Genius Sports Israel 🇮🇱)</span>
                </div>
            </div>

            <div className="mt-8 p-5 bg-teal-900/50 border-r-4 border-teal-500 text-teal-200 rounded-md">
                <p className="text-xl font-bold">🚀 תמיכה מקצועית ופתרון תקלות</p>
                <p className="mt-2">לכל שאלה או בעיה, יש לפנות מיד ל<span className="text-red-500 font-black text-lg mx-1">ליאור (המנהל המקצועי - Genius)</span>. אל תשאירו קצוות פתוחים.</p>
                <p className="mt-2 font-semibold">זכור את הכלל: <strong className="text-orange-400">במידה ויש ספק, אין ספק!</strong></p>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                 <button 
                    onClick={handleSaveGame} 
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105 relative"
                >
                    שמור משחק
                    {isSaved && <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">נשמר!</span>}
                </button>
                <button 
                    onClick={onNavigateToPostGame}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105"
                >
                    המשך לצ'ק ליסט אחרי משחק {'\u2190'}
                </button>
            </div>
        </div>
    </ChecklistWrapper>
  );
};

export default OperatorPreGamePage;