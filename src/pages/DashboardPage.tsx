import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest, errorMessage, isAbortError } from '../api'
import { useToken } from '../auth'
import { EmptyState, ErrorState, StatusPill, formatBerries } from '../components/ui'
import type { DashboardSummary, LogPose } from '../types'

interface DashboardData {
  summary: DashboardSummary
  logPose: LogPose
}

const statusLabels = { AT_LARGE: 'En libertad', CAPTURED: 'Capturados', MISSING: 'Desaparecidos' }

export function DashboardPage() {
  const token = useToken()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    Promise.all([
      apiRequest<DashboardSummary>('/dashboard/summary', { token, signal: controller.signal }),
      apiRequest<LogPose>('/log-pose', { token, signal: controller.signal }),
    ])
      .then(([summary, logPose]) => { if (!controller.signal.aborted) setData({ summary, logPose }) })
      .catch((reason: unknown) => {
        if (!isAbortError(reason)) setError(errorMessage(reason))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [token, attempt])

  if (error && !data) return <ErrorState message={error} onRetry={retry} />

  return (
    <div className="page-stack">
      {error && data && <div className="inline-error" role="alert"><p>{error}</p><button className="button button--primary" type="button" onClick={retry}>Reintentar</button></div>}
      <header className="page-hero dashboard-hero">
        <div>
          <span className="eyebrow">Bitácora de navegación</span>
          <h1>{data ? `Buen viento, ${data.summary.team.name}` : 'Preparando la cubierta'}</h1>
          <p>Una lectura rápida del estado de tu workspace y el rumbo hacia Grand Line.</p>
        </div>
        <div className={data?.logPose.grandLineUnlocked ? 'log-pose log-pose--active' : 'log-pose'} aria-label="Estado del Log Pose">
          <div className="log-pose__dial"><span /><i /></div>
          <div>
            <small>Log Pose</small>
            <strong>{data?.logPose.grandLineUnlocked ? 'Sincronizado' : 'Bloqueado'}</strong>
            <p>{data?.logPose.message ?? 'Consultando coordenadas…'}</p>
          </div>
        </div>
      </header>

      {loading && !data ? <DashboardSkeleton /> : data && (
        <>
          {data.summary.wanted.total === 0 ? (
            <EmptyState
              title="El tablón todavía está vacío"
              description="No hay carteles disponibles en este workspace. Vuelve a intentarlo cuando la Guild cargue datos."
              action={<button className="button button--primary" type="button" onClick={retry}>Actualizar</button>}
            />
          ) : (
            <>
              <section className="stat-grid" aria-label="Indicadores">
                <article className="stat-card stat-card--featured">
                  <span>Total en recompensas</span>
                  <strong><small>฿</small>{formatBerries(data.summary.wanted.totalBounty)}</strong>
                  <p>{data.summary.wanted.total} carteles activos en el registro</p>
                </article>
                <article className="stat-card">
                  <span>Recompensa promedio</span>
                  <strong><small>฿</small>{formatBerries(data.summary.wanted.averageBounty)}</strong>
                  <p>Promedio del workspace</p>
                </article>
                <article className="stat-card">
                  <span>Tripulaciones</span>
                  <strong>{data.summary.crews.total}</strong>
                  <p>{data.summary.crews.mostWanted?.name ?? 'Sin datos'}</p>
                </article>
                <article className="stat-card">
                  <span>En libertad</span>
                  <strong>{data.summary.wanted.byStatus.AT_LARGE}</strong>
                  <p>Objetivos por localizar</p>
                </article>
              </section>

              <div className="dashboard-columns">
                <section className="panel">
                  <div className="section-heading">
                    <div><span className="eyebrow">Prioridad alta</span><h2>Mayores recompensas</h2></div>
                    <Link className="text-link" to="/wanted?sort=bounty%2Cdesc">Ver todos →</Link>
                  </div>
                  <div className="bounty-list">
                    {data.summary.topBounties.map((wanted, index) => (
                      <Link className="bounty-row" key={wanted.id} to={`/wanted/${wanted.id}`}>
                        <span className="bounty-row__rank">{String(index + 1).padStart(2, '0')}</span>
                        <span className="avatar-seal" aria-hidden="true">{wanted.name.slice(0, 1)}</span>
                        <span className="bounty-row__person"><strong>{wanted.name}</strong><small>“{wanted.epithet}” · {wanted.crew.name}</small></span>
                        <span className="bounty-row__amount">฿ {formatBerries(wanted.bounty)}</span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="section-heading"><div><span className="eyebrow">Estado del tablero</span><h2>Distribución</h2></div></div>
                  <div className="distribution-list">
                    {Object.entries(data.summary.wanted.byStatus).map(([status, value]) => (
                      <div className="distribution-row" key={status}>
                        <span>{statusLabels[status as keyof typeof statusLabels]}</span>
                        <div className="distribution-row__bar"><i style={{ width: `${Math.max(4, (value / data.summary.wanted.total) * 100)}%` }} /></div>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="fruit-summary">
                    {Object.entries(data.summary.wanted.byFruit).map(([fruit, value]) => (
                      <div key={fruit}><StatusPill tone="info">{fruit}</StatusPill><strong>{value}</strong></div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div aria-label="Cargando dashboard">
      <section className="stat-grid">
        {[0, 1, 2, 3].map((item) => <div className="stat-card skeleton" key={item}><i /><i /><i /></div>)}
      </section>
      <section className="panel skeleton skeleton--panel"><i /><i /><i /><i /></section>
    </div>
  )
}
