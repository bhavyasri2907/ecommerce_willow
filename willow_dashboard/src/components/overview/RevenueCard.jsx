import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../common/Card.jsx';
import { Skeleton } from '../common/Loader.jsx';
import { RevenueChart } from '../charts/TimeSeriesChart.jsx';
import { formatDate } from '../../utils/formatDate.js';

const shortDate = (value) => formatDate(value, { day: 'numeric', month: 'short' });

/** Revenue over the selected period. `analytics` is undefined while loading. */
export default function RevenueCard({ analytics }) {
  return (
    <Card>
      <CardHeader
        title="Revenue"
        subtitle={analytics ? `${shortDate(analytics.from)} – ${shortDate(analytics.to)} · excludes cancelled and returned orders` : 'Last 30 days'}
        actions={<Link to="/analytics" className="link">Full analytics <ArrowRight size={14} aria-hidden /></Link>}
      />
      {analytics ? <RevenueChart data={analytics.series} /> : <Skeleton height={280} />}
    </Card>
  );
}
