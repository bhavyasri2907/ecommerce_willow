export const STOCK_STATUS = {
  IN_STOCK: { label: 'In stock', tone: 'success' },
  LOW_STOCK: { label: 'Low stock', tone: 'warning' },
  OUT_OF_STOCK: { label: 'Out of stock', tone: 'danger' },
};

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
