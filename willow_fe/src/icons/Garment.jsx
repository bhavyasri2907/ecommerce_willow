export default function Garment({ type, hex, size = '55%' }) {
  const stroke = hex || '#241F2E';
  return type === 'TOP' ? (
    <svg viewBox="0 0 100 100" fill="none" style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M35 8 L20 20 L8 34 L20 46 L30 38 L30 92 L70 92 L70 38 L80 46 L92 34 L80 20 L65 8 C65 8 58 16 50 16 C42 16 35 8 35 8 Z"
        stroke={stroke} strokeWidth="3" strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 100 100" fill="none" style={{ width: size, height: size }} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M25 8 L75 8 L78 92 L58 92 L52 40 L48 40 L42 92 L22 92 Z"
        stroke={stroke} strokeWidth="3" strokeLinejoin="round"
      />
    </svg>
  );
}
