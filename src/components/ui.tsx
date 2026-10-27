import type { ReactNode } from 'react'

export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />
}

export function PageLoader() {
  return (
    <div className="page-loader" role="status">
      <span className="compass-loader" aria-hidden="true">✦</span>
      <p>Orientando el Log Pose…</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="state-card state-card--error" role="alert">
      <span className="state-card__icon" aria-hidden="true">!</span>
      <div>
        <h2>Perdimos el rumbo</h2>
        <p>{message}</p>
      </div>
      <button className="button button--primary" type="button" onClick={onRetry}>Reintentar</button>
    </section>
  )
}

export function EmptyState({ title, description, action }: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <section className="state-card">
      <span className="state-card__icon state-card__icon--muted" aria-hidden="true">○</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </section>
  )
}

export function StatusPill({ children, tone = 'neutral' }: {
  children: ReactNode
  tone?: 'neutral' | 'warning' | 'success' | 'danger' | 'info'
}) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>
}

export function formatBerries(value: number): string {
  return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 }).format(value)
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value))
}
