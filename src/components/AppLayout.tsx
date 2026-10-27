import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, apiRequest } from '../api'
import { useAuth, useToken } from '../auth'
import type { LogPose } from '../types'
import { StatusPill } from './ui'

const navItems = [
  { to: '/', label: 'Bitácora', end: true },
  { to: '/wanted', label: 'Se busca', end: false },
  { to: '/news', label: 'News Coo', end: false },
  { to: '/sagas', label: 'Poneglyph', end: false },
]

export function AppLayout() {
  const { session, logout } = useAuth()
  const token = useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logPose, setLogPose] = useState<LogPose | null>(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const recheck = () => setRefresh((value) => value + 1)
    window.addEventListener('focus', recheck)
    window.addEventListener('logpose:refresh', recheck)
    return () => {
      window.removeEventListener('focus', recheck)
      window.removeEventListener('logpose:refresh', recheck)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    apiRequest<LogPose>('/log-pose', { token, signal: controller.signal })
      .then(setLogPose)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) logout()
      })
    return () => controller.abort()
  }, [token, logout, location.pathname, refresh])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/" aria-label="Ir al tablero">
          <span className="brand__mark" aria-hidden="true"><i /></span>
          <span><strong>LOG POSE</strong><small>Guild Console</small></span>
        </NavLink>

        <button
          className="menu-button"
          type="button"
          aria-label="Abrir navegación"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>

        <nav className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}
            >
              {item.label}
            </NavLink>
          ))}
          <button className="mobile-logout button button--ghost" type="button" onClick={handleLogout}>Cerrar sesión</button>
        </nav>

        <div className="crew-menu">
          <div className="crew-menu__info">
            <StatusPill tone={logPose?.grandLineUnlocked ? 'success' : 'warning'}>
              {logPose?.grandLineUnlocked ? 'Log Pose activo' : 'East Blue'}
            </StatusPill>
            <strong>{session?.team.name}</strong>
            <span>{session?.team.code}</span>
          </div>
          <button className="icon-button" type="button" onClick={handleLogout} title="Cerrar sesión" aria-label="Cerrar sesión">↗</button>
        </div>
      </header>

      <main className="main-content">
        <Outlet context={{ logPose }} />
      </main>

      <footer className="footer">
        <span>Guild de Cazarrecompensas</span>
        <span>Rumbo verificado · datos de la API</span>
      </footer>
    </div>
  )
}
