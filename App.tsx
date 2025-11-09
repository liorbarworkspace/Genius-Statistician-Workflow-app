import React, { useState, useCallback, useEffect } from 'react';
import { Page, Role, GameDetails } from './types';
import OperatorPreGamePage from './components/OperatorPreGamePage';
import OperatorPostGamePage from './components/OperatorPostGamePage';
import RoleSelectionPage from './components/RoleSelectionPage';
import ChecklistSelectionPage from './components/ChecklistSelectionPage';
import WIPPage from './components/WIPPage';
import GameSetupPage from './components/GameSetupPage';
import GameHistoryPage from './components/GameHistoryPage';
import PostGameSelectionPage from './components/PostGameSelectionPage';


function App() {
  const [page, setPage] = useState<Page>(Page.RoleSelection);
  const [role, setRole] = useState<Role>(Role.None);
  const [currentGameDetails, setCurrentGameDetails] = useState<GameDetails | null>(null);
  const [savedGames, setSavedGames] = useState<GameDetails[]>([]);
  const [operatorEmail, setOperatorEmail] = useState<string>('');

  // Load saved data and role from localStorage on mount
  useEffect(() => {
    try {
      const storedGames = localStorage.getItem('genius-workflow-saved-games');
      if (storedGames) {
        setSavedGames(JSON.parse(storedGames));
      }
      const storedEmail = localStorage.getItem('genius-workflow-operator-email');
      if (storedEmail) {
        setOperatorEmail(storedEmail);
      }
      const storedRole = localStorage.getItem('genius-workflow-role');
      if (storedRole && storedRole !== String(Role.None)) {
        const persistedRole = parseInt(storedRole) as Role;
        setRole(persistedRole);
        if (persistedRole === Role.Operator) {
            setPage(Page.ChecklistSelection);
        } else if (persistedRole === Role.Caller) {
            setPage(Page.CallerWorkInProgress);
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);
  
  // Save operator email to localStorage when it changes
  useEffect(() => {
    if (operatorEmail) {
        try {
            localStorage.setItem('genius-workflow-operator-email', operatorEmail);
        } catch (error) {
            console.error("Failed to save operator email to localStorage", error);
        }
    }
  }, [operatorEmail]);
  
  // Save role to localStorage when it changes
  useEffect(() => {
    try {
        localStorage.setItem('genius-workflow-role', String(role));
    } catch (error) {
        console.error("Failed to save role to localStorage", error);
    }
  }, [role]);


  // Update browser history when app state changes
  useEffect(() => {
    const state = { page, role, gameId: currentGameDetails?.id };
    if (history.state?.page !== page || history.state?.role !== role || history.state?.gameId !== currentGameDetails?.id) {
      window.history.pushState(state, '');
    }
  }, [page, role, currentGameDetails]);
    
  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // Listen for browser back/forward button clicks
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const savedRole = localStorage.getItem('genius-workflow-role');
      const defaultRole = savedRole ? (parseInt(savedRole) as Role) : Role.None;
      const defaultPage = defaultRole === Role.Operator ? Page.ChecklistSelection : defaultRole === Role.Caller ? Page.CallerWorkInProgress : Page.RoleSelection;

      if (event.state) {
        setPage(event.state.page ?? defaultPage);
        setRole(event.state.role ?? defaultRole);
      } else {
        setPage(defaultPage);
        setRole(defaultRole);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial state without pushing to history
    window.history.replaceState({ page, role }, '');

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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

  const handleSaveGame = useCallback((finalDetails: GameDetails) => {
    setSavedGames(prevGames => {
      const existingIndex = prevGames.findIndex(g => g.id === finalDetails.id);
      let newGames;
      if (existingIndex > -1) {
        newGames = [...prevGames];
        newGames[existingIndex] = finalDetails;
      } else {
        newGames = [finalDetails, ...prevGames].slice(0, 50); // Keep last 50 games
      }
      
      try {
        localStorage.setItem('genius-workflow-saved-games', JSON.stringify(newGames));
      } catch (error) {
        console.error("Failed to save games to localStorage", error);
      }
      
      return newGames;
    });
  }, []);

  const handleNavigateToPostGame = useCallback(() => {
    setPage(Page.PostGameSelection);
  }, []);
  
  const handleFinishPostGame = useCallback((finalDetails: GameDetails) => {
      handleSaveGame(finalDetails);
      setPage(Page.ChecklistSelection);
  }, [handleSaveGame]);

  const handleNavigateToHistory = useCallback(() => {
    setPage(Page.GameHistory);
  }, []);
  
  const handleClearHistory = useCallback(() => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל היסטוריית המשחקים? לא ניתן לשחזר פעולה זו.')) {
        setSavedGames([]);
        try {
            localStorage.removeItem('genius-workflow-saved-games');
        } catch (error) {
            console.error("Failed to clear game history from localStorage", error);
        }
    }
  }, []);


  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goHome = useCallback(() => {
    setPage(Page.RoleSelection);
    setRole(Role.None);
    setCurrentGameDetails(null);
    try {
        localStorage.removeItem('genius-workflow-role');
    } catch (error) {
        console.error("Failed to clear role from localStorage", error);
    }
  }, []);
  
  const renderPage = () => {
    switch (page) {
      case Page.RoleSelection:
        return <RoleSelectionPage onSelectRole={handleRoleSelect} />;
      case Page.ChecklistSelection:
        return <ChecklistSelectionPage 
                    onSelectChecklist={handleChecklistSelect} 
                    onNavigateToHistory={handleNavigateToHistory}
                    onBack={goBack}
                    onGoHome={goHome}
                    role={role} 
                />;
       case Page.GameSetup:
        return <GameSetupPage 
          onSetupComplete={handleGameSetupComplete}
          savedGames={savedGames}
          onBack={goBack}
          operatorEmail={operatorEmail}
          setOperatorEmail={setOperatorEmail}
        />;
      case Page.OperatorPreGame:
        if (!currentGameDetails) {
          // Fallback if details are missing
          setPage(Page.GameSetup);
          return null;
        }
        return <OperatorPreGamePage 
          onBack={goBack} 
          onHome={goHome} 
          gameDetails={currentGameDetails}
          onSaveGame={handleSaveGame} 
          onNavigateToPostGame={handleNavigateToPostGame}
        />;
      case Page.PostGameSelection:
        return <PostGameSelectionPage
                  savedGames={savedGames}
                  onSelectGame={handleGameSelectForPostGame}
                  onBack={goBack}
                />;
      case Page.OperatorPostGame:
        if (!currentGameDetails) {
          // Fallback if details are missing
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
      case Page.CallerWorkInProgress:
        return <WIPPage onBack={goHome} roleName="קולר" />;
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