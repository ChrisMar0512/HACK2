import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiRequest, ApiError } from './api'
import type { LoginResponse, MeResponse, Team, User } from './types'

const TOKEN_KEY = 'log-pose-token'

interface Session {
  token: string
  user: User
  team: Team
  expiresAt: string
}

interface AuthContextValue {
  status: 'loading' | 'authenticated' | 'anonymous'
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  register: (teamName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')
  const [session, setSession] = useState<Session | null>(null)

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setSession(null)
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    window.addEventListener('auth:invalid', clearSession)
    return () => window.removeEventListener('auth:invalid', clearSession)
  }, [clearSession])

  useEffect(() => {
    const controller = new AbortController()
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setStatus('anonymous')
      return () => controller.abort()
    }

    apiRequest<MeResponse>('/auth/me', { token, signal: controller.signal })
      .then((me) => {
        setSession({ token, ...me })
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        localStorage.removeItem(TOKEN_KEY)
        setSession(null)
        setStatus('anonymous')
      })

    return () => controller.abort()
  }, [])

  const storeLogin = useCallback((response: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token)
    setSession({
      token: response.token,
      user: response.user,
      team: response.team,
      expiresAt: response.expiresAt,
    })
    setStatus('authenticated')
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    storeLogin(response)
  }, [storeLogin])

  const register = useCallback(async (teamName: string, email: string, password: string) => {
    const response = await apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: { teamName, email, password },
    })
    storeLogin(response)
  }, [storeLogin])

  const value = useMemo<AuthContextValue>(() => ({
    status,
    session,
    login,
    register,
    logout: clearSession,
  }), [status, session, login, register, clearSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

export function useToken(): string {
  const { session } = useAuth()
  if (!session) throw new ApiError(401, { code: 'UNAUTHORIZED', message: 'Sesión no disponible.' })
  return session.token
}
