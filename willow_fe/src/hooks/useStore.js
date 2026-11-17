import { useEffect, useState } from 'react';
import { storeService } from '../services/storeService.js';

// One request for the whole app: every product card asks for the store name.
let cached = null;
let pending = null;

/** The store's public details ({ storeName, tagline, logoUrl }), or null until loaded. */
export function useStore() {
  const [store, setStore] = useState(cached);

  useEffect(() => {
    if (cached) return undefined;
    let active = true;
    pending ??= storeService.getInfo().catch(() => {
      pending = null; // let a later page try again
      return null;
    });
    pending.then((info) => {
      if (info) cached = info;
      if (active) setStore(info);
    });
    return () => {
      active = false;
    };
  }, []);

  return store;
}
