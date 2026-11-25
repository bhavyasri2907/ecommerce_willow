import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onUnauthorized, tokenStore } from '../services/api.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

/**
 * The signed-in seller. `status` is 'loading' while a saved session is checked with
 * the server, then 'ready'; `seller` is null when nobody is signed in. `signedOut` is true
 * when that is because the seller chose to sign out.
 */
export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null);
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'loading' : 'ready'));
  // True after the seller chose "Sign out" (as opposed to their session expiring).
  const [signedOut, setSignedOut] = useState(false);

  // Restore the session saved in this browser, if the server still accepts it.
  useEffect(() => {
    if (!tokenStore.get()) return undefined;
    let cancelled = false;
    authService
      .me()
      .then((me) => !cancelled && setSeller(me))
      .catch(() => {}) // a 401 is handled below; a server that is down just leaves us signed out for now
      .finally(() => !cancelled && setStatus('ready'));
    return () => {
      cancelled = true;
    };
  }, []);

  // Any API call answered with 401 means the session is gone: drop it and show the sign-in page.
  useEffect(
    () =>
      onUnauthorized(() => {
        tokenStore.clear();
        setSeller(null);
      }),
    []
  );

  const startSession = useCallback(({ token, seller: signedIn }) => {
    tokenStore.set(token);
    setSeller(signedIn);
    setSignedOut(false);
    return signedIn;
  }, []);

  const login = useCallback(
    (email, password) => authService.login(email, password).then(startSession),
    [startSession]
  );

  const register = useCallback((details) => authService.register(details).then(startSession), [startSession]);

  /** Signs out here straight away, then tells the server to end the session. */
  const logout = useCallback(() => {
    const token = tokenStore.get();
    tokenStore.clear();
    setSeller(null);
    setSignedOut(true);
    if (token) authService.logout(token).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ seller, status, signedOut, login, register, logout }),
    [seller, status, signedOut, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
