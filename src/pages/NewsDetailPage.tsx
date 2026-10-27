import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { apiRequest, errorMessage, isAbortError } from '../api'
import { useToken } from '../auth'
import { LockedState } from '../components/LockedState'
import { ErrorState, PageLoader, StatusPill, formatDate } from '../components/ui'
import { newsPriorities, newsStatuses, newsStatusTones, newsTypes } from '../news'
import type { NewsDetail, NewsStatus } from '../types'
import { useResource } from '../useResource'
import type { NewsOutletContext } from './NewsPage'

export function NewsDetailPage() {
  const { id = '' } = useParams()
  const token = useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const { updateNews } = useOutletContext<NewsOutletContext>()
  const resource = useResource<NewsDetail>(`/news/${encodeURIComponent(id)}`)
  const [updated, setUpdated] = useState<NewsDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const request = useRef<AbortController | null>(null)
  const dialog = useRef<HTMLElement>(null)
  const news = updated?.id === id ? updated : resource.data

  useEffect(() => {
    request.current?.abort()
    request.current = null
    setUpdated(null)
    setSaving(false)
    setSaveError('')
    setConfirmation('')
  }, [id])

  const close = useCallback(() => {
    const state = location.state as { fromFeed?: boolean } | null
    if (state?.fromFeed) navigate(-1)
    else navigate(`/news${location.search}`, { replace: true })
  }, [location.state, location.search, navigate])

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const scrollY = window.scrollY
    const overflow = document.body.style.overflow
    const paddingRight = document.body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbar}px`
    dialog.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key !== 'Tab') return
      const controls = dialog.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      request.current?.abort()
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      window.scrollTo({ top: scrollY, behavior: 'instant' })
      previousFocus?.focus({ preventScroll: true })
    }
  }, [close])

  async function verify(status: Exclude<NewsStatus, 'RUMOR'>) {
    if (!news || news.status !== 'RUMOR' || request.current) return
    const controller = new AbortController()
    request.current = controller
    setSaving(true)
    setSaveError('')
    setConfirmation('')
    try {
      const response = await apiRequest<NewsDetail>(`/news/${encodeURIComponent(id)}/status`, {
        method: 'PATCH', token, body: { status }, signal: controller.signal,
      })
      if (controller.signal.aborted) return
      setUpdated(response)
      updateNews(response)
      setConfirmation(`Noticia ${newsStatuses[response.status].toLowerCase()} correctamente.`)
    } catch (reason: unknown) {
      if (!isAbortError(reason) && !controller.signal.aborted) setSaveError(`${errorMessage(reason)} Puedes volver a intentarlo.`)
    } finally {
      if (request.current === controller) {
        request.current = null
        if (!controller.signal.aborted) setSaving(false)
      }
    }
  }

  return (
    <div className="modal-backdrop">
      <section ref={dialog} className="news-dialog" role="dialog" aria-modal="true" aria-labelledby="news-detail-title" tabIndex={-1}>
        <div className="dialog-top"><span className="eyebrow">News Coo · expediente</span><button className="button button--ghost" type="button" onClick={close} aria-label="Cerrar noticia">Cerrar ×</button></div>
        {resource.locked ? <><h1 id="news-detail-title" className="sr-only">Acceso a noticias</h1><LockedState message={resource.error} onRetry={resource.retry} /></>
          : resource.error && !news ? <><h1 id="news-detail-title" className="sr-only">Error al abrir noticia</h1><ErrorState message={resource.error} onRetry={resource.retry} /></>
          : !news ? <><h1 id="news-detail-title" className="sr-only">Cargando noticia</h1><PageLoader /></>
          : <>
            <div className="news-card__meta"><span>{newsTypes[news.type]}</span><StatusPill tone={newsStatusTones[news.status]}>{newsStatuses[news.status]}</StatusPill><span>Prioridad {newsPriorities[news.priority]}</span></div>
            <h1 id="news-detail-title">{news.title}</h1>
            <p className="news-lead">{news.summary}</p>
            <div className="news-byline">{news.source} · {news.island} · {formatDate(news.publishedAt)}</div>
            <div className="news-body">{news.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            {news.relatedWanted && <Link className="text-link" to={`/wanted/${news.relatedWanted.id}`}>Ver cartel de {news.relatedWanted.name} →</Link>}
            <section className="verification-panel">
              <h2>Verificación de la Guild</h2>
              {news.status === 'RUMOR' ? <><p>Esta noticia todavía es un rumor. Elige un resultado después de revisar su contenido.</p><div className="action-row"><button className="button button--primary" disabled={saving} type="button" onClick={() => { void verify('CONFIRMED') }}>{saving ? 'Verificando…' : 'Confirmar noticia'}</button><button className="button button--ghost" disabled={saving} type="button" onClick={() => { void verify('DEBUNKED') }}>Desmentir rumor</button></div></>
                : <p>Estado: <strong>{newsStatuses[news.status]}</strong>{news.verifiedAt ? ` · ${formatDate(news.verifiedAt)}` : ''}</p>}
              {saveError && <p className="form-error" role="alert">{saveError}</p>}
              {confirmation && <p className="success-message" role="status">{confirmation}</p>}
            </section>
          </>}
      </section>
    </div>
  )
}
