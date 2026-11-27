import { ORDER_STATUS, TRACKING_STEPS, formatOrderDate } from '../orderStatus.js';

/**
 * Tracking timeline built from the order's history: each step shows when it happened.
 * A cancelled or returned order shows the steps it reached, then where it stopped.
 */
export default function OrderTracker({ order }) {
  const reachedAt = {};
  order.history.forEach((h) => { reachedAt[h.status] = h.at; });

  const voided = order.status === 'CANCELLED' || order.status === 'RETURNED';
  const currentIndex = TRACKING_STEPS.indexOf(order.status);
  const lastReached = voided
    ? Math.max(...TRACKING_STEPS.map((s, i) => (reachedAt[s] ? i : -1)))
    : currentIndex;

  // A voided order shows only the steps it got through, then the stop.
  const steps = voided ? TRACKING_STEPS.slice(0, lastReached + 1).concat(order.status) : TRACKING_STEPS;

  return (
    <ol className={`tracker ${voided ? 'tracker--void' : ''}`} aria-label="Order tracking">
      {steps.map((step, i) => {
        const done = voided || i <= lastReached;
        const isCurrent = voided ? i === steps.length - 1 : i === currentIndex;
        return (
          <li key={step} className={`tracker__step ${done ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}>
            <span className="tracker__dot" aria-hidden="true" />
            <span className="tracker__label">{ORDER_STATUS[step].label}</span>
            <span className="tracker__date">{reachedAt[step] ? formatOrderDate(reachedAt[step], { withTime: true }) : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}
