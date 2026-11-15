import { Card } from './Card.jsx';

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

/** Whole-page placeholder shown while a page (or the data it needs) loads. */
export default function Loader({ rows = 6, columns = 4 }) {
  return (
    <Card>
      <SkeletonRows rows={rows} columns={columns} />
    </Card>
  );
}
