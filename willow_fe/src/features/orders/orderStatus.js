/** How each order status reads to a shopper. `tone` picks the pill colour in orders.css. */
export const ORDER_STATUS = {
  PENDING: { label: 'Order placed', short: 'Placed', tone: 'amber', text: 'Waiting for the seller to confirm your order.' },
  CONFIRMED: { label: 'Confirmed', short: 'Confirmed', tone: 'blue', text: 'The seller has confirmed your order and is getting it ready.' },
  PACKED: { label: 'Packed', short: 'Packed', tone: 'violet', text: 'Your order is packed and will be handed to the courier soon.' },
  SHIPPED: { label: 'Shipped', short: 'Shipped', tone: 'blue', text: 'Your order is on its way.' },
  DELIVERED: { label: 'Delivered', short: 'Delivered', tone: 'green', text: 'Your order has been delivered.' },
  CANCELLED: { label: 'Cancelled', short: 'Cancelled', tone: 'red', text: 'This order was cancelled.' },
  RETURNED: { label: 'Returned', short: 'Returned', tone: 'grey', text: 'This order was returned.' },
};

/** The happy path, shown as the tracking timeline. */
export const TRACKING_STEPS = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

export const PAYMENT_LABELS = { COD: 'Cash on Delivery', UPI: 'UPI', CARD: 'Card', NET_BANKING: 'Net banking' };

/** Payment state in shopper terms, for Cash on Delivery orders. */
export function paymentNote(order) {
  switch (order.paymentStatus) {
    case 'PAID': return 'Paid in cash on delivery';
    case 'REFUNDED': return 'Refunded';
    case 'VOID': return 'No payment taken';
    default: return order.paymentMethod === 'COD' ? 'Pay in cash when your order arrives' : 'Payment pending';
  }
}

/** Reasons offered when a shopper cancels. */
export const CANCEL_REASONS = [
  'Ordered by mistake',
  'Changed my mind',
  'Found a better price elsewhere',
  'Delivery is taking too long',
  'Want to change the size or address',
  'Other',
];

export function formatOrderDate(iso, { withTime = false } = {}) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}
