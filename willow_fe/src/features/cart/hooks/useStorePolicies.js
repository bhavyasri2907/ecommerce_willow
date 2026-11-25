import { useEffect, useState } from 'react';
import { storeService } from '../../../services/storeService.js';

/**
 * Shipping charges and return windows of the stores whose products are in the bag,
 * keyed by store id. Empty until loaded, and stays empty if the API can't be reached.
 */
export function useStorePolicies(storeIds) {
  const [policies, setPolicies] = useState({});
  // Refetch only when the set of stores changes, not on every render.
  const key = [...new Set(storeIds)].sort((a, b) => a - b).join(',');

  useEffect(() => {
    if (!key) return undefined;
    let active = true;
    storeService
      .getPolicies(key.split(','))
      .then((list) => active && setPolicies(Object.fromEntries(list.map((p) => [p.storeId, p]))))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [key]);

  return policies;
}
