// // src/hooks/useAllListings.js
// //
// // Fetches the ENTIRE listings dataset once and caches it in memory (module
// // scope survives navigation within the same session, resets on full reload).
// // We do this instead of relying on server-side filters/sort because we
// // can't be certain those work as documented — client-side filtering
// // guarantees correctness regardless.

// import { useState, useEffect, useRef } from 'react';
// import { fetchAllPages } from '../api/client';

// let cache = null; // module-level cache, shared across all components/pages
// let inFlightPromise = null;

// export function useAllListings() {
//   const [listings, setListings] = useState(cache);
//   const [loading, setLoading] = useState(cache === null);
//   const [error, setError] = useState(null);
//   const mounted = useRef(true);

//   useEffect(() => {
//     mounted.current = true;
//     if (cache !== null) {
//       setListings(cache);
//       setLoading(false);
//       return () => { mounted.current = false; };
//     }

//     if (!inFlightPromise) {
//       inFlightPromise = fetchAllPages('/v1/listings');
//     }

//     inFlightPromise
//       .then((all) => {
//         cache = all;
//         if (mounted.current) {
//           setListings(all);
//           setLoading(false);
//         }
//       })
//       .catch((err) => {
//         if (mounted.current) {
//           setError(err.message);
//           setLoading(false);
//         }
//       });

//     return () => { mounted.current = false; };
//   }, []);

//   return { listings, loading, error };
// }

// // Exposed so a "refresh" action elsewhere (rare — data is fairly static
// // during a session) can force a re-fetch if ever needed.
// export function invalidateListingsCache() {
//   cache = null;
//   inFlightPromise = null;
// }


// src/hooks/useAllListings.jsx

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

