import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency, formatCurrencyCompact, formatDate, formatNumber } from '../../utils/format.js';

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: 'var(--text-faint)', fontSize: 11 },
};

function ChartTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{formatDate(label, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
      <div className="chart-tooltip__row">
        <span className="chart-tooltip__swatch" aria-hidden />
        {metric === 'revenue' ? 'Revenue' : 'Orders'}
        <strong>{metric === 'revenue' ? formatCurrency(point.revenue) : formatNumber(point.orders)}</strong>
      </div>
      {metric === 'revenue' && (
        <div className="chart-tooltip__meta">
          {formatNumber(point.orders)} orders · {formatNumber(point.units)} units
        </div>
      )}
    </div>
  );
}

function tickDate(value) {
  return formatDate(value, { day: 'numeric', month: 'short' });
}

/** Single-series revenue area chart (one measure, one axis). */
export function RevenueChart({ data, height = 280 }) {
  return (
    <div style={{ height }} role="img" aria-label="Daily revenue chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" {...axisProps} tickFormatter={tickDate} minTickGap={28} />
          <YAxis {...axisProps} tickFormatter={formatCurrencyCompact} width={56} />
          <Tooltip content={<ChartTooltip metric="revenue" />} cursor={{ stroke: 'var(--text-faint)', strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#revenueFill)"
            activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Orders per day as bars. */
export function OrdersChart({ data, height = 220 }) {
  return (
    <div style={{ height }} role="img" aria-label="Daily orders chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" {...axisProps} tickFormatter={tickDate} minTickGap={28} />
          <YAxis {...axisProps} allowDecimals={false} width={32} />
          <Tooltip content={<ChartTooltip metric="orders" />} cursor={{ fill: 'var(--accent-soft)' }} />
          <Bar dataKey="orders" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
