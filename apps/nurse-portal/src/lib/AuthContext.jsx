
import React, { createContext, useState, useContext, useEffect } from 'react';
import db from '@/api/totoafyaClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ id: 'local', public_settings: {} });

  useEffect(() => {
    db.auth.me().then((u) => {
      if (u) {
        if (u.role === 'nurse') {
          setUser(u);
          setIsAuthenticated(true);
          setAuthError(null);
          // Check if session was locked previously in local storage
          setIsLocked(localStorage.getItem('nurse_session_locked') === 'true');
        } else {
          setUser(u);
          setIsAuthenticated(false);
          setAuthError({ type: 'user_not_registered', message: 'Access denied: Nurse role required.' });
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    }).catch((err) => {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: err?.message || 'Authentication failed' });
    }).finally(() => {
      setIsLoadingAuth(false);
    });
  }, []);

  const loginWithBadge = async (badgeToken) => {
    setIsLoadingAuth(true);
    try {
      const u = await db.auth.loginNurseWithBadge(badgeToken);
      setUser(u);
      setIsAuthenticated(true);
      setIsLocked(false);
      localStorage.setItem('nurse_session_locked', 'false');
      setAuthError(null);
    } catch (err) {
      setAuthError({ type: 'auth_failed', message: err.message || 'Badge login failed' });
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const lockSession = () => {
    setIsLocked(true);
    localStorage.setItem('nurse_session_locked', 'true');
  };

  const unlockWithPin = async (pin) => {
    if (!user) throw new Error('No active nurse session found');
    setIsLoadingAuth(true);
    try {
      const u = await db.auth.verifyNursePin(user.email, pin);
      setUser(u);
      setIsLocked(false);
      localStorage.setItem('nurse_session_locked', 'false');
      setAuthError(null);
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nurse_session_locked');
    db.auth.logout();
  };

  const navigateToLogin = () => {
    db.auth.redirectToLogin();
  };

  const checkAppState = async () => {
    try {
      const u = await db.auth.me();
      if (u) {
        if (u.role === 'nurse') {
          setUser(u);
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          setUser(u);
          setIsAuthenticated(false);
          setAuthError({ type: 'user_not_registered' });
        }
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
      isLocked,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      loginWithBadge,
      lockSession,
      unlockWithPin,
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

