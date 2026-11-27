import { useState } from 'react';
import { STAR } from './Stars.jsx';

export const RATING_WORDS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Excellent' };

/** Pick 1 to 5 stars. Works with the keyboard as a radio group (arrow keys move between stars). */
export default function StarInput({ value, onChange, size = 30, invalid = false }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value || 0;

  return (
    <div className="star-input">
      <div
        className={`star-input__stars ${invalid ? 'is-invalid' : ''}`}
        role="radiogroup"
        aria-label="Your rating"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`star-input__star ${n <= shown ? 'is-on' : ''}`} onMouseEnter={() => setHover(n)}>
            <input
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              aria-label={`${n} star${n === 1 ? '' : 's'} – ${RATING_WORDS[n]}`}
            />
            <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
              <path d={STAR} />
            </svg>
          </label>
        ))}
      </div>
      <span className="star-input__word">{shown ? RATING_WORDS[shown] : 'Tap a star to rate'}</span>
    </div>
  );
}
