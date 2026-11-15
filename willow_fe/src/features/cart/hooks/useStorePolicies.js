import { useEffect, useState } from 'react';
import { storeService } from '../../../services/storeService.js';

/**
 * Shipping charges and return window from the seller's settings.
 * Returns null until loaded (or if the API can't be reached).
 */
export function useStorePolicies() {
  const [policies, setPolicies] = useState(null);

  useEffect(() => {
    let active = true;
    storeService.getPolicies()
      .then((data) => active && setPolicies(data))
      .catch(() => active && setPolicies(null));
    return () => { active = false; };
  }, []);

  return policies;
}
