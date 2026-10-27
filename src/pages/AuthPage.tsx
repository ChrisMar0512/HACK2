import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api'
import { useAuth } from '../auth'
import { ErrorState, PageLoader, Spinner } from '../components/ui'

interface LocationState {
  from?: { pathname: string; search: string; hash: string }
}

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { status, login, register, restoreError, retryRestore } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [teamName, setTeamName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const state = location.state as LocationState | null
  const target = state?.from ? `${state.from.pathname}${state.from.search}${state.from.hash}` : '/'
  if (status === 'loading') return restoreError ? <ErrorState message={restoreError} onRetry={retryRestore} /> : <PageLoader />
  if (status === 'authenticated') return <Navigate to={target} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')
    setFieldErrors({})
    try {
      if (mode === 'register') await register(teamName.trim(), email.trim(), password)
      else await login(email.trim(), password)
      navigate(target, { replace: true })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const nextErrors: Record<string, string> = {}
        error.details.forEach((detail) => { nextErrors[detail.field] = detail.message })
        if (error.code === 'EMAIL_ALREADY_REGISTERED') nextErrors.email = error.message
        if (error.code === 'TEAM_NAME_TAKEN') nextErrors.teamName = error.message
        if (error.code === 'INVALID_CREDENTIALS') {
          nextErrors.email = 'Revisa el email de la tripulación.'
          nextErrors.password = 'La contraseña no coincide.'
        }
        setFieldErrors(nextErrors)
        setFormError(error.message)
      } else {
        setFormError('No pudimos completar la solicitud.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isRegister = mode === 'register'
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Bienvenida">
        <Link className="brand brand--light" to="/">
          <span className="brand__mark" aria-hidden="true"><i /></span>
          <span><strong>LOG POSE</strong><small>Guild Console</small></span>
        </Link>
        <div className="auth-story__content">
          <span className="eyebrow eyebrow--light">Rumbo al Grand Line</span>
          <h1>Todo gran viaje empieza con una coordenada.</h1>
          <p>Registra tu tripulación, consulta los carteles y sigue únicamente el rumbo más reciente.</p>
        </div>
        <div className="sea-lines" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Acceso de tripulación</span>
          <h2>{isRegister ? 'Registra tu bandera' : 'Vuelve a cubierta'}</h2>
          <p className="muted">{isRegister ? 'Una sola cuenta compartida por los tres integrantes.' : 'Usa las credenciales oficiales de tu equipo.'}</p>

          <form onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <label className="field">
                <span>Nombre de la tripulación</span>
                <input value={teamName} onChange={(event) => setTeamName(event.target.value)} minLength={3} maxLength={40} required autoComplete="organization" />
                {fieldErrors.teamName && <small className="field__error">{fieldErrors.teamName}</small>}
              </label>
            )}
            <label className="field">
              <span>Email de la tripulación</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              {fieldErrors.email && <small className="field__error">{fieldErrors.email}</small>}
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={isRegister ? 8 : 1} maxLength={72} required autoComplete={isRegister ? 'new-password' : 'current-password'} />
              {fieldErrors.password && <small className="field__error">{fieldErrors.password}</small>}
            </label>

            {formError && <div className="form-error" role="alert">{formError}</div>}
            <button className="button button--primary button--wide" type="submit" disabled={submitting}>
              {submitting && <Spinner label="Enviando" />}
              {isRegister ? 'Crear tripulación' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? '¿Ya tienen cuenta?' : '¿Todavía no tienen bandera?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} state={location.state}>{isRegister ? 'Iniciar sesión' : 'Registrarse'}</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
