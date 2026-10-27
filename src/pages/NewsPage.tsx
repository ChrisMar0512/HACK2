import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { ApiError, apiRequest, errorMessage, isAbortError, toQuery } from '../api'
import { useToken } from '../auth'
import { LockedState } from '../components/LockedState'
import { EmptyState, StatusPill, formatDate } from '../components/ui'
import { matchesNews, newsPriorities, newsStatuses, newsStatusTones, newsTypes, parseNewsFilters } from '../news'
import type { NewsDetail, NewsFeed, NewsItem } from '../types'

export interface NewsOutletContext {
  updateNews: (item: NewsDetail) => void
}

interface FeedState {
  key: string
  items: NewsItem[]
  cursor: string | null
  hasMore: boolean
  initialized: boolean
}

export function NewsPage() {
  const token = useToken()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const filterKey = toQuery(parseNewsFilters(searchParams))
  const filters = useMemo(() => parseNewsFilters(new URLSearchParams(filterKey)), [filterKey])
  const [feed, setFeed] = useState<FeedState>({ key: filterKey, items: [], cursor: null, hasMore: true, initialized: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [locked, setLocked] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  const inFlight = useRef<AbortController | null>(null)
  const activeKey = useRef(filterKey)
  const currentFeed = useRef(feed)
  const detailOpen = location.pathname !== '/news' && location.pathname !== '/news/'
  const visibleFeed = feed.key === filterKey ? feed : null

  useEffect(() => {
    activeKey.current = filterKey
    inFlight.current?.abort()
    inFlight.current = null
    const empty: FeedState = { key: filterKey, items: [], cursor: null, hasMore: true, initialized: false }
    currentFeed.current = empty
    setFeed(empty)
    setError('')
    setLocked(false)
    setLoading(false)
    return () => {
      activeKey.current = ''
      inFlight.current?.abort()
      inFlight.current = null
    }
  }, [filterKey, token])

  const loadMore = useCallback(async () => {
    const snapshot = currentFeed.current
    if (activeKey.current !== filterKey || inFlight.current || !snapshot.hasMore) return
    const controller = new AbortController()
    inFlight.current = controller
    setLoading(true)
    setError('')
    setLocked(false)
    try {
      const query = toQuery({ ...filters, limit: 20, cursor: snapshot.cursor ?? undefined })
      const response = await apiRequest<NewsFeed>(`/news/feed${query}`, { token, signal: controller.signal })
      if (controller.signal.aborted || activeKey.current !== filterKey) return
      const items = new Map(currentFeed.current.items.map((item) => [item.id, item]))
      response.items.forEach((item) => {
        if (!items.has(item.id)) items.set(item.id, item)
      })
      const next: FeedState = {
        key: filterKey, items: [...items.values()], cursor: response.nextCursor,
        hasMore: response.hasMore && response.nextCursor !== null,
        initialized: true,
      }
      currentFeed.current = next
      setFeed(next)
    } catch (reason: unknown) {
      if (isAbortError(reason) || controller.signal.aborted || activeKey.current !== filterKey) return
      setLocked(reason instanceof ApiError && reason.status === 423)
      setError(errorMessage(reason))
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null
        setLoading(false)
      }
    }
  }, [filterKey, filters, token])

  useEffect(() => { void loadMore() }, [loadMore])

  useEffect(() => {
    const target = sentinel.current
    if (!target || detailOpen || loading || error || !visibleFeed?.hasMore) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadMore()
    }, { rootMargin: '350px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [detailOpen, loading, error, visibleFeed?.hasMore, visibleFeed?.items.length, loadMore])

  const updateNews = useCallback((item: NewsDetail) => {
    const snapshot = currentFeed.current
    const next = { ...snapshot, items: snapshot.items.map((entry) => entry.id === item.id ? item : entry).filter((entry) => matchesNews(entry, filters)) }
    currentFeed.current = next
    setFeed(next)
  }, [filters])

  function changeFilter(key: string, value: string) {
    inFlight.current?.abort()
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  return (
    <div className="page-stack">
      <header className="page-hero page-hero--compact">
        <div><span className="eyebrow">Grand Line · News Coo</span><h1>La voz de los cuatro mares</h1><p>Noticias, descubrimientos y rumores. La próxima edición llega al final del recorrido.</p></div>
        <span className="edition-stamp">GACETA<br />DE LA GUILD</span>
      </header>

      <section className="filter-panel news-filters" aria-label="Filtros de noticias">
        {Object.entries({ type: { label: 'Tipo', values: newsTypes }, priority: { label: 'Prioridad', values: newsPriorities }, status: { label: 'Estado', values: newsStatuses } }).map(([key, config]) => (
          <label className="compact-field" key={key}><span>{config.label}</span><select value={filters[key] ?? ''} onChange={(event) => changeFilter(key, event.target.value)}><option value="">Todos</option>{Object.entries(config.values).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        ))}
        <button className="button button--ghost" type="button" onClick={() => setSearchParams({})}>Limpiar</button>
      </section>

      {locked ? <LockedState message={error} onRetry={() => { void loadMore() }} /> : (
        <>
          <section className="news-list" aria-label="Noticias del mundo" aria-busy={loading}>
            {visibleFeed?.items.map((item) => (
              <article className="news-card" key={item.id}>
                <div className="news-card__meta"><span>{newsTypes[item.type]}</span><time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time><StatusPill tone={newsStatusTones[item.status]}>{newsStatuses[item.status]}</StatusPill></div>
                <Link to={{ pathname: `/news/${item.id}`, search: filterKey }} state={{ fromFeed: true }}><h2>{item.title}</h2><p>{item.summary}</p></Link>
                <div className="news-card__footer"><span>{item.source} · {item.island}</span><StatusPill tone={item.priority === 'CRITICAL' || item.priority === 'HIGH' ? 'danger' : 'neutral'}>Prioridad {newsPriorities[item.priority]}</StatusPill></div>
              </article>
            ))}
            {(!visibleFeed?.initialized && !error) && Array.from({ length: 3 }, (_, index) => <div className="news-card skeleton" key={index}><i /><i /><i /></div>)}
          </section>
          {error && <div className="inline-error" role="alert"><p>{error}</p><button className="button button--primary" type="button" onClick={() => { void loadMore() }}>Reintentar carga</button></div>}
          {visibleFeed?.initialized && visibleFeed.items.length === 0 && !error && <EmptyState title="El News Coo no trajo noticias" description="Prueba otra combinación de filtros." />}
          <div ref={sentinel} className="feed-sentinel" role="status" aria-live="polite">
            {loading ? 'El News Coo está en camino…' : visibleFeed?.initialized && !visibleFeed.hasMore ? 'Llegaste a la última edición.' : ''}
          </div>
        </>
      )}
      <Outlet context={{ updateNews } satisfies NewsOutletContext} />
    </div>
  )
}
