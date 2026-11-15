/** Decorative willow branch for the right edge of the banner. */
function WillowBranch() {
  const leaf = 'M0 0 C 16 -15, 44 -15, 60 0 C 44 15, 16 15, 0 0 Z';
  const leaves = [
    { x: 150, y: 196, rotate: -152, scale: 1.05, tone: 'dark' },
    { x: 142, y: 160, rotate: -20, scale: 0.95, tone: 'mid' },
    { x: 128, y: 128, rotate: -162, scale: 1.1, tone: 'mid' },
    { x: 118, y: 94, rotate: -34, scale: 0.9, tone: 'dark' },
    { x: 104, y: 66, rotate: -172, scale: 0.9, tone: 'light' },
    { x: 92, y: 40, rotate: -52, scale: 0.8, tone: 'mid' },
    { x: 80, y: 22, rotate: -112, scale: 0.7, tone: 'light' },
  ];
  return (
    <svg className="account-hero__branch" viewBox="0 0 220 220" aria-hidden="true">
      <path className="account-hero__stem" d="M168 226 C 158 170, 132 96, 78 18" />
      {leaves.map((l, i) => (
        <path
          key={i}
          d={leaf}
          className={`account-hero__leaf account-hero__leaf--${l.tone}`}
          transform={`translate(${l.x} ${l.y}) rotate(${l.rotate}) scale(${l.scale})`}
        />
      ))}
    </svg>
  );
}

/** Greeting banner at the top of the account overview. */
export default function AccountHero({ firstName }) {
  return (
    <section className="account-hero">
      <div className="account-hero__text">
        <p className="account-hero__eyebrow">My Account</p>
        <h1 className="account-hero__title">Hello, {firstName}!</h1>
        <p className="account-hero__sub">Manage your orders, addresses and more — all in one place.</p>
      </div>
      <p className="account-hero__note" aria-hidden="true">
        Good things<br />await you <span>♥</span>
      </p>
      <WillowBranch />
    </section>
  );
}
