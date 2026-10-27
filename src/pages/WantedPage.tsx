import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiRequest, errorMessage, isAbortError, toQuery } from '../api'
import { useToken } from '../auth'
import { EmptyState, ErrorState, StatusPill, formatBerries } from '../components/ui'
import type { Crew, WantedPage as WantedPageData } from '../types'
import { fruitLabels, wantedStatusLabels, wantedStatusTones } from '../wanted'

const validStatuses = new Set(['AT_LARGE', 'CAPTURED', 'MISSING'])
const validFruits = new Set(['PARAMECIA', 'ZOAN', 'LOGIA', 'NONE'])
const validSorts = new Set(['bounty,desc', 'name,asc', 'updatedAt,desc'])
const validSizes = new Set([10, 20, 50])

interface WantedFilters {
  page: number
  size: number
  status?: string
  crewId?: string
  fruit?: string
  q?: string
  sort: string
}

function parseFilters(search: URLSearchParams): WantedFilters {
  const rawPage = Number(search.get('page'))
  const rawSize = Number(search.get('size'))
  const status = search.get('status') ?? ''
  const fruit = search.get('fruit') ?? ''
  const sort = search.get('sort') ?? 'bounty,desc'
  const q = (search.get('q') ?? '').trim().slice(0, 80)
  return {
    page: Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0,
    size: validSizes.has(rawSize) ? rawSize : 20,
    status: validStatuses.has(status) ? status : undefined,
    crewId: (search.get('crewId') ?? '').trim() || undefined,
    fruit: validFruits.has(fruit) ? fruit : undefined,
    q: q || undefined,
    sort: validSorts.has(sort) ? sort : 'bounty,desc',
  }
}

