
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

  useEffect(() => {
    db.auth.me().then((u) => {
      if (u) {
        setUser(u);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        // If user explicitly navigated to /login, leave them unauthenticated so Login screen renders
        if (typeof window !== 'undefined' && window.location.pathname === '/login') {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(null);
        } else {
          // In local mode: auto-grant default user so they are never blocked
          const isLocal = import.meta.env.VITE_DATABASE_PROVIDER === 'local' || !import.meta.env.VITE_DATABASE_PROVIDER;
          if (isLocal && db.auth.quickLogin) {
            const defaultUser = db.auth.quickLogin('user');
            setUser(defaultUser);
            setIsAuthenticated(true);
            setAuthError(null);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
    }).catch(() => {
      setIsAuthenticated(false);
    }).finally(() => {
      setIsLoadingAuth(false);
    });
  }, []);

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
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
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
