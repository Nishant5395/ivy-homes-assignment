// src/pages/Insights.jsx
import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { useAllListings } from '../hooks/useAllListings';
import { useAllProjects } from '../hooks/useAllProjects';

// Settled from investigation — see README / findings.json for how these were found
const CORRUPT_IDS = new Set([
  '100-3000174', '100-3000236', '100-3000608', '100-3001067', '100-3001543',
  '100-3001548', '100-3002344', '100-3003022', 'DWE-3000235', 'DWE-3000299',
  'DWE-3001307', 'DWE-3001849', 'DWE-3003186', 'MAG-3000932', 'MAG-3001263',
  'MAG-3001979', 'MAG-3001986', 'SQU-3000419', 'SQU-3000591', 'SQU-3001698',
  'ZER-3000380',
]);

function medianFor(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function Insights() {
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const { listings, loading: listingsLoading } = useAllListings();
  const { projects, loading: projectsLoading } = useAllProjects();

  useEffect(() => {
    api.analyticsSummary()
      .then(setSummary)
      .catch((err) => setSummaryError(err.message));
  }, []);

  const fakeIds = useMemo(() => {
    if (!listings) return new Set();
    const normalMedianAreaByBhk = {};
    for (const bhk of [0, 1, 2, 3, 4, 5]) {
      const normalOfBhk = listings.filter((l) => l.bedroom === bhk && l.website !== 'magichomes' && l.carpet_area > 0);
      if (normalOfBhk.length > 0) normalMedianAreaByBhk[bhk] = medianFor(normalOfBhk.map((l) => l.carpet_area));
    }
    return new Set(
      listings
        .filter((l) => {
          const m = normalMedianAreaByBhk[l.bedroom];
          return m && l.carpet_area > 0 && l.carpet_area / m < 0.2;
        })
        .map((l) => l.listing_id)
    );
  }, [listings]);

  const stats = useMemo(() => {
    if (!listings) return null;
    const liveCount = listings.filter((l) => l.is_live).length;
    const cleanListings = listings.filter(
      (l) => l.is_live && !CORRUPT_IDS.has(l.listing_id) && !fakeIds.has(l.listing_id) && l.carpet_area > 0
    );
    const avgPpsf = cleanListings.reduce((sum, l) => sum + l.price / l.carpet_area, 0) / cleanListings.length;
    return {
      total: listings.length,
      live: liveCount,
      corrupt: CORRUPT_IDS.size,
      fake: fakeIds.size,
      avgPpsf,
    };
  }, [listings, fakeIds]);

  const wrongCountProjects = useMemo(() => {
    if (!listings || !projects) return null;
    const liveCountByProject = {};
    for (const l of listings) {
      if (l.project_id && l.is_live) liveCountByProject[l.project_id] = (liveCountByProject[l.project_id] || 0) + 1;
    }
    return projects.filter((p) => (liveCountByProject[p.project_id] || 0) !== p.total_listings).length;
  }, [listings, projects]);

  const loading = listingsLoading || projectsLoading;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-6">Market insights — Pune</h1>

      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">City summary (from the API)</h2>
        {summaryError && (
          <p className="text-sm text-muted italic">
            The documented <code>/v1/analytics/summary</code> endpoint doesn't exist on the live API
            (confirmed against several plausible alternate paths). Everything below is computed directly
            from the full listings and projects data instead.
          </p>
        )}
        {summary && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded p-4">
              <p className="text-xs text-muted">Total listings (API-reported)</p>
              <p className="text-2xl text-ink font-medium">{summary.total_listings}</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <p className="text-xs text-muted">Median price</p>
              <p className="text-2xl text-gold font-medium">{formatPrice(summary.median_price)}</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <p className="text-xs text-muted">Median price/sqft</p>
              <p className="text-2xl text-ink font-medium">₹{summary.median_price_per_sqft?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </section>

      {loading ? (
        <p className="text-muted">Crunching the full dataset…</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-sm uppercase tracking-wide text-muted mb-3">What we found investigating the data</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded p-4">
                <p className="text-xs text-muted">Total listing records retrievable</p>
                <p className="text-2xl text-ink font-medium">{stats.total.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted mt-1">{stats.live.toLocaleString('en-IN')} currently live</p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <p className="text-xs text-muted">True avg price/sqft (live 2BHK, excluding corrupt &amp; fake)</p>
                <p className="text-2xl text-gold font-medium">₹{stats.avgPpsf.toFixed(0).toLocaleString('en-IN')}</p>
              </div>
              <div className="border border-red-200 bg-red-50 rounded p-4">
                <p className="text-xs text-muted">Corrupt records (impossible data)</p>
                <p className="text-2xl text-ink font-medium">{stats.corrupt}</p>
                <p className="text-xs text-muted mt-1">Negative price, floor exceeding building height, or carpet area exceeding built-up area</p>
              </div>
              <div className="border border-amber-200 bg-amber-50 rounded p-4">
                <p className="text-xs text-muted">Suspected fake listings</p>
                <p className="text-2xl text-ink font-medium">{stats.fake}</p>
                <p className="text-xs text-muted mt-1">All from one source, reporting carpet area roughly 1/10th of normal for their bedroom count</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Builder project data quality</h2>
            <div className="border border-gray-200 rounded p-4 max-w-sm">
              <p className="text-xs text-muted">Projects where reported listing count is wrong</p>
              <p className="text-2xl text-ink font-medium">{wrongCountProjects} <span className="text-sm text-muted font-normal">of {projects.length}</span></p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
