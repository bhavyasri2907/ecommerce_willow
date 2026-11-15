const STEPS = ['Bag', 'Address', 'Payment'];

/** Progress indicator across the top of the checkout flow. */
export default function CheckoutSteps({ current = 'Bag' }) {
  return (
    <ol className="checkout-steps" aria-label="Checkout progress">
      {STEPS.map((step) => (
        <li
          key={step}
          className={`checkout-steps__step ${step === current ? 'is-current' : ''}`}
          aria-current={step === current ? 'step' : undefined}
        >
          {step}
        </li>
      ))}
    </ol>
  );
}
