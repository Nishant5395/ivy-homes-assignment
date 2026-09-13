import { useState, useEffect, useRef } from 'react';
import { fetchAllPages } from '../api/client';

let cache = null;
let inFlightPromise = null;

export function useAllRentals() {
  const [rentals, setRentals] = useState(cache);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cache !== null) {
      setRentals(cache);
      setLoading(false);
      return () => { mounted.current = false; };
    }

    if (!inFlightPromise) {
      inFlightPromise = fetchAllPages('/v1/rentals');
    }

    inFlightPromise
      .then((all) => {
        cache = all;
        if (mounted.current) {
          setRentals(all);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { mounted.current = false; };
  }, []);

  return { rentals, loading, error };
}
