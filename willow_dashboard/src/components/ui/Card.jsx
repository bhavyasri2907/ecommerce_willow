export function Card({ className = '', padded = true, children, ...props }) {
  return (
    <section className={`card ${padded ? 'card--padded' : ''} ${className}`} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <header className="card__header">
      <div className="card__heading">
        {Icon && (
          <span className="card__icon" aria-hidden>
            <Icon size={16} />
          </span>
        )}
        <div>
          <h2 className="card__title">{title}</h2>
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="card__actions">{actions}</div>}
    </header>
  );
}
