import willowLogoImg from '../assets/willow logo.png';

export default function WillowLogo({ className = '', height = 58 }) {
  return (
    <img
      src={willowLogoImg}
      alt="Willow Fashion"
      height={height}
      className={`willow-logo-img ${className}`}
      style={{
        height: `${height}px`,
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
        /* Tint light cream logo to match dark plum/espresso (#2C181E) header color */
        filter: 'brightness(0) saturate(100%) invert(10%) sepia(20%) saturate(3000%) hue-rotate(305deg) brightness(85%) contrast(95%)',
      }}
    />
  );
}
