import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { setAuthHandlers } from '../api/apiClient';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return user;
  return {
    ...user,
    name: user.name || [user.firstName, user.lastName].filter(Boolean).join(' '),
    username: user.username || user.userName,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true until bootstrap finishes

  // Access token lives only in memory (never localStorage / sessionStorage)
  const accessTokenRef = useRef(null);
  const navigate = useNavigate();

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setAccessToken = useCallback((token) => {
    accessTokenRef.current = token;
  }, []);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((currentUser) => currentUser ? { ...currentUser, ...updates } : currentUser);
  }, []);

  // ── Auth failure handler (called by apiClient interceptor) ─────────────────
  const handleAuthFailure = useCallback(
    (reason) => {
      clearAuth();
      if (reason === 'ACCOUNT_SUSPENDED') {
        navigate('/login?reason=suspended', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    },
    [clearAuth, navigate]
  );

  // Register handlers with apiClient once on mount
  useEffect(() => {
    setAuthHandlers({
      tokenGetter: () => accessTokenRef.current,
      authFailureHandler: handleAuthFailure,
    });
    // Expose the setter for the silent-refresh interceptor
    window.__setAccessToken = setAccessToken;
  }, [handleAuthFailure, setAccessToken]);

  // ── Bootstrap: try silent refresh on first load ────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1. Attempt refresh — uses HttpOnly cookie automatically
        const refreshRes = await apiClient.post('/auth/refresh');
        const token = refreshRes.data?.accessToken;
        if (!token) throw new Error('No token returned');
        setAccessToken(token);

        // 2. Fetch current user
        const meRes = await apiClient.get('/auth/me');
        setUser(normalizeUser(meRes.data?.user || meRes.data));
        setIsAuthenticated(true);
      } catch {
        // No valid session — treat as logged out, no error shown
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      const res = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user: returnedUser } = res.data;
      setAccessToken(accessToken);
      setUser(normalizeUser(returnedUser));
      setIsAuthenticated(true);
      return res.data;
    },
    [setAccessToken]
  );

  // ── register ───────────────────────────────────────────────────────────────
  // Registration does NOT automatically authenticate — the user must log in.
  const register = useCallback(async (payload) => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Even if the server call fails, clear client-side state
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
    }
  }, [clearAuth, navigate]);

  // ── refreshSession (manual, e.g. for silent background renewal) ────────────
  const refreshSession = useCallback(async () => {
    const refreshRes = await apiClient.post('/auth/refresh');
    const token = refreshRes.data?.accessToken;
    if (token) setAccessToken(token);
    return token;
  }, [setAccessToken]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
