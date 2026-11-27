import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStore } from '../services/api.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

/**
 * Who is signed in. `status` is 'loading' while a saved session is being checked
 * with the server, then 'ready'; `user` is null when nobody is signed in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'loading' : 'ready'));

  // Restore the session saved in this browser, if the server still accepts it.
  useEffect(() => {
    if (!tokenStore.get()) return undefined;
    let cancelled = false;

    authService
      .me()
      .then((customer) => !cancelled && setUser(customer))
      .catch((error) => {
        // Only an explicit "not signed in" ends the session; a server that is down does not.
        if (error.status === 401) tokenStore.clear();
      })
      .finally(() => !cancelled && setStatus('ready'));

    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback(({ token, customer }) => {
    tokenStore.set(token);
    setUser(customer);
    return customer;
  }, []);

  const login = useCallback(
    (email, password) => authService.login(email, password).then(startSession),
    [startSession]
  );

  const register = useCallback(
    (details) => authService.register(details).then(startSession),
    [startSession]
  );

  /** Signs out here straight away, then tells the server to end the session. */
  const logout = useCallback(() => {
    const token = tokenStore.get();
    tokenStore.clear();
    setUser(null);
    if (token) authService.logout(token).catch(() => {});
  }, []);

  /** Saves profile changes and shows them everywhere straight away. */
  const updateProfile = useCallback(
    (details) => authService.updateProfile(details).then((customer) => {
      setUser(customer);
      return customer;
    }),
    []
  );

  const value = useMemo(
    () => ({ user, status, login, register, logout, updateProfile }),
    [user, status, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
