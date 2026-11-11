import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveEvent } from '../live/LiveProvider.jsx';

/**
 * Fetches data and keeps it fresh.
 *  - `deps` re-run the query (e.g. filters, page).
 *  - `live` lists event-type prefixes; when one arrives the query silently refetches,
 *    keeping the current data on screen (no loading flash).
 * Stale responses from superseded requests are discarded.
 */
export function useQuery(fetcher, deps = [], { live = [], enabled = true } = {}) {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestId = useRef(0);
  const controller = useRef(null);
  const liveTimer = useRef(null);

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    controller.current?.abort();
    controller.current = new AbortController();
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetcherRef.current(controller.current.signal);
      if (id !== requestId.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError' || id !== requestId.current) return;
      setError(err);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    run();
    return () => controller.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run, ...deps]);

  // Coalesce bursts of events (an order fires order.created + inventory.changed together).
  useLiveEvent(live, () => {
    if (!enabled) return;
    clearTimeout(liveTimer.current);
    liveTimer.current = setTimeout(() => run({ silent: true }), 250);
  });
  useEffect(() => () => clearTimeout(liveTimer.current), []);

  const refetch = useCallback(() => run({ silent: true }), [run]);
  return { data, error, loading, refreshing, refetch, setData };
}
