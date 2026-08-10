import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  showInactivityWarning: boolean;
  extendSession: () => void;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000; // warn 2 minutes before

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    const savedUser = sessionStorage.getItem('user');
    if (token && savedUser) {
      setAccessToken(token);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  }, []);

  const logout = useCallback(() => {
    clearTimers();
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
    setShowInactivityWarning(false);
    window.location.href = '/login';
  }, [clearTimers]);

  const resetInactivityTimer = useCallback(() => {
    if (!user) return;
    clearTimers();
    setShowInactivityWarning(false);
    warningTimerRef.current = setTimeout(() => {
      setShowInactivityWarning(true);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT);
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [user, clearTimers, logout]);

  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Start / restart timers whenever user changes
  useEffect(() => {
    if (!user) {
      clearTimers();
      return;
    }
    resetInactivityTimer();

    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetInactivityTimer();
    EVENTS.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      clearTimers();
      EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [user, resetInactivityTimer, clearTimers]);

  const login = async (email: string, motDePasse: string) => {
    const response = await api.post('/auth/login', { email, motDePasse });
    const { accessToken, refreshToken, user } = response.data.data;
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(user));
    setAccessToken(accessToken);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading, showInactivityWarning, extendSession }}>
      {showInactivityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="text-4xl mb-4">⏰</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Session sur le point d'expirer</h2>
            <p className="text-gray-600 mb-6">
              Votre session expirera dans <strong>2 minutes</strong> pour inactivité.
              Voulez-vous rester connecté ?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={extendSession}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Rester connecté
              </button>
              <button
                onClick={logout}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}