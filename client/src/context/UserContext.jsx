import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredUserId } from '../lib/identity.js';
import { ensureSession } from '../lib/session.js';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userId, setUserId] = useState(() => getStoredUserId());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await ensureSession();
      setUserId(data?.userId ?? getStoredUserId());
    } catch (e) {
      const msg = e.message ?? String(e);
      console.error('[BookshelfAi] Session failed:', msg, e);
      setError(msg);
      throw e;
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      /* error state set */
    });
  }, [refresh]);

  const value = useMemo(
    () => ({
      userId,
      sessionReady: ready,
      sessionError: error,
      refreshSession: refresh,
    }),
    [userId, ready, error, refresh]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
