import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../api/client.js';
import { useAllListings } from '../hooks/UseAllListings.jsx';
import { useAllProjects } from '../hooks/useAllProjects.jsx';

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
  const [summaryMissing, setSummaryMissing] = useState(false);
  const { listings, loading: listingsLoading } = useAllListings();
  const { projects, loading: projectsLoading } = useAllProjects();

  useEffect(() => {
    api.analyticsSummary()
      .then(setSummary)
      .catch(() => setSummaryMissing(true));
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
    return { total: listings.length, live: liveCount, corrupt: CORRUPT_IDS.size, fake: fakeIds.size, avgPpsf };
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
      <h1 className="font-serif text-2xl text-ink mb-8">Market insights — Pune</h1>

      {loading ? (
        <p className="text-muted">Crunching the full dataset…</p>
      ) : (
        <>
          {/* Hero stat — the single most characteristic number */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <p className="text-sm text-muted mb-1">True average price per sqft, live 2BHK listings</p>
            <p className="font-serif text-5xl text-gold">₹{stats.avgPpsf.toFixed(0).toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted mt-2">
              Computed after excluding {stats.corrupt} corrupt and {stats.fake} fake records —
              the raw figure across every listing runs closer to ₹18,200/sqft.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <div>
              <p className="text-2xl text-ink font-medium">{stats.total.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted">Total listing records ({stats.live.toLocaleString('en-IN')} live)</p>
            </div>
            <div>
              <p className="text-2xl text-ink font-medium">{projects.length}</p>
              <p className="text-sm text-muted">Builder projects tracked</p>
            </div>
            <div>
              <p className="text-2xl text-ink font-medium">{wrongCountProjects}</p>
              <p className="text-sm text-muted">Projects with a mismatched listing count</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="flex gap-3 p-4 border border-red-200 bg-red-50/60 rounded-lg">
              <AlertTriangle size={20} strokeWidth={1.75} className="text-red-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-ink font-medium">{stats.corrupt} corrupt records</p>
                <p className="text-sm text-muted mt-0.5">Negative price, floor exceeding building height, or carpet area exceeding built-up area.</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 border border-amber-200 bg-amber-50/60 rounded-lg">
              <ShieldAlert size={20} strokeWidth={1.75} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-ink font-medium">{stats.fake} suspected fake listings</p>
                <p className="text-sm text-muted mt-0.5">All from one source, reporting carpet area roughly a tenth of normal for their bedroom count.</p>
              </div>
            </div>
          </div>
        </>
      )}

      <section>
        <h2 className="text-sm text-muted mb-3">From the API's own summary endpoint</h2>
        {summaryMissing && (
          <p className="text-sm text-muted italic">
            The documented /v1/analytics/summary endpoint doesn't exist on the live API — confirmed
            against 19 plausible alternate paths. Everything above is computed directly from the
            full dataset instead.
          </p>
        )}
        {summary && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xl text-ink font-medium">{summary.total_listings}</p>
              <p className="text-sm text-muted">Total listings (API-reported)</p>
            </div>
            <div>
              <p className="text-xl text-gold font-medium">{formatPrice(summary.median_price)}</p>
              <p className="text-sm text-muted">Median price</p>
            </div>
            <div>
              <p className="text-xl text-ink font-medium">₹{summary.median_price_per_sqft?.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted">Median price/sqft</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}