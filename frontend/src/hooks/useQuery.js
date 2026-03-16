import { useState, useEffect, useCallback, useRef } from 'react';

// Simple in-flight request dedupe map to avoid duplicate network calls
const inFlightMap = new WeakMap();

export function useQuery(fn, options = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);

  const refetch = useCallback(() => {
    if (!enabled) return Promise.resolve();
    setLoading(true);
    setError(null);

    // If there's already an in-flight promise for this function, reuse it
    const existing = inFlightMap.get(fn);
    if (existing) return existing;

    const promise = Promise.resolve()
      .then(() => fn())
      .then((res) => {
        if (mountedRef.current) setData(res.data?.data ?? res.data);
        return res;
      })
      .catch((err) => {
        if (mountedRef.current) setError(err);
        throw err;
      })
      .finally(() => {
        inFlightMap.delete(fn);
        if (mountedRef.current) setLoading(false);
      });

    inFlightMap.set(fn, promise);
    return promise;
  }, [fn, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) refetch();
    return () => {
      mountedRef.current = false;
    };
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
