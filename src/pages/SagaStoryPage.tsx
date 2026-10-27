import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useToken } from '../auth'
import { LockedState } from '../components/LockedState'
import { EmptyState, ErrorState, PageLoader, formatBerries } from '../components/ui'
import { paletteStyle, storyCache, transitionNavigate } from '../sagas'
import type { SagaStory } from '../types'
import { useResource } from '../useResource'

export function SagaStoryPage() {
  const { id = '' } = useParams()
  const token = useToken()
  const resource = useResource<SagaStory>(`/sagas/${encodeURIComponent(id)}/story`, storyCache.get(`${token}:${id}`))
  if (resource.locked) return <LockedState message={resource.error} onRetry={resource.retry} />
  if (resource.error && !resource.data) return <ErrorState message={resource.error} onRetry={resource.retry} />
  if (!resource.data) return <PageLoader />
  if (resource.data.stages.length === 0) return <EmptyState title="Esta saga todavía no tiene etapas" description="Vuelve al archivo para explorar otra historia." action={<Link className="button button--primary" to="/sagas">Ver sagas</Link>} />
  return <SagaExperience key={resource.data.saga.id} story={resource.data} />
}

function SagaExperience({ story }: { story: SagaStory }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const activeRef = useRef(0)
  const sections = useRef<Array<HTMLElement | null>>([])
  const mapConsole = useRef<HTMLElement>(null)
  const currentStage = story.stages[activeIndex]
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const goToStage = useCallback((index: number, focus = false, instant = false) => {
    const target = sections.current[index]
    if (!target) return
    target.scrollIntoView({ block: 'start', behavior: instant || reducedMotion() ? 'instant' : 'smooth' })
    if (focus) target.focus({ preventScroll: true })
  }, [])

  useLayoutEffect(() => {
    const slug = decodeHash(location.hash)
    const index = story.stages.findIndex((stage) => stage.slug === slug)
    if (index >= 0) {
      activeRef.current = index
      setActiveIndex(index)
      goToStage(index, false, true)
    }
  }, [location.hash, story.stages, goToStage])

  useEffect(() => {
    let frame = 0
    const updateStage = () => {
      const activationLine = window.innerWidth <= 820
        ? (mapConsole.current?.getBoundingClientRect().bottom ?? 350) + 35
        : window.innerHeight * .45
      let index = 0
      sections.current.forEach((section, position) => {
        if (section && section.getBoundingClientRect().top <= activationLine) index = position
      })
      const stage = story.stages[index]
      if (index !== activeRef.current) {
        activeRef.current = index
        setActiveIndex(index)
      }
      const hash = `#${encodeURIComponent(stage.slug)}`
      if (window.location.hash !== hash) {
        window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`)
      }
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateStage)
    }
    updateStage()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [story.stages])

  function handleKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target
    if (target instanceof HTMLElement && target.closest('input, select, textarea, button, a')) return
    let next: number | undefined
    if (event.key === 'ArrowRight' || event.key === 'PageDown') next = Math.min(story.stages.length - 1, activeRef.current + 1)
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') next = Math.max(0, activeRef.current - 1)
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = story.stages.length - 1
    if (next !== undefined) {
      event.preventDefault()
      goToStage(next, true)
    }
  }

  const points = story.stages.map((stage) => `${stage.island.x},${stage.island.y}`)
  const progress = ((activeIndex + 1) / story.stages.length) * 100

  return (
    <div className="saga-experience" style={paletteStyle(currentStage.palette)} onKeyDown={handleKeyboard}>
      <div className="story-intro">
        <button className="story-back" type="button" onClick={() => transitionNavigate(navigate, '/sagas')}>← Archivo de sagas</button>
        <span className="eyebrow">Poneglyph · saga {story.saga.order}</span>
        <h1 style={{ viewTransitionName: `saga-title-${story.saga.id}` }}>{story.saga.title}</h1>
        <p className="saga-subtitle">{story.saga.subtitle}</p>
        <p>{story.saga.intro}</p>
        <small>Desplázate o usa los botones de etapas. Con el foco en la historia: ← / →, Inicio / Fin.</small>
      </div>

      <div className="story-layout">
        <aside ref={mapConsole} className="voyage-console" aria-label="Mapa y métricas de la etapa activa">
          <div className="voyage-console__heading"><span>GRAND LINE</span><span>{activeIndex + 1} / {story.stages.length}</span></div>
          <svg className="voyage-map" viewBox={`-35 -45 ${story.map.width + 70} ${story.map.height + 100}`} role="img" aria-label={`Mapa: barco en ${currentStage.island.name}`}>
            <defs><pattern id="map-grid" width={story.map.width / 10} height={story.map.height / 5} patternUnits="userSpaceOnUse"><path d={`M ${story.map.width / 10} 0 L 0 0 0 ${story.map.height / 5}`} fill="none" stroke="currentColor" strokeWidth="1" opacity=".12" /></pattern></defs>
            <rect x="0" y="0" width={story.map.width} height={story.map.height} fill="url(#map-grid)" />
            <polyline points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 10" opacity=".22" />
            <polyline className="traveled-route" points={points.slice(0, activeIndex + 1).join(' ')} fill="none" stroke="var(--saga-primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {story.stages.map((stage, index) => <g key={stage.id} transform={`translate(${stage.island.x} ${stage.island.y})`}><circle r={index === activeIndex ? 15 : 9} fill={index <= activeIndex ? 'var(--saga-primary)' : 'var(--saga-surface)'} stroke="var(--saga-text)" strokeWidth="2" /><text y="-22" textAnchor="middle" fill="currentColor" fontSize="18">{stage.order}</text></g>)}
            <g className="map-ship" transform={`translate(${currentStage.island.x} ${currentStage.island.y})`} aria-hidden="true"><path d="M-24 7 H24 L12 23 H-11Z" fill="var(--saga-accent)" stroke="var(--saga-text)" strokeWidth="2" /><path d="M0 -40 V5 M-3 -35 L-22 -2 H-3Z M4 -32 L23 0 H4Z" fill="var(--saga-text)" stroke="var(--saga-text)" strokeWidth="2" /></g>
          </svg>
          <div className="active-island" aria-live="polite"><small>Isla actual</small><strong>{currentStage.island.name}</strong></div>
          <div className="voyage-progress"><div role="progressbar" aria-label="Progreso de la saga" aria-valuemin={0} aria-valuemax={story.stages.length} aria-valuenow={activeIndex + 1}><i style={{ width: `${progress}%` }} /></div><span>{Math.round(progress)}%</span></div>
          <dl className="stage-metrics">{currentStage.metrics.map((metric) => <div key={metric.key}><dt>{metric.label}</dt><dd>{formatBerries(metric.value)} <small>{metric.unit}</small></dd></div>)}</dl>
          <nav className="stage-controls" aria-label="Navegar entre etapas"><button type="button" disabled={activeIndex === 0} onClick={() => goToStage(activeIndex - 1, true)}>← Anterior</button><button type="button" disabled={activeIndex === story.stages.length - 1} onClick={() => goToStage(activeIndex + 1, true)}>Siguiente →</button></nav>
          <nav className="stage-dots" aria-label="Elegir etapa">{story.stages.map((stage, index) => <button type="button" key={stage.id} aria-label={`Etapa ${stage.order}: ${stage.island.name}`} aria-current={index === activeIndex ? 'step' : undefined} onClick={() => goToStage(index, true)}>{stage.order}</button>)}</nav>
        </aside>

        <div className="story-narrative">
          {story.stages.map((stage, index) => <section className={index === activeIndex ? 'story-stage is-active' : 'story-stage'} id={stage.slug} key={stage.id} ref={(element) => { sections.current[index] = element }} tabIndex={0} aria-labelledby={`title-${stage.id}`}>
            <div className="stage-reveal"><span className="stage-order">ETAPA {String(stage.order).padStart(2, '0')}</span><p className="stage-island">{stage.island.name}</p><h2 id={`title-${stage.id}`}>{stage.title}</h2>{stage.narrative.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>
          </section>)}
          <div className="story-ending"><span>FIN DEL RECORRIDO</span><p>{story.saga.lastIsland} · {formatBerries(story.saga.totalDistanceNm)} mn</p><button className="story-back" type="button" onClick={() => transitionNavigate(navigate, '/sagas')}>Explorar otra saga →</button></div>
        </div>
      </div>
    </div>
  )
}

function decodeHash(hash: string): string {
  try { return decodeURIComponent(hash.slice(1)) } catch { return '' }
}
