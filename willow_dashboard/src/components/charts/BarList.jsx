/**
 * Ranked horizontal bars for magnitude comparisons (one hue; length carries the value).
 * items: [{ key, label, value, display, sub, tone }]
 */
export default function BarList({ items, emptyLabel = 'No data for this period' }) {
  const max = Math.max(...items.map((i) => Number(i.value) || 0), 0);
  if (!items.length || max === 0) return <p className="muted small">{emptyLabel}</p>;
  return (
    <ul className="bar-list">
      {items.map((item) => {
        const pct = max ? (Number(item.value) / max) * 100 : 0;
        return (
          <li key={item.key} className="bar-list__item" title={`${item.label}: ${item.display}`}>
            <div className="bar-list__meta">
              <span className="bar-list__label">{item.label}</span>
              <span className="bar-list__value">
                {item.display}
                {item.sub && <span className="bar-list__sub">{item.sub}</span>}
              </span>
            </div>
            <div className="bar-list__track">
              <div className={`bar-list__fill ${item.tone ? `bar-list__fill--${item.tone}` : ''}`} style={{ width: `${Math.max(pct, 1.5)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
