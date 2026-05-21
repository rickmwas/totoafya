
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
      setUser(u);
      setIsAuthenticated(true);
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
    const u = await db.auth.me();
    setUser(u);
    setIsAuthenticated(true);
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
