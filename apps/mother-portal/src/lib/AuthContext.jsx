import React, { createContext, useState, useContext, useEffect } from 'react';
import db from '@/api/totoafyaClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ id: 'local', public_settings: {} });

  const isLocal = import.meta.env.VITE_DATABASE_PROVIDER === 'local' || !import.meta.env.VITE_DATABASE_PROVIDER;

  useEffect(() => {
    db.auth.me().then((u) => {
      if (u) {
        setUser(u);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        // If user is explicitly visiting /login, leave them unauthenticated so Login screen renders without authError
        if (typeof window !== 'undefined' && window.location.pathname === '/login') {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(null);
        } else if (isLocal && !localStorage.getItem('is_logged_out')) {
          // In local dev mode: auto-grant demo mother user so page never goes blank
          const defaultUser = db.auth.quickLogin ? db.auth.quickLogin('user') : null;
          if (defaultUser) {
            setUser(defaultUser);
            setIsAuthenticated(true);
            setAuthError(null);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setAuthError({ type: 'auth_required', message: 'Authentication required' });
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError({ type: 'auth_required', message: 'Authentication required' });
        }
      }
    }).catch((err) => {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: err?.message || 'Authentication failed' });
    }).finally(() => {
      setIsLoadingAuth(false);
    });
  }, [isLocal]);

  const logout = () => {
    db.auth.logout();
  };

  const navigateToLogin = () => {
    db.auth.redirectToLogin();
  };

  const checkAppState = async () => {
    try {
      const u = await db.auth.me();
      if (u) {
        setUser(u);
        setIsAuthenticated(true);
        setAuthError(null);
      } else if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({ type: 'auth_required' });
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required' });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
