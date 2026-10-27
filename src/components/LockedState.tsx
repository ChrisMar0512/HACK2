export function LockedState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="state-card locked-state" role="status">
      <span className="state-card__icon" aria-hidden="true">⚓</span>
      <div>
        <span className="eyebrow">Reverse Mountain · CP3</span>
        <h2>El Grand Line espera a tu tripulación</h2>
        <p>{message}</p>
        <p>Después de aprobar la inspección, vuelve a comprobar el acceso.</p>
        <div className="action-row">
          <button className="button button--primary" type="button" onClick={() => { window.dispatchEvent(new Event('logpose:refresh')); onRetry() }}>Comprobar acceso</button>
          <a className="button button--ghost" href="https://logpose-api-jg7f.onrender.com/reverse-mountain" target="_blank" rel="noreferrer">Ir a la inspección ↗</a>
        </div>
      </div>
    </section>
  )
}
