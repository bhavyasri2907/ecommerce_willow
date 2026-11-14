import { AlertCircle, Inbox, RotateCw } from 'lucide-react';
import Button from './Button.jsx';

export function Skeleton({ width = '100%', height = 14, radius = 6, className = '' }) {
  return <span className={`skeleton ${className}`} style={{ width, height, borderRadius: radius }} aria-hidden />;
}

export function SkeletonRows({ rows = 6, columns = 5 }) {
  return (
    <div className="skeleton-rows" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="skeleton-rows__row" key={r}>
          <Skeleton width={36} height={36} radius={8} />
          {Array.from({ length: columns - 1 }).map((__, c) => (
            <Skeleton key={c} width={`${60 + ((r + c) % 3) * 12}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="state state--empty">
      <span className="state__icon" aria-hidden>
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon" aria-hidden>
        <AlertCircle size={22} />
      </span>
      <h3>Couldn't load this</h3>
      <p>{error?.message ?? 'Something went wrong.'}</p>
      {onRetry && (
        <Button icon={RotateCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
