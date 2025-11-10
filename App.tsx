
import React, { useState, useCallback, useEffect } from 'react';
import { Page, Role, GameDetails, LoginRecord, User } from './types';
import OperatorPreGamePage from './components/OperatorPreGamePage';
import OperatorPostGamePage from './components/OperatorPostGamePage';
import RoleSelectionPage from './components/RoleSelectionPage';
import ChecklistSelectionPage from './components/ChecklistSelectionPage';
import WIPPage from './components/WIPPage';
import GameSetupPage from './components/GameSetupPage';
import GameHistoryPage from './components/GameHistoryPage';
import PostGameSelectionPage from './components/PostGameSelectionPage';
import LoginPage from './components/LoginPage';
import LoginHistoryPage from './components/LoginHistoryPage';
import AdminPage from './components/AdminPage';
import FirebaseSetupInstructionsPage from './components/FirebaseSetupInstructionsPage';
import { isFirebaseConfigured } from './services/firebase';
import { onAuthStateChangedListener, signOutUser } from './services/authService';
import { getInitialData, saveGame as saveGameToDb, updateUsers as updateUsersInDb, clearGames as clearGamesInDb, getUserDocument, createUserDocumentFromAuth, logUserLogin } from './services/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserDetails, setCurrentUserDetails] = useState<User | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [page, setPage] = useState<Page>(Page.Login);
  const [role, setRole] = useState<Role>(Role.None);
  const [currentGameDetails, setCurrentGameDetails] = useState<GameDetails | null>(null);
  const [savedGames, setSavedGames] = useState<GameDetails[]>([]);
  const [authorizedUsers, setAuthorizedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isApiSetup = isFirebaseConfigured();

  const loadInitialData = useCallback(async (userRole: User['role']) => {
    setError(null);
    try {
      const data = await getInitialData(userRole);
      setAuthorizedUsers(data.users || []);
      setSavedGames(data.games || []);
      setLoginHistory(data.logins || []);
    } catch (err: any) {
      console.error("Failed to load data from Firestore", err);
      setError(err.message || "Could not connect to the database.");
    }
  }, []);

  useEffect(() => {
    if (!isApiSetup) {
      setPage(Page.SetupInstructions);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChangedListener(async (user) => {
      setIsLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
            let userDoc = await getUserDocument(user.uid);
            if (!userDoc) {
                // First time login for this user
                userDoc = await createUserDocumentFromAuth(user);
            }
            await logUserLogin(user.uid);
            setCurrentUserDetails(userDoc);
            await loadInitialData(userDoc.role);
            setPage(Page.RoleSelection);
        } catch (err) {
             console.error("Error fetching user data:", err);
             setError("Failed to load your profile. Please try again.");
             await signOutUser();
        }
      } else {
        setCurrentUser(null);
        setCurrentUserDetails(null);
        handleLogout(false); // don't call firebase signOut again
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isApiSetup, loadInitialData]);
  
  // Persist role locally for better UX *within* a session (e.g. on back button)
  useEffect(() => {
    if(currentUser) {
        localStorage.setItem('genius-workflow-role', String(role));
    }
  }, [role, currentUser]);


  useEffect(() => {
    if (page === Page.SetupInstructions || !currentUser) return;
    const state = { page, role, gameId: currentGameDetails?.id };
    if (history.state?.page !== page || history.state?.role !== role || history.state?.gameId !== currentGameDetails?.id) {
      window.history.pushState(state, '');
    }
  }, [page, role, currentGameDetails, currentUser]);
    
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    if (page === Page.SetupInstructions || !currentUser) return;

    const handlePopState = (event: PopStateEvent) => {
      if (!currentUser) {
          handleLogout();
          return;
      }
      const savedRole = localStorage.getItem('genius-workflow-role');
      const defaultRole = savedRole ? (parseInt(savedRole) as Role) : Role.None;
      const defaultPage = defaultRole !== Role.None ? Page.ChecklistSelection : Page.RoleSelection;

      if (event.state) {
        setPage(event.state.page ?? defaultPage);
        setRole(event.state.role ?? defaultRole);
      } else {
        setPage(defaultPage);
        setRole(defaultRole);
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.history.replaceState({ page, role }, '');
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentUser, page]);

  const handleLogout = useCallback(async (shouldSignOut = true) => {
      if (shouldSignOut) {
          await signOutUser();
      }
      setCurrentUser(null);
      setCurrentUserDetails(null);
      setRole(Role.None);
      setCurrentGameDetails(null);
      setSavedGames([]);
      setLoginHistory([]);
      setAuthorizedUsers([]);
      localStorage.removeItem('genius-workflow-role');
      setPage(isApiSetup ? Page.Login : Page.SetupInstructions);
  }, [isApiSetup]);

  const handleRoleSelect = useCallback((selectedRole: Role) => {
    setRole(selectedRole);
    if (selectedRole === Role.Caller) {
      setPage(Page.CallerWorkInProgress);
    } else {
      setPage(Page.ChecklistSelection);
    }
  }, []);

  const handleChecklistSelect = useCallback((checklistType: 'pre' | 'post') => {
    if (role === Role.Operator) {
      if (checklistType === 'pre') {
        setPage(Page.GameSetup);
      } else {
        setPage(Page.PostGameSelection);
      }
    }
  }, [role]);
  
  const handleGameSetupComplete = useCallback((details: GameDetails) => {
    setCurrentGameDetails(details);
    setPage(Page.OperatorPreGame);
  }, []);
  
  const handleGameSelectForPostGame = useCallback((game: GameDetails) => {
    setCurrentGameDetails(game);
    setPage(Page.OperatorPostGame);
  }, []);

  const handleSaveGame = useCallback(async (finalDetails: GameDetails) => {
    const existingIndex = savedGames.findIndex(g => g.id === finalDetails.id);
    let newGames;
    if (existingIndex > -1) {
      newGames = [...savedGames];
      newGames[existingIndex] = finalDetails;
    } else {
      newGames = [finalDetails, ...savedGames];
    }
    setSavedGames(newGames); // Optimistic update

    try {
        await saveGameToDb(finalDetails);
    } catch (err) {
        setError("Connection error while saving game. Your changes might be lost.");
        setSavedGames(savedGames); // Revert on failure
    }
  }, [savedGames]);

  const handleFinishPostGame = useCallback((finalDetails: GameDetails) => {
      handleSaveGame(finalDetails);
      setPage(Page.ChecklistSelection);
  }, [handleSaveGame]);
  
  const handleUpdateUsers = useCallback(async (updatedUsers: User[]) => {
    const previousUsers = authorizedUsers;
    setAuthorizedUsers(updatedUsers); // Optimistic update
    try {
        await updateUsersInDb(updatedUsers);
    } catch (err) {
        setError('Connection error while updating users.');
        setAuthorizedUsers(previousUsers); // Revert
    }
  }, [authorizedUsers]);


  const handleClearHistory = useCallback(async () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל היסטוריית המשחקים? לא ניתן לשחזר פעולה זו.')) {
        const previousGames = savedGames;
        setSavedGames([]);
        try {
            await clearGamesInDb();
        } catch (err) {
            setError('Connection error while clearing history.');
            setSavedGames(previousGames);
        }
    }
  }, [savedGames]);


  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goHome = useCallback(() => {
    setPage(Page.RoleSelection);
    setRole(Role.None);
    setCurrentGameDetails(null);
    localStorage.removeItem('genius-workflow-role');
  }, []);
  
  const renderPage = () => {
    if (page === Page.SetupInstructions) {
        return <FirebaseSetupInstructionsPage />;
    }
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg">טוען נתונים...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <div className="text-center bg-red-900/50 p-8 rounded-lg">
                    <h2 className="text-2xl text-red-400 font-bold mb-4">An Error Occurred</h2>
                    <p className="text-slate-300">{error}</p>
                    <button onClick={() => handleLogout()} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!currentUser || !currentUserDetails) {
        return <LoginPage />;
    }
    
    switch (page) {
      case Page.RoleSelection:
        return <RoleSelectionPage onSelectRole={handleRoleSelect} />;
      case Page.ChecklistSelection:
        return <ChecklistSelectionPage 
                    onSelectChecklist={handleChecklistSelect} 
                    onNavigateToHistory={() => setPage(Page.GameHistory)}
                    onNavigateToAdmin={() => setPage(Page.Admin)}
                    onBack={goBack}
                    onGoHome={goHome}
                    onLogout={() => handleLogout()}
                    role={role} 
                    currentUserRole={currentUserDetails.role}
                />;
       case Page.GameSetup:
        return <GameSetupPage 
          onSetupComplete={handleGameSetupComplete}
          savedGames={savedGames}
          onBack={goBack}
          operatorEmail={currentUserDetails.email}
        />;
      case Page.OperatorPreGame:
        if (!currentGameDetails) {
          setPage(Page.GameSetup);
          return null;
        }
        return <OperatorPreGamePage 
          onBack={goBack} 
          onHome={goHome} 
          gameDetails={currentGameDetails}
          onSaveGame={handleSaveGame} 
          onNavigateToPostGame={() => setPage(Page.PostGameSelection)}
        />;
      case Page.PostGameSelection:
        return <PostGameSelectionPage
                  savedGames={savedGames}
                  onSelectGame={handleGameSelectForPostGame}
                  onBack={goBack}
                />;
      case Page.OperatorPostGame:
        if (!currentGameDetails) {
          setPage(Page.PostGameSelection);
          return null;
        }
        return <OperatorPostGamePage 
                  onBack={goBack} 
                  onHome={goHome} 
                  gameDetails={currentGameDetails}
                  onFinish={handleFinishPostGame}
                />;
      case Page.GameHistory:
        return <GameHistoryPage 
                  savedGames={savedGames} 
                  onBack={goBack} 
                  onClearHistory={handleClearHistory} 
                  onUpdateGame={handleSaveGame}
                />;
      case Page.Admin:
        return <AdminPage 
                    onBack={goHome} 
                    onNavigateToLoginHistory={() => setPage(Page.LoginHistory)} 
                    loginHistoryCount={loginHistory.length}
                    authorizedUsers={authorizedUsers}
                    onUpdateUsers={handleUpdateUsers}
                />;
      case Page.LoginHistory:
        return <LoginHistoryPage loginHistory={loginHistory} onBack={() => setPage(Page.Admin)} />;
      case Page.CallerWorkInProgress:
        return <WIPPage onBack={goHome} onLogout={() => handleLogout()} roleName="קולר" />;
      default:
        return <RoleSelectionPage onSelectRole={handleRoleSelect} />;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 font-sans">
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
