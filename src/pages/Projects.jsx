// src/pages/Projects.jsx
import { useMemo } from 'react';
import { useAllProjects } from '../hooks/useAllProjects';
import { useAllListings } from '../hooks/UseAllListings.jsx';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function Projects() {
  const { projects, loading: projectsLoading, error: projectsError } = useAllProjects();
  const { listings, loading: listingsLoading } = useAllListings();

  // The API's own total_listings field disagrees with reality for many
  // projects (see README / findings) — we recompute the real, live count
  // from the listings dataset instead of trusting the documented field.
  const actualLiveCountByProject = useMemo(() => {
    if (!listings) return {};
    const counts = {};
    for (const l of listings) {
      if (l.project_id && l.is_live) {
        counts[l.project_id] = (counts[l.project_id] || 0) + 1;
      }
    }
    return counts;
  }, [listings]);

  const loading = projectsLoading || listingsLoading;

  if (loading) return <p className="text-muted">Loading projects…</p>;
  if (projectsError) return <p className="text-red-700">Couldn't load projects: {projectsError}</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-2">Builder projects in Pune</h1>
      <p className="text-sm text-muted mb-6">
        Listing counts below are computed from live listings directly — the API's own reported count doesn't always match.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => {
          const actualCount = actualLiveCountByProject[p.project_id] || 0;
          return (
            <div key={p.project_id} className="border border-gray-200 rounded p-4">
              <p className="font-serif text-lg text-ink">{p.apartment_name}</p>
              <p className="text-sm text-muted mb-2">{p.developer_name} · {p.locality} · {p.project_status}</p>
              <p className="text-gold font-medium mb-1">
                {formatPrice(p.price_min)} – {formatPrice(p.price_max)}
              </p>
              <p className="text-sm text-muted mb-2">
                {p.min_area_sqft}–{p.max_area_sqft} sqft · {p.total_towers} towers · {p.total_floors} floors
              </p>
              <p className="text-sm text-ink">
                {actualCount} live {actualCount === 1 ? 'listing' : 'listings'} currently
                {actualCount !== p.total_listings && (
                  <span className="text-xs text-muted"> (API reports {p.total_listings})</span>
                )}
              </p>
              {p.amenities?.length > 0 && (
                <p className="text-xs text-muted mt-2">{p.amenities.join(' · ')}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
