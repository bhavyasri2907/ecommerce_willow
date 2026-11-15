import { Check } from 'lucide-react';
import { FULFILMENT_STEPS, ORDER_STATUS } from '../../constants/orderStatus.js';

/** Fulfilment progress (pending → delivered). Cancelled and returned orders show no progress. */
export default function OrderTimeline({ status }) {
  const voided = status === 'CANCELLED' || status === 'RETURNED';
  const current = FULFILMENT_STEPS.indexOf(status);
  return (
    <ol className={`timeline ${voided ? 'is-void' : ''}`} aria-label="Fulfilment progress">
      {FULFILMENT_STEPS.map((step, i) => {
        const done = !voided && i <= current;
        return (
          <li key={step} className={`timeline__step ${done ? 'is-done' : ''} ${i === current ? 'is-current' : ''}`}>
            <span className="timeline__dot" aria-hidden>{done && <Check size={11} strokeWidth={3} />}</span>
            <span className="timeline__label">{ORDER_STATUS[step].label}</span>
          </li>
        );
      })}
    </ol>
  );
}
