import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { percentChange } from '../../utils/formatNumber.js';
import { Skeleton } from '../common/Loader.jsx';

/**
 * Headline number with period-over-period change. `invert` flips the colour
 * logic for metrics where going down is good.
 */
export default function StatCard({ label, value, current, previous, icon: Icon, spark, comparisonLabel, loading, invert = false }) {
  const change = previous !== undefined ? percentChange(current, previous) : undefined;
  const direction = change === null || change === undefined ? 'none' : change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'flat';
  const good = direction === 'flat' || direction === 'none' ? null : (direction === 'up') !== invert;
  const gradientId = `spark-${label.replace(/[^a-z0-9]/gi, '')}`;
  const DeltaIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;

  return (
    <div className="kpi">
      <div className="kpi__top">
        <span className="kpi__label">{label}</span>
        {Icon && (
          <span className="kpi__icon" aria-hidden>
            <Icon size={16} />
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton width="60%" height={28} />
      ) : (
        <div className="kpi__value">{value}</div>
      )}
      <div className="kpi__bottom">
        {change !== undefined && !loading && (
          <span className={`delta ${good === null ? 'delta--flat' : good ? 'delta--good' : 'delta--bad'}`}>
            <DeltaIcon size={14} aria-hidden />
            {change === null ? 'New' : `${Math.abs(change).toFixed(1)}%`}
          </span>
        )}
        {comparisonLabel && <span className="kpi__hint">{comparisonLabel}</span>}
      </div>
      {spark && spark.length > 1 && (
        <div className="kpi__spark" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={1.5} fill={`url(#${gradientId})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
