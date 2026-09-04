export function DressCategoryIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3h8l1 4-3 2v12H10V9L7 7l1-4z" />
      <path d="M10 9c1.5 1 2.5 1 4 0" />
      <path d="M7 21h10" />
    </svg>
  );
}

export function TopsCategoryIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5l3-2h6l3 2 2 4-4 2v10H8V11L4 9l2-4z" />
      <path d="M9 3c1 2 2 3 3 3s2-1 3-3" />
    </svg>
  );
}

export function BottomsCategoryIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v4l-1 14h-3l-2-9-2 9H7L6 7V3z" />
      <line x1="6" y1="7" x2="18" y2="7" />
    </svg>
  );
}

export function BagsCategoryIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9h12l-1 11H7L6 9z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

export function ShoesCategoryIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18h18v-3c-3-1-6-2-8-4l-3-5-2 1v6L3 18z" />
      <path d="M19 18v3" />
    </svg>
  );
}

export function AccessoriesCategoryIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="14" r="4" />
      <circle cx="18" cy="14" r="4" />
      <path d="M10 14h4" />
      <path d="M3 12l3-4h12l3 4" />
    </svg>
  );
}

export function NewInCategoryIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function SaleCategoryIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
      <line x1="9" y1="15" x2="15" y2="9" />
      <circle cx="9.5" cy="9.5" r="1.2" fill={color} />
      <circle cx="14.5" cy="14.5" r="1.2" fill={color} />
    </svg>
  );
}
