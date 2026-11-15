import { useCallback, useMemo } from 'react';
import { productService } from '../services/productService.js';
import { useFetch } from './useFetch.js';

/**
 * Product categories as defined by the backend (willow_be's ProductType), with live
 * product counts. Nothing about the category list is hard-coded in the dashboard.
 */
export function useCategories() {
  const { data } = useFetch((signal) => productService.getProductSummary(undefined, signal), [], { live: ['product.'] });

  const categories = useMemo(
    () => (data?.byType ?? []).map((t) => ({ value: t.type, label: t.label, count: t.count })),
    [data]
  );
  const labelOf = useCallback((type) => categories.find((c) => c.value === type)?.label ?? type, [categories]);

  return { categories, labelOf };
}
