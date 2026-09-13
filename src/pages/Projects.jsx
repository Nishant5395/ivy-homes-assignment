import { useMemo } from 'react';
import { Building, MapPin } from 'lucide-react';
import { useAllProjects } from '../hooks/useAllProjects.jsx';
import { useAllListings } from '../hooks/UseAllListings.jsx';

function formatCrore(value) {
  // project price_min/price_max are reported in crores, not plain rupees
  // (see findings.json) — value is already in crore units
  return `₹${value.toFixed(1)} Cr`;
}

const statusColor = {
  'ready to move': 'bg-emerald-500',
  'under construction': 'bg-amber-500',
  'launching soon': 'bg-slate',
};

export default function Projects() {
  const { projects, loading: projectsLoading, error: projectsError } = useAllProjects();
  const { listings, loading: listingsLoading } = useAllListings();

  const actualLiveCountByProject = useMemo(() => {
    if (!listings) return {};
    const counts = {};
    for (const l of listings) {
      if (l.project_id && l.is_live) counts[l.project_id] = (counts[l.project_id] || 0) + 1;
    }
    return counts;
  }, [listings]);

  const loading = projectsLoading || listingsLoading;

  if (loading) return <p className="text-muted">Loading projects…</p>;
  if (projectsError) return <p className="text-red-700">Couldn't load projects: {projectsError}</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="font-serif text-2xl text-ink">Builder projects in Pune</h1>
        <p className="text-sm text-muted">{projects.length} projects</p>
      </div>
      <p className="text-sm text-muted mb-6">
        Prices shown in crores, corrected from the API's raw values. Listing counts are computed live — the API's own count doesn't always match.
      </p>

      <div>
        {projects.map((p) => {
          const actualCount = actualLiveCountByProject[p.project_id] || 0;
          const dotColor = statusColor[p.project_status] || 'bg-gray-400';
          return (
            <div
              key={p.project_id}
              className="group relative flex items-center justify-between gap-4 py-5 border-b border-gray-200 pl-4 -ml-4 pr-2 transition-colors hover:bg-white/70"
            >
              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-serif text-lg text-ink truncate">{p.apartment_name}</p>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} title={p.project_status} />
                  <span className="text-xs text-muted capitalize shrink-0">{p.project_status}</span>
                </div>
                <p className="flex items-center gap-1 text-sm text-muted mb-2">
                  <Building size={13} strokeWidth={1.75} className="shrink-0" /> {p.developer_name}
                  <span className="mx-1">·</span>
                  <MapPin size={13} strokeWidth={1.75} className="shrink-0" /> {p.locality}
                </p>
                <p className="text-xs text-muted">
                  {p.min_area_sqft}–{p.max_area_sqft} sqft · {p.total_towers} towers · {p.total_floors} floors · {actualCount} live {actualCount === 1 ? 'listing' : 'listings'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-gold font-medium text-lg">{formatCrore(p.price_min)} – {formatCrore(p.price_max)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}