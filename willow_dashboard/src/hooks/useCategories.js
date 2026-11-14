import { useCallback, useMemo } from 'react';
import { sellerApi } from '../api/seller.js';
import { useQuery } from './useQuery.js';

/**
 * Product categories as defined by the backend (willow_be's ProductType), with live
 * product counts. Nothing about the category list is hard-coded in the dashboard.
 */
export function useCategories() {
  const { data } = useQuery((signal) => sellerApi.productSummary(undefined, signal), [], { live: ['product.'] });

  const categories = useMemo(
    () => (data?.byType ?? []).map((t) => ({ value: t.type, label: t.label, count: t.count })),
    [data]
  );
  const labelOf = useCallback((type) => categories.find((c) => c.value === type)?.label ?? type, [categories]);

  return { categories, labelOf };
}
