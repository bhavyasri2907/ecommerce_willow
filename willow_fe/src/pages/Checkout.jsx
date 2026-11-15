import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  return (
    <div className="confirm">
      <div className="dot-big">✓</div>
      <h1>Order placed</h1>
      <p>
        This is a demo checkout — no payment was taken. In production this is where Willow would
        hand off to a payment provider (Razorpay, Stripe, etc.) before creating a real order.
      </p>
      <button onClick={() => navigate('/')}>Keep browsing</button>
    </div>
  );
}
