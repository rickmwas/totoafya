
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
  const [lockKey, setLockKey] = useState(null);

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

  // Helper to find the active Supabase auth token key in localStorage
  const getSupabaseAuthKey = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        return key;
      }
    }
    return null;
  };

  const lockSession = async () => {
    const authKey = getSupabaseAuthKey();
    if (!authKey) {
      setIsLocked(true);
      localStorage.setItem('nurse_session_locked', 'true');
      return;
    }

    const tokenVal = localStorage.getItem(authKey);
    if (!tokenVal) {
      setIsLocked(true);
      localStorage.setItem('nurse_session_locked', 'true');
      return;
    }

    try {
      // 1. Generate random key
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // 2. Encrypt tokenVal
      const enc = new TextEncoder();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(tokenVal)
      );

      // 3. Export key and serialize data to base64
      const rawKey = await window.crypto.subtle.exportKey('raw', key);
      const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
      const ivBase64 = btoa(String.fromCharCode(...iv));
      const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

      localStorage.setItem('nurse_encrypted_session', JSON.stringify({
        iv: ivBase64,
        ciphertext: cipherBase64
      }));
      localStorage.setItem('nurse_supabase_key_name', authKey);

      // Save key in memory
      setLockKey(keyBase64);

      // Wipe raw token from disk
      localStorage.removeItem(authKey);

      setIsLocked(true);
      localStorage.setItem('nurse_session_locked', 'true');
    } catch (err) {
      console.error("Failed to cryptographically lock session:", err);
      setIsLocked(true);
      localStorage.setItem('nurse_session_locked', 'true');
    }
  };

  const unlockWithPin = async (pin) => {
    if (!user) throw new Error('No active nurse session found');
    setIsLoadingAuth(true);
    try {
      // 1. Verify PIN via DB client
      const u = await db.auth.verifyNursePin(user.email, pin);

      // 2. Decrypt the session token
      const encryptedData = localStorage.getItem('nurse_encrypted_session');
      const targetKey = localStorage.getItem('nurse_supabase_key_name') || getSupabaseAuthKey();

      if (encryptedData && lockKey && targetKey) {
        const { iv, ciphertext } = JSON.parse(encryptedData);

        const keyData = new Uint8Array(atob(lockKey).split('').map(c => c.charCodeAt(0)));
        const key = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          'AES-GCM',
          true,
          ['decrypt']
        );

        const ivData = new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0)));
        const cipherData = new Uint8Array(atob(ciphertext).split('').map(c => c.charCodeAt(0)));

        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: ivData },
          key,
          cipherData
        );

        const tokenVal = new TextDecoder().decode(decrypted);
        localStorage.setItem(targetKey, tokenVal);

        // Cleanup encrypted state
        localStorage.removeItem('nurse_encrypted_session');
        localStorage.removeItem('nurse_supabase_key_name');
      }

      setUser(u);
      setIsLocked(false);
      localStorage.setItem('nurse_session_locked', 'false');
      setLockKey(null);
      setAuthError(null);
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nurse_session_locked');
    localStorage.removeItem('nurse_encrypted_session');
    localStorage.removeItem('nurse_supabase_key_name');
    db.auth.logout();
  };

  const navigateToLogin = () => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    window.location.href = '/login' + search;
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

