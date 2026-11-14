export const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173';

/** Size presets offered on the product form, per category. */
export const SIZE_PRESETS = {
  TOP: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  PANTS: ['26', '28', '30', '32', '34', '36'],
  SHOES: ['UK4', 'UK5', 'UK6', 'UK7', 'UK8', 'UK9', 'UK10'],
  BAG: ['One Size'],
  ACCESSORY: ['One Size', 'S', 'M', 'L'],
};

export const STYLES = ['Casual', 'Smart Casual', 'Smart', 'Formal', 'Athleisure', 'Evening'];

export const SWATCHES = ['#2B2730', '#EDEAE3', '#C9BBA0', '#5C7AA6', '#9DB3C8', '#7C8B6F', '#B4636F', '#8C2D42', '#C9A24B', '#4A2E1B'];

export const PRODUCT_STATUS = {
  LIVE: { label: 'Live', tone: 'success' },
  DRAFT: { label: 'Draft', tone: 'neutral' },
  ARCHIVED: { label: 'Archived', tone: 'muted' },
};

export const STOCK_STATUS = {
  IN_STOCK: { label: 'In stock', tone: 'success' },
  LOW_STOCK: { label: 'Low stock', tone: 'warning' },
  OUT_OF_STOCK: { label: 'Out of stock', tone: 'danger' },
};

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

export const PAYMENT_LABELS = { UPI: 'UPI', CARD: 'Card', NET_BANKING: 'Net banking', COD: 'Cash on delivery' };

export const STOCK_REASONS = [
  { value: 'RESTOCK', label: 'Restock from supplier', direction: 'in' },
  { value: 'RETURN', label: 'Customer return', direction: 'in' },
  { value: 'ADJUSTMENT', label: 'Stock count correction', direction: 'both' },
  { value: 'DAMAGED', label: 'Damaged / lost', direction: 'out' },
];

export const MOVEMENT_LABELS = {
  INITIAL: 'Opening stock',
  RESTOCK: 'Restock',
  SALE: 'Sale',
  CANCELLATION: 'Cancelled order',
  RETURN: 'Return',
  ADJUSTMENT: 'Adjustment',
  DAMAGED: 'Damaged',
};
