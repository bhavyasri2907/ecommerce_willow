import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '../../assets/icons/NavIcons.jsx';

/** Rotating brand lines. Each one links to the part of the store it talks about. */
const QUOTES = [
  { text: 'Dress in pairs, not pieces', cta: 'Shop the looks', to: '/all' },
  { text: 'Style is a story — wear yours well', cta: 'See what’s new', to: '/new-in' },
  { text: 'The right accessory finishes the sentence', cta: 'Find yours', to: '/accessories' },
  { text: 'Loved it? Save it. Your wishlist remembers', cta: 'View wishlist', to: '/wishlist' },
];

const ROTATE_MS = 5000;

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-rotate; hovering or focusing the bar holds the current quote. Restarts on manual navigation.
  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, index]);

  const step = (delta) => setIndex((prev) => (prev + delta + QUOTES.length) % QUOTES.length);
  const quote = QUOTES[index];

  return (
    <div
      className="announcement-bar"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button
        type="button"
        className="announcement-arrow"
        onClick={() => step(-1)}
        aria-label="Previous quote"
      >
        <ChevronLeftIcon size={14} />
      </button>

      {/* key restarts the fade-in each time the quote changes */}
      <Link key={index} to={quote.to} className="announcement-content" aria-live="polite">
        <span className="announcement-plus">+</span>
        <span className="announcement-text">{quote.text}</span>
        <span className="announcement-cta">{quote.cta}</span>
        <span className="announcement-plus">+</span>
      </Link>

      <button
        type="button"
        className="announcement-arrow"
        onClick={() => step(1)}
        aria-label="Next quote"
      >
        <ChevronRightIcon size={14} />
      </button>
    </div>
  );
}
