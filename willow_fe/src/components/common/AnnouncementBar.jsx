import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../assets/icons/NavIcons.jsx';

const ANNOUNCEMENTS = [
  'FREE SHIPPING ON ORDERS OVER $150 | EASY RETURNS | WORLDWIDE DELIVERY',
  'SIGN UP FOR WILLOW VIP TO ENJOY 15% OFF YOUR FIRST PURCHASE',
  'NEW AUTUMN/WINTER COLLECTION NOW AVAILABLE IN STORES & ONLINE',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <div className="announcement-bar">
      <button
        type="button"
        className="announcement-arrow left"
        onClick={handlePrev}
        aria-label="Previous announcement"
      >
        <ChevronLeftIcon size={14} />
      </button>

      <div className="announcement-content">
        <span className="announcement-plus">+</span>
        <span className="announcement-text">{ANNOUNCEMENTS[index]}</span>
        <span className="announcement-plus">+</span>
      </div>

      <button
        type="button"
        className="announcement-arrow right"
        onClick={handleNext}
        aria-label="Next announcement"
      >
        <ChevronRightIcon size={14} />
      </button>
    </div>
  );
}
