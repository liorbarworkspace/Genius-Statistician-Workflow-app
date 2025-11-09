import React, { useState, useEffect } from 'react';
import ChecklistWrapper from './ChecklistWrapper';
import { GameDetails, PostGameTasks } from '../types';
import { INITIAL_POST_GAME_TASKS, POST_GAME_TASK_LABELS } from '../constants';

interface OperatorPostGamePageProps {
  onBack: () => void;
  onHome: () => void;
  gameDetails: GameDetails;
  onFinish: (details: GameDetails) => void;
}

// FIX: Moved TaskItem outside the component to fix type errors related to children prop.
const TaskItem: React.FC<{ id: keyof PostGameTasks; isChecked: boolean; onToggle: (id: keyof PostGameTasks) => void; children: React.ReactNode; }> = ({ id, isChecked, onToggle, children }) => (
    <div
        className={`flex items-start cursor-pointer p-2 rounded-md transition-colors hover:bg-slate-700/50 ${isChecked ? 'text-slate-500' : 'text-slate-200'}`}
        onClick={() => onToggle(id)}
    >
        <div className={`w-6 h-6 border-2 rounded-md flex-shrink-0 flex items-center justify-center mt-1 ${isChecked ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
            {isChecked && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <div className={`flex-grow mx-4 ${isChecked ? 'line-through' : ''}`}>{children}</div>
    </div>
);

const OperatorPostGamePage: React.FC<OperatorPostGamePageProps> = ({ onBack, onHome, gameDetails, onFinish }) => {
  const [tasks, setTasks] = useState<PostGameTasks>(gameDetails.postGameTasks || INITIAL_POST_GAME_TASKS);
  const [isSaved, setIsSaved] = useState(false);
  const [showIncompleteTasksModal, setShowIncompleteTasksModal] = useState(false);
  const [incompleteTasksList, setIncompleteTasksList] = useState<string[]>([]);

  useEffect(() => {
    setTasks(gameDetails.postGameTasks || INITIAL_POST_GAME_TASKS);
  }, [gameDetails]);

  const handleToggleTask = (taskId: keyof PostGameTasks) => {
    setTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const saveAndProceed = () => {
    const finalDetails: GameDetails = {
      ...gameDetails,
      postGameTasks: tasks,
    };
    setIsSaved(true);
    onFinish(finalDetails);
  };

  const handleSaveAndFinish = () => {
    const incompleteTaskKeys = (Object.keys(INITIAL_POST_GAME_TASKS) as Array<keyof PostGameTasks>).filter(
        key => !tasks[key]
    );

    if (incompleteTaskKeys.length > 0) {
        const incompleteTaskLabels = incompleteTaskKeys.map(key => POST_GAME_TASK_LABELS[key]);
        setIncompleteTasksList(incompleteTaskLabels);
        setShowIncompleteTasksModal(true);
    } else {
        saveAndProceed();
    }
  };
  
  const handleConfirmSaveAnyway = () => {
    saveAndProceed();
    setShowIncompleteTasksModal(false);
  };

  const subtitle = `✅ צ'קליסט סיום משמרת | ${gameDetails.homeTeam} vs ${gameDetails.awayTeam}`;

  return (
    <ChecklistWrapper onBack={onBack} onHome={onHome} title="Genius Sports Israel 🇮🇱" subtitle={subtitle}>
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
        <h3 className="text-2xl text-orange-400 border-b border-slate-600 pb-2 mb-4">💾 סיום עבודה במערכת (Finalized)</h3>

        <div className="border-b-2 border-slate-700 pb-6">
          <TaskItem id="verify_upload" isChecked={tasks.verify_upload} onToggle={handleToggleTask}>
            <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
              <span className="text-3xl ml-4">☁️</span>
              <span>אימות העלאת נתונים (Upload Status):</span>
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">לאחר לחיצה על <strong>"Finalized"</strong>, יש לוודא שקיבלת את ההודעה הירוקה המאשרת שכל נתוני ה-DATA של המשחק עלו בהצלחה.</li>
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">ההודעה הנדרשת: <strong className="text-green-400">"The game is uploaded. You can close the game."</strong></li>
            </ul>
            <div className="bg-green-900/50 border-r-4 border-green-500 text-green-200 p-4 my-4 font-semibold rounded-md">
              <span className="font-bold text-green-400 ml-1">✅ סטטוס אישור נדרש:</span>
              <ul className="list-none mt-2 space-y-1">
                <li className="relative pr-8 before:content-['•'] before:text-green-400 before:font-bold before:absolute before:right-0">WEBCAST: צריך להראות <strong className="text-green-300">Uploaded [X]/[X]</strong></li>
                <li className="relative pr-8 before:content-['•'] before:text-green-400 before:font-bold before:absolute before:right-0">REMOTE DATA STORE: צריך להראות <strong className="text-green-300">Uploaded [X]/[X]</strong></li>
                <li className="relative pr-8 before:content-['•'] before:text-green-400 before:font-bold before:absolute before:right-0">MATCH STATE PLATFORM: צריך להראות <strong className="text-green-300">Uploaded [X]/[X]</strong></li>
              </ul>
            </div>
          </TaskItem>
        </div>

        <div className="border-b-2 border-slate-700 pb-6">
          <TaskItem id="send_final_report" isChecked={tasks.send_final_report} onToggle={handleToggleTask}>
            <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
              <span className="text-3xl ml-4">✉️</span>
              <span>שליחת דו"ח BOX SCORE סופי:</span>
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">יש לוודא ששלחת את קובץ ה-<strong className="text-orange-400">PDF</strong> הסופי (Box Score) של המשחק כולו לקבוצת הווטסאפ הגדולה.</li>
            </ul>
            <div className="bg-red-900/50 border-r-4 border-red-500 text-red-200 p-4 my-4 font-semibold rounded-md">
              <span className="font-bold text-red-400 ml-1">⚠️ קבוצה:</span> Genius Sports Israel 🇮🇱
            </div>
          </TaskItem>
        </div>

        <h3 className="text-2xl text-orange-400 border-b border-slate-600 pb-2 mb-4 pt-6">💰 דיווח הוצאות ומעקב</h3>

        <div className="border-b-2 border-slate-700 pb-6">
          <TaskItem id="report_expenses" isChecked={tasks.report_expenses} onToggle={handleToggleTask}>
            <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
              <span className="text-3xl ml-4">🚗</span>
              <span>דיווח הוצאות נסיעה ב-MONDAY:</span>
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">לעבור על קובץ MONDAY: תחת המשחק שסיימת בדף <span dir="ltr" className="inline-block font-bold text-blue-300 p-1 bg-blue-900/50 rounded text-base mx-1">LiveStats Confirmed Coverage</span>.</li>
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">בעמודה <span dir="ltr" className="inline-block font-bold text-blue-300 p-1 bg-blue-900/50 rounded text-base mx-1">Expenses Status</span>, לחץ על הלחצן של ה-Operator.</li>
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">במידה ויש הוצאות רכב: לחץ <strong className="text-orange-400">YES</strong> על <span dir="ltr" className="inline-block font-bold text-blue-300 p-1 bg-blue-900/50 rounded text-base mx-1">ST has expenses</span>.</li>
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0"><strong className="text-orange-400">חובה:</strong> להוסיף לינק מ-Google Maps (מהבית לאולם) מתחת לדיווח.</li>
            </ul>
          </TaskItem>
        </div>

        <div className="border-b-2 border-slate-700 pb-6">
          <TaskItem id="log_for_payment" isChecked={tasks.log_for_payment} onToggle={handleToggleTask}>
            <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
              <span className="text-3xl ml-4">📅</span>
              <span>רישום למעקב תשלומים אישי:</span>
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">רשום לעצמך את פרטי המשחק (תאריך, שמות הקבוצות) ביומן המעקב האישי שלך לתשלומים.</li>
            </ul>
          </TaskItem>
        </div>

        <h3 className="text-2xl text-orange-400 border-b border-slate-600 pb-2 mb-4 pt-6">🔎 בדיקות שגרתיות לאחר המשחק</h3>

        <div className="border-b-2 border-slate-700 pb-6">
          <TaskItem id="check_errors_file" isChecked={tasks.check_errors_file} onToggle={handleToggleTask}>
            <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
              <span className="text-3xl ml-4">🛠️</span>
              <span>בדיקת קובץ טעויות (יום-יומיים לאחר המשחק):</span>
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">בדוק את קובץ הטעויות: <strong className="text-orange-400">Post Game Edits 2025 Season For ALL STS</strong> <a dir="ltr" className="text-blue-400 hover:underline inline-block" href="https://docs.google.com/spreadsheets/d/1XboNwV9uZ1QdldyHd5SOhu89dO6pJ4iO/edit?gid=783273912#gid=783273912" target="_blank" rel="noopener noreferrer">לינק לקובץ</a>.</li>
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">אם יש טעויות אופרייטור: סמן <strong className="text-orange-400">YES</strong> בעמודה המתאימה לאחר בדיקת הטעות והסרטון.</li>
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0"><strong className="text-orange-400">אם אתה לא מסכים:</strong> רשום את שמך והמייל שלך בעמודה <span dir="ltr" className="inline-block font-bold text-blue-300 p-1 bg-blue-900/50 rounded text-base mx-1">Statistician (name, email)</span>, והוסף הסבר מקצועי (באנגלית ברורה) ליד ההערה.</li>
            </ul>
          </TaskItem>
        </div>

        <div className="border-b-2 border-slate-700 pb-6">
          <TaskItem id="verify_next_game" isChecked={tasks.verify_next_game} onToggle={handleToggleTask}>
            <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
              <span className="text-3xl ml-4">➡️</span>
              <span>וידוא שיבוץ המשחק הבא:</span>
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">בדוק בלוח השיבוצים ששמך מופיע במשחק הבא, והוסף אותו ליומן האישי.</li>
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0"><strong className="text-orange-400">אם לא מופיע:</strong> בדוק עם המנהל/אחראי את המשחקים הבאים שאתה יכול להשתבץ אליהם.</li>
            </ul>
            <div className="bg-yellow-900/50 border-r-4 border-yellow-500 text-yellow-200 p-4 my-4 font-semibold rounded-md">
              <span className="font-bold text-yellow-400 ml-1">🔗 לינק שיבוצים:</span> <a dir="ltr" className="text-blue-400 hover:underline inline-block" href="https://docs.google.com/spreadsheets/d/1dHyH7zvgGHZI2717qtY4GsQCDZVW5murV0RIwA_n9pc/edit?usp=sharing" target="_blank" rel="noopener noreferrer">לינק לקובץ</a>
            </div>
          </TaskItem>
        </div>

        <div className="pb-6">
          <TaskItem id="follow_updates" isChecked={tasks.follow_updates} onToggle={handleToggleTask}>
            <h4 className="text-xl font-bold text-slate-100 flex items-center mb-3">
              <span className="text-3xl ml-4">📲</span>
              <span>מעקב עדכונים בווטסאפ:</span>
            </h4>
            <ul className="list-none p-0 space-y-2">
              <li className="relative pr-8 before:content-['★'] before:text-yellow-400 before:font-bold before:absolute before:right-0">לעקוב אחרי עדכונים בקבוצות וואטסאפ על שינויים ועדכונים בתוכנה של FIBA.</li>
            </ul>
          </TaskItem>
        </div>

        <div className="mt-8 p-5 bg-teal-900/50 border-r-4 border-teal-500 text-teal-200 rounded-md">
          <p className="text-xl font-bold">✨ סיימת בהצלחה!</p>
          <p className="mt-2">לכל שאלה או בעיה, יש לפנות מיד ל<span className="text-red-500 font-black text-lg mx-1">ליאור (המנהל המקצועי - Genius)</span>. כל העבודה שלך מתועדת!</p>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleSaveAndFinish}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105 relative"
          >
            שמור וחזור
            {isSaved && <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">נשמר!</span>}
          </button>
        </div>
      </div>
    </ChecklistWrapper>
  );
};

export default OperatorPostGamePage;