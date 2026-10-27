import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TOKEN_STORAGE_KEY } from '../api/apiClient';
import { authService } from '../services/auth.service';
import type { LoginPayload, RegisterPayload, Team, User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  team: Team | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setTeam(null);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setTeam(data.team);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await authService.register(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setTeam(data.team);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setIsInitializing(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const me = await authService.getMe();
        if (isMounted) {
          setUser(me.user);
          setTeam(me.team);
          setToken(storedToken);
        }
      } catch {
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('logpose:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('logpose:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        team,
        token,
        isAuthenticated: !!token && !!user,
        isInitializing,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
