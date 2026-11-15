export const PRODUCT_STATUS = {
  LIVE: { label: 'Live', tone: 'success' },
  DRAFT: { label: 'Draft', tone: 'neutral' },
  ARCHIVED: { label: 'Archived', tone: 'muted' },
};

/** Product list tabs -> query filters sent to the API. */
export const PRODUCT_TAB_FILTERS = {
  all: {},
  LIVE: { status: 'LIVE' },
  DRAFT: { status: 'DRAFT' },
  ARCHIVED: { status: 'ARCHIVED' },
  low: { stock: 'low' },
  out: { stock: 'out' },
};
