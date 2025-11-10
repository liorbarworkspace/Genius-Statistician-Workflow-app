
import React, { useState } from 'react';
import Logo from './Logo';
import { signInWithGoogle } from '../services/authService';

const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // On success, the App component's onAuthStateChanged listener will handle navigation.
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Google Sign-In Error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md text-center">
        <Logo className="w-20 h-20 mx-auto mb-4 text-blue-400" />
        <h1 className="text-4xl font-bold text-white">Genius Stats Hub</h1>
        <p className="text-slate-400 mt-2 mb-8">Sign in to continue</p>
        
        <div className="bg-slate-800 p-8 rounded-lg shadow-2xl">
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm mb-6">
                    <p className="font-bold">Login Failed</p>
                    <p>{error}</p>
                </div>
            )}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                <>
                  <svg className="w-6 h-6" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.8 0 256S110.3 0 244 0c73 0 134.3 29.3 178.6 71.9l-62.9 61.3C337 99.6 293.7 75.2 244 75.2 148.6 75.2 73 152.8 73 256s75.6 180.8 171 180.8c90.4 0 135.5-62.2 141.4-95.2h-141.4v-73.6h236.4c1.2 12.3 1.8 25.4 1.8 38.9z"></path>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
