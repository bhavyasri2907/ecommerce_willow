import { CountPill } from './Badge.jsx';

/** Underlined tab strip on a tinted rail (as in the reference design). */
export function Tabs({ tabs, value, onChange, ariaLabel = 'Filter' }) {
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            className={`tabs__tab ${active ? 'is-active' : ''}`}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {tab.count !== undefined && <CountPill value={tab.count} tone={active ? 'accent' : 'neutral'} />}
          </button>
        );
      })}
    </div>
  );
}

/** Compact segmented control, e.g. date ranges. */
export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          className={`segmented__item ${o.value === value ? 'is-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
