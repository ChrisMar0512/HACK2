import { useEffect, useLayoutEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, errorMessage, isAbortError } from '../api'
import { useToken } from '../auth'
import { ErrorState, PageLoader, StatusPill, formatBerries, formatDate } from '../components/ui'
import type { WantedDetail } from '../types'
import { fruitLabels, roleLabels, wantedStatusLabels, wantedStatusTones } from '../wanted'

interface DetailLocationState {
  fromSearch?: string
  fromList?: boolean
}

export function WantedDetailPage() {
  const { id } = useParams()
  const token = useToken()
  const location = useLocation()
  const navigate = useNavigate()
  const [wanted, setWanted] = useState<WantedDetail | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [id])

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setError('')
    setWanted(null)
    apiRequest<WantedDetail>(`/wanted/${encodeURIComponent(id)}`, { token, signal: controller.signal })
      .then((response) => { if (!controller.signal.aborted) setWanted(response) })
      .catch((reason: unknown) => {
        if (!isAbortError(reason)) setError(errorMessage(reason))
      })
    return () => controller.abort()
  }, [id, token, attempt])

  const state = location.state as DetailLocationState | null
  const listUrl = state?.fromSearch ? `/wanted?${state.fromSearch}` : '/wanted'

  if (error && !wanted) return <ErrorState message={error} onRetry={() => setAttempt((value) => value + 1)} />
  if (!wanted || wanted.id !== id) return <PageLoader />

  return (
    <div className="page-stack detail-page">
      <button className="back-link" type="button" onClick={() => state?.fromList ? navigate(-1) : navigate(listUrl)}>← Volver al listado</button>

      <section className="wanted-detail">
        <div className="wanted-detail__poster">
          <span className="poster-kicker">WANTED</span>
          <div className="poster-portrait" aria-hidden="true"><span>{wanted.name.slice(0, 1)}</span><i /></div>
          <span className="poster-dead">DEAD OR ALIVE</span>
          <h1>{wanted.name}</h1>
          <p>“{wanted.epithet}”</p>
          <strong>฿ {formatBerries(wanted.bounty)}</strong>
          <small>MARINE GUILD</small>
        </div>

        <div className="wanted-detail__content">
          <div className="detail-heading">
            <div><span className="eyebrow">Expediente {wanted.id}</span><h2>{wanted.name}</h2><p>{wanted.crew.name} · {roleLabels[wanted.role]}</p></div>
            <StatusPill tone={wantedStatusTones[wanted.status]}>{wantedStatusLabels[wanted.status]}</StatusPill>
          </div>

          <p className="detail-bio">{wanted.bio}</p>

          <dl className="detail-facts">
            <div><dt>Edad</dt><dd>{wanted.age} años</dd></div>
            <div><dt>Estatura</dt><dd>{wanted.heightCm} cm</dd></div>
            <div><dt>Fruta</dt><dd>{wanted.devilFruit ? `${wanted.devilFruit.name} · ${fruitLabels[wanted.devilFruit.type]}` : 'Ninguna registrada'}</dd></div>
            <div><dt>Nivel de amenaza</dt><dd>{wanted.threatLevel} / 5</dd></div>
            <div><dt>Visto por última vez</dt><dd>{wanted.lastSeen.island}</dd></div>
            <div><dt>Fecha del avistamiento</dt><dd>{formatDate(wanted.lastSeen.seenAt)}</dd></div>
          </dl>

          <section className="history-section">
            <div className="section-heading"><div><span className="eyebrow">Registro histórico</span><h3>Evolución de la recompensa</h3></div></div>
            <div className="history-list">
              {wanted.bountyHistory.map((entry, index) => (
                <div key={`${entry.issuedAt}-${entry.amount}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i aria-hidden="true" />
                  <time dateTime={entry.issuedAt}>{formatDate(entry.issuedAt)}</time>
                  <strong>฿ {formatBerries(entry.amount)}</strong>
                </div>
              ))}
            </div>
          </section>

          <Link className="text-link" to={listUrl}>Ver otros carteles →</Link>
        </div>
      </section>
    </div>
  )
}
