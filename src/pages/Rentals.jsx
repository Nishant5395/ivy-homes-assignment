// src/pages/Rentals.jsx
import { useState, useMemo } from 'react';
import { useAllRentals } from '../hooks/useAllRentals';
import RentalRow from '../components/RentalRow';

const PAGE_SIZE = 20;

export default function Rentals() {
  const { rentals, loading, error } = useAllRentals();
  const [locality, setLocality] = useState('');
  const [bedroom, setBedroom] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const localities = useMemo(() => {
    if (!rentals) return [];
    return [...new Set(rentals.map((r) => r.locality))].sort();
  }, [rentals]);

  const filtered = useMemo(() => {
    if (!rentals) return [];
    return rentals.filter((r) => {
      if (locality && r.locality !== locality) return false;
      if (bedroom && r.bedroom !== Number(bedroom)) return false;
      if (furnishing && r.furnishing !== furnishing) return false;
      return true;
    });
  }, [rentals, locality, bedroom, furnishing]);

  const visible = filtered.slice(0, visibleCount);

  if (loading) return <p className="text-muted">Loading rentals…</p>;
  if (error) return <p className="text-red-700">Couldn't load rentals: {error}</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-6">Rentals in Pune</h1>

      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-muted mb-1">Locality</label>
          <select
            value={locality}
            onChange={(e) => { setLocality(e.target.value); setVisibleCount(PAGE_SIZE); }}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
          >
            <option value="">All</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Bedrooms</label>
          <select
            value={bedroom}
            onChange={(e) => { setBedroom(e.target.value); setVisibleCount(PAGE_SIZE); }}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
          >
            <option value="">Any</option>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} BHK</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Furnishing</label>
          <select
            value={furnishing}
            onChange={(e) => { setFurnishing(e.target.value); setVisibleCount(PAGE_SIZE); }}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
          >
            <option value="">Any</option>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-furnished</option>
            <option value="fully-furnished">Fully-furnished</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-muted mb-4">{filtered.length} rentals match</p>

      <div>
        {visible.map((rental) => (
          <RentalRow key={rental.listing_id} rental={rental} />
        ))}
      </div>

      {visible.length < filtered.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-6 w-full border border-gray-300 rounded py-2 text-sm text-ink hover:bg-white transition-colors"
        >
          Load more ({filtered.length - visible.length} remaining)
        </button>
      )}
    </div>
  );
}
