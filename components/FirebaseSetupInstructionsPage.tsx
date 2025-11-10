
import React, { useState } from 'react';
import Logo from './Logo';

const FirebaseSetupInstructionsPage: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const configSnippet = `
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};`;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(configSnippet.trim()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

  return (
    <div className="max-w-4xl mx-auto text-slate-300">
       <header className="bg-blue-950 text-white p-6 text-center rounded-lg shadow-lg mb-8 relative">
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3">
                <Logo className="w-10 h-10" />
                <span>First-Time Setup (Firebase)</span>
            </h1>
            <h2 className="text-lg sm:text-xl font-light mt-1 text-slate-300">Connecting the App to a Firebase Backend</h2>
        </header>

        <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8 space-y-8">
            <div className="bg-yellow-900/50 border-l-4 border-yellow-500 p-4 rounded-md">
                <p className="font-bold text-yellow-300">Welcome, Admin!</p>
                <p className="mt-1">This one-time setup will create a free, secure backend for your application using Google Firebase. Please follow these steps carefully. It should take about 10 minutes.</p>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">שלב 1: יצירת פרויקט Firebase</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>כנס לכתובת <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">Firebase Console</a>.</li>
                    <li>לחץ על "Create a project" (או "Add project").</li>
                    <li>תן שם לפרויקט (לדוגמה: "Genius Workflow Hub") והמשך בתהליך ההקמה (אפשר לדלג על הפעלת Google Analytics).</li>
                </ol>
            </div>
            
            <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">שלב 2: הוספת אפליקציית Web לפרויקט</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>בתוך הפרויקט שיצרת, לחץ על אייקון הווב ( <code className="bg-slate-700 p-1 rounded font-bold">{`</>`}</code> ) כדי להוסיף אפליקציית Web.</li>
                    <li>תן כינוי לאפליקציה (למשל, "WebApp") ולחץ על "Register app".</li>
                     <li>יופיע מסך עם קוד תחת הכותרת "Install Firebase SDK". <strong className="text-yellow-400">זה החלק החשוב.</strong> העתק את אובייקט ה-`firebaseConfig` שמוצג שם. הוא נראה כך:</li>
                </ol>
                 <div className="relative mt-4">
                    <pre className="w-full bg-slate-950 text-slate-300 font-mono p-4 rounded-md border border-slate-700 text-xs overflow-x-auto" dir="ltr">
                        <code>{configSnippet.trim()}</code>
                    </pre>
                    <button
                        onClick={handleCopyCode}
                        className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-4 rounded transition-colors"
                    >
                        {copied ? 'הועתק!' : 'העתק דוגמה'}
                    </button>
                </div>
            </div>

             <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">שלב 3: הפעלת Authentication</h3>
                <p className="mb-2">נאפשר למשתמשים להתחבר עם חשבון גוגל.</p>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>בתפריט הצד של Firebase, לחץ על "Authentication" (תחת "Build").</li>
                    <li>לחץ על "Get started".</li>
                    <li>בחר את "Google" מרשימת הספקים (Providers).</li>
                    <li>הפעל את המתג (Enable), בחר אימייל תמיכה (האימייל שלך) ולחץ על "Save".</li>
                </ol>
            </div>

             <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">שלב 4: הפעלת מסד הנתונים (Firestore)</h3>
                 <p className="mb-2">כאן נאחסן את כל נתוני המשחקים והמשתמשים.</p>
                 <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>בתפריט הצד, לחץ על "Firestore Database" (תחת "Build").</li>
                    <li>לחץ על "Create database".</li>
                    <li>בחר באפשרות "Start in <strong className="text-yellow-400">production mode</strong>" ולחץ "Next".</li>
                    <li>בחר מיקום לשרתים (לדוגמה, `europe-west1` או כל מיקום אחר שקרוב אליך) ולחץ על "Enable".</li>
                    <li>לאחר שהבסיס נתונים נוצר, עבור ללשונית "Rules". החלף את הכללים הקיימים בכללים הבאים ולחץ "Publish":</li>
                 </ol>
                  <div className="relative mt-4">
                    <pre className="w-full bg-slate-950 text-slate-300 font-mono p-4 rounded-md border border-slate-700 text-xs overflow-x-auto" dir="ltr">
                        <code>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    // Admins can read/write the full users collection
    match /users/{userId} {
      allow list, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    // Any authenticated user can read game data
    match /games/{gameId} {
      allow read: if request.auth != null;
    }
     // Any authenticated user can create/update game data
    match /games/{gameId} {
      allow write: if request.auth != null;
    }
    // Any authenticated user can create a login record
    match /logins/{loginId} {
        allow create: if request.auth != null;
    }
    // Admins can read the full login history
    match /logins/{loginId} {
      allow list: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`}
                        </code>
                    </pre>
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">שלב 5: הדבקת ההגדרות באפליקציה</h3>
                 <p className="mb-2">
                    זהו השלב האחרון! נחבר את האפליקציה לפרויקט ה-Firebase שיצרת.
                 </p>
                 <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>בתוך עורך הקוד של האפליקציה, פתח את הקובץ: <code className="bg-slate-700 p-1 rounded">services/firebase.ts</code>.</li>
                    <li>תראה שם אובייקט `firebaseConfig` עם ערכים ריקים ("YOUR_API_KEY" וכו').</li>
                    <li>הדבק את פרטי ה-`firebaseConfig` שהעתקת בשלב 2 במקום הערכים הריקים.</li>
                 </ol>
                 <p className="mt-4 text-green-400 font-bold">לאחר שתשמור את הקובץ <code className="bg-slate-700 p-1 rounded">services/firebase.ts</code> עם ההגדרות הנכונות, האפליקציה תתחבר אוטומטית ל-Firebase, דף זה ייעלם, ותועבר למסך ההתחברות החדש.</p>
            </div>
        </div>
    </div>
  );
};

export default FirebaseSetupInstructionsPage;
