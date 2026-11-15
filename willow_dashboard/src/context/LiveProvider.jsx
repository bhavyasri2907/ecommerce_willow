import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../services/api.js';

const LiveContext = createContext(null);
const MAX_FEED = 30;

/**
 * Holds one Server-Sent Events connection to willow_be for the whole app.
 * Components subscribe by event-type prefix (e.g. "order." matches order.created
 * and order.updated). EventSource reconnects on its own after network drops.
 */
export function LiveProvider({ children }) {
  const [status, setStatus] = useState('connecting'); // connecting | live | offline
  const [feed, setFeed] = useState([]);
  const [unread, setUnread] = useState(0);
  const listeners = useRef(new Set());

  useEffect(() => {
    const source = new EventSource(`${API_BASE_URL}/seller/events`);
    source.onopen = () => setStatus('live');
    source.onerror = () => setStatus(source.readyState === EventSource.CLOSED ? 'offline' : 'connecting');
    source.onmessage = (message) => {
      let event;
      try {
        event = JSON.parse(message.data);
      } catch {
        return;
      }
      if (event.type === 'connected') {
        setStatus('live');
        return;
      }
      if (event.type === 'order.created' || event.type === 'inventory.low') {
        setFeed((prev) => [{ ...event, id: `${event.type}-${event.at}` }, ...prev].slice(0, MAX_FEED));
        setUnread((n) => n + 1);
      }
      listeners.current.forEach((listener) => listener(event));
    };
    return () => source.close();
  }, []);

  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const markRead = useCallback(() => setUnread(0), []);

  const value = useMemo(
    () => ({ status, subscribe, feed, unread, markRead }),
    [status, subscribe, feed, unread, markRead]
  );
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLive must be used inside <LiveProvider>');
  return ctx;
}

/** Calls handler for every live event whose type starts with one of the given prefixes. */
export function useLiveEvent(prefixes, handler) {
  const { subscribe } = useLive();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const key = [].concat(prefixes).join('|');

  useEffect(() => {
    const list = key.split('|').filter(Boolean);
    return subscribe((event) => {
      if (list.some((prefix) => event.type.startsWith(prefix))) handlerRef.current(event);
    });
  }, [key, subscribe]);
}
