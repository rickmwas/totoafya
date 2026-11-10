import { useState, useEffect, useCallback } from 'react';

/**
 * useOnlineStatus Hook
 *
 * Detects online/offline connectivity changes in the browser.
 * Provides real-time network status, manual connectivity re-check,
 * and graceful fallback for server-side rendering or test environments.
 */
export function useOnlineStatus(initialStatus = null) {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof initialStatus === 'boolean') {
      return initialStatus;
    }
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });

  const [lastChangedAt, setLastChangedAt] = useState(() => new Date());

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastChangedAt(new Date());
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setLastChangedAt(new Date());
  }, []);

  const checkConnection = useCallback(async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      const current = navigator.onLine;
      setIsOnline(current);
      setLastChangedAt(new Date());
      return current;
    }
    return true;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    lastChangedAt,
    checkConnection,
  };
}

export default useOnlineStatus;
