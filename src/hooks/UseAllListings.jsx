import { useState, useEffect } from 'react';
import { fetchAllPages } from '../api/client';

let cache = null;
let inFlightPromise = null;

export function useAllListings() {
  const [listings, setListings] = useState(cache);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Already have listings in memory
    if (cache !== null) {
      setListings(cache);
      setLoading(false);
      setError(null);

      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    // Reuse existing request if one is already running
    if (!inFlightPromise) {
      inFlightPromise = fetchAllPages('/v1/listings');
    }

    inFlightPromise
      .then((allListings) => {
        cache = allListings;

        if (!cancelled) {
          setListings(allListings);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        // Very important:
        // Allow a future attempt to make a fresh request.
        inFlightPromise = null;

        if (!cancelled) {
          setError(
            err?.message || 'Failed to load listings'
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    listings,
    loading,
    error,
  };
}

export function invalidateListingsCache() {
  cache = null;
  inFlightPromise = null;
}

