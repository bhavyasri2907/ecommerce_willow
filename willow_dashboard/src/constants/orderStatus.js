/** Order workflow, in fulfilment order. */
export const ORDER_STATUS = {
  PENDING: { label: 'Pending', tone: 'warning', action: 'Confirm order' },
  CONFIRMED: { label: 'Confirmed', tone: 'info', action: 'Mark as confirmed' },
  PACKED: { label: 'Packed', tone: 'violet', action: 'Mark as packed' },
  SHIPPED: { label: 'Shipped', tone: 'info', action: 'Mark as shipped' },
  DELIVERED: { label: 'Delivered', tone: 'success', action: 'Mark as delivered' },
  CANCELLED: { label: 'Cancelled', tone: 'danger', action: 'Cancel order' },
  RETURNED: { label: 'Returned', tone: 'muted', action: 'Mark as returned' },
};

export const FULFILMENT_STEPS = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

/** Tab order on the Orders page. */
export const ORDER_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

export const PAYMENT_LABELS = { UPI: 'UPI', CARD: 'Card', NET_BANKING: 'Net banking', COD: 'Cash on delivery' };
