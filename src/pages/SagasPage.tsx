import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, apiRequest, errorMessage, isAbortError } from '../api'
import { useToken } from '../auth'
import { LockedState } from '../components/LockedState'
import { EmptyState, ErrorState, PageLoader, formatBerries } from '../components/ui'
import { paletteStyle, sagasCache, storyCache, transitionNavigate } from '../sagas'
import type { SagaStory, SagaSummary } from '../types'
import { useResource } from '../useResource'

export function SagasPage() {
  const token = useToken()
  const navigate = useNavigate()
  const resource = useResource<SagaSummary[]>('/sagas', sagasCache.get(token))
  const [opening, setOpening] = useState('')
  const [error, setError] = useState('')
  const [locked, setLocked] = useState(false)
  const request = useRef<AbortController | null>(null)

  useEffect(() => {
    if (resource.data) sagasCache.set(token, resource.data)
  }, [token, resource.data])

  useEffect(() => () => request.current?.abort(), [])

  async function openSaga(event: MouseEvent<HTMLAnchorElement>, saga: SagaSummary) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    setOpening(saga.id)
    setError('')
    setLocked(false)
    try {
      const story = await apiRequest<SagaStory>(`/sagas/${encodeURIComponent(saga.id)}/story`, { token, signal: controller.signal })
      if (controller.signal.aborted) return
      storyCache.set(`${token}:${saga.id}`, story)
      transitionNavigate(navigate, `/sagas/${saga.id}`)
    } catch (reason: unknown) {
      if (isAbortError(reason)) return
      setLocked(reason instanceof ApiError && reason.status === 423)
      setError(errorMessage(reason))
    } finally {
      if (request.current === controller) {
        request.current = null
        setOpening('')
      }
    }
  }

  return (
    <div className="page-stack">
      <header className="page-hero"><div><span className="eyebrow">Archivo Poneglyph</span><h1>El Grand Line se lee navegando.</h1><p>Recorre las sagas de la Guild: una isla, una etapa y un nuevo rumbo en cada tramo.</p></div></header>
      {resource.locked || locked ? <LockedState message={resource.error || error} onRetry={() => { setLocked(false); setError(''); resource.retry() }} />
        : resource.error && !resource.data ? <ErrorState message={resource.error} onRetry={resource.retry} />
        : !resource.data ? <PageLoader />
        : resource.data.length === 0 ? <EmptyState title="No hay sagas disponibles" description="La Guild todavía no ha publicado historias para esta tripulación." />
        : <section className="sagas-grid" aria-label="Sagas disponibles">
          {[...resource.data].sort((a, b) => a.order - b.order).map((saga) => (
            <article className="saga-card" style={paletteStyle(saga.palette)} key={saga.id}>
              <span className="saga-number">{String(saga.order).padStart(2, '0')}</span>
              <div className="saga-card__route" aria-hidden="true"><span /><i /><span /><i /><span /></div>
              <p className="saga-subtitle">{saga.subtitle}</p>
              <h2 style={{ viewTransitionName: `saga-title-${saga.id}` }}>{saga.title}</h2>
              <p>{saga.synopsis}</p>
              <dl><div><dt>Etapas</dt><dd>{saga.stageCount}</dd></div><div><dt>Distancia</dt><dd>{formatBerries(saga.totalDistanceNm)} mn</dd></div></dl>
              <div className="saga-endpoints">{saga.firstIsland} → {saga.lastIsland}</div>
              <Link className="saga-open" to={`/sagas/${saga.id}`} onClick={(event) => { void openSaga(event, saga) }} aria-disabled={Boolean(opening)}>{opening === saga.id ? 'Consultando la carta…' : 'Explorar la saga →'}</Link>
            </article>
          ))}
        </section>}
      {error && !locked && <p className="form-error" role="alert">{error} Vuelve a abrir la saga para reintentar.</p>}
    </div>
  )
}