export function WantedPage() {
  const token = useToken()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const [queryInput, setQueryInput] = useState(filters.q ?? '')
  const [crews, setCrews] = useState<Crew[]>([])
  const [data, setData] = useState<WantedPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const generation = useRef(0)

  const updateFilters = useCallback((changes: Record<string, string | number | undefined>, resetPage = true) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === '') next.delete(key)
        else next.set(key, String(value))
      })
      if (resetPage && !Object.hasOwn(changes, 'page')) next.delete('page')
      return next
    })
  }, [setSearchParams])

  useEffect(() => setQueryInput(filters.q ?? ''), [filters.q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const clean = queryInput.trim()
      if (clean !== (filters.q ?? '')) updateFilters({ q: clean || undefined })
    }, 450)
    return () => window.clearTimeout(timer)
  }, [queryInput, filters.q, updateFilters])

  useEffect(() => {
    const controller = new AbortController()
    apiRequest<Crew[]>('/crews', { token, signal: controller.signal })
      .then(setCrews)
      .catch(() => setCrews([]))
    return () => controller.abort()
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    const currentGeneration = ++generation.current
    setLoading(true)
    setError('')
    const query = toQuery({
      page: filters.page,
      size: filters.size,
      status: filters.status,
      crewId: filters.crewId,
      fruit: filters.fruit,
      q: filters.q,
      sort: filters.sort,
    })
    apiRequest<WantedPageData>(`/wanted${query}`, { token, signal: controller.signal })
      .then((response) => {
        if (currentGeneration !== generation.current) return
        if (response.totalPages > 0 && filters.page >= response.totalPages) {
          updateFilters({ page: response.totalPages - 1 }, false)
          return
        }
        setData(response)
      })
      .catch((reason: unknown) => {
        if (!isAbortError(reason) && currentGeneration === generation.current) setError(errorMessage(reason))
      })
      .finally(() => {
        if (!controller.signal.aborted && currentGeneration === generation.current) setLoading(false)
      })
    return () => controller.abort()
  }, [token, filters.page, filters.size, filters.status, filters.crewId, filters.fruit, filters.q, filters.sort, attempt, updateFilters])

  const visiblePages = useMemo(() => {
    if (!data) return []
    const start = Math.max(0, Math.min(filters.page - 2, data.totalPages - 5))
    return Array.from({ length: Math.min(5, data.totalPages) }, (_, index) => start + index)
  }, [data, filters.page])

  return (
    <div className="page-stack">
      <header className="page-hero page-hero--compact">
        <div><span className="eyebrow">Archivo de la Guild</span><h1>Carteles de “Se Busca”</h1><p>Filtra el registro sin perder tu posición ni aceptar respuestas antiguas.</p></div>
        <div className="results-count"><strong>{data?.totalElements ?? '—'}</strong><span>objetivos encontrados</span></div>
      </header>

      <section className="filter-panel" aria-label="Filtros del listado">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Buscar por nombre o epíteto</span>
          <input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Buscar nombre o epíteto…" />
          {queryInput && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQueryInput('')}>×</button>}
        </label>
        <label className="compact-field"><span>Estado</span><select value={filters.status ?? ''} onChange={(event) => updateFilters({ status: event.target.value || undefined })}><option value="">Todos</option>{Object.entries(wantedStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="compact-field"><span>Tripulación</span><select value={filters.crewId ?? ''} onChange={(event) => updateFilters({ crewId: event.target.value || undefined })}><option value="">Todas</option>{crews.map((crew) => <option key={crew.id} value={crew.id}>{crew.name}</option>)}</select></label>
        <label className="compact-field"><span>Fruta</span><select value={filters.fruit ?? ''} onChange={(event) => updateFilters({ fruit: event.target.value || undefined })}><option value="">Todas</option>{Object.entries(fruitLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button className="button button--ghost filter-reset" type="button" onClick={() => { setQueryInput(''); setSearchParams({}) }}>Limpiar</button>
      </section>

      <div className="list-toolbar">
        <label className="compact-field compact-field--inline"><span>Ordenar</span><select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value })}><option value="bounty,desc">Mayor recompensa</option><option value="name,asc">Nombre A–Z</option><option value="updatedAt,desc">Actualizados</option></select></label>
        <label className="compact-field compact-field--inline"><span>Mostrar</span><select value={filters.size} onChange={(event) => updateFilters({ size: Number(event.target.value) })}>{[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
      </div>

      {error && !data ? <ErrorState message={error} onRetry={() => setAttempt((value) => value + 1)} /> : (
        <section className={loading ? 'wanted-grid wanted-grid--loading' : 'wanted-grid'} aria-busy={loading}>
          {data?.content.map((wanted) => (
            <Link className="wanted-card" key={wanted.id} to={`/wanted/${wanted.id}`} state={{ fromSearch: searchParams.toString() }}>
              <div className="wanted-card__top">
                <span className="wanted-card__seal" aria-hidden="true">{wanted.name.slice(0, 1)}</span>
                <StatusPill tone={wantedStatusTones[wanted.status]}>{wantedStatusLabels[wanted.status]}</StatusPill>
              </div>
              <div className="wanted-card__copy"><span>WANTED</span><h2>{wanted.name}</h2><p>“{wanted.epithet}”</p></div>
              <div className="wanted-card__bounty"><small>Recompensa</small><strong>฿ {formatBerries(wanted.bounty)}</strong></div>
              <dl><div><dt>Tripulación</dt><dd>{wanted.crew.name}</dd></div><div><dt>Última pista</dt><dd>{wanted.lastSeenIsland}</dd></div><div><dt>Amenaza</dt><dd>{'◆'.repeat(wanted.threatLevel)}{'◇'.repeat(5 - wanted.threatLevel)}</dd></div></dl>
              <span className="wanted-card__action">Abrir expediente →</span>
            </Link>
          ))}
          {loading && !data && Array.from({ length: filters.size > 10 ? 10 : filters.size }, (_, index) => <div className="wanted-card skeleton" key={index}><i /><i /><i /><i /></div>)}
        </section>
      )}

      {!loading && data?.content.length === 0 && <EmptyState title="Ningún cartel coincide" description="Cambia o limpia los filtros para volver a buscar en el archivo." action={<button className="button button--primary" type="button" onClick={() => { setQueryInput(''); setSearchParams({}) }}>Limpiar filtros</button>} />}

      {data && data.totalPages > 1 && (
        <nav className="pagination" aria-label="Páginas de carteles">
          <button type="button" disabled={filters.page === 0 || loading} onClick={() => updateFilters({ page: filters.page - 1 }, false)}>← Anterior</button>
          <div>{visiblePages.map((page) => <button className={page === filters.page ? 'is-active' : ''} type="button" key={page} onClick={() => updateFilters({ page }, false)} aria-current={page === filters.page ? 'page' : undefined}>{page + 1}</button>)}</div>
          <button type="button" disabled={filters.page >= data.totalPages - 1 || loading} onClick={() => updateFilters({ page: filters.page + 1 }, false)}>Siguiente →</button>
        </nav>
      )}
    </div>
  )
}
