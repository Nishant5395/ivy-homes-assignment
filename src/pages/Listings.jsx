// src/pages/Listings.jsx
import { useState, useMemo } from 'react';
import { useAllListings } from '../hooks/UseAllListings.jsx';
import ListingRow from '../components/ListingRow';

const PAGE_SIZE = 20;

export default function Listings() {
  const { listings, loading, error } = useAllListings();
  const [locality, setLocality] = useState('');
  const [bedroom, setBedroom] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const localities = useMemo(() => {
    if (!listings) return [];
    return [...new Set(listings.map((l) => l.locality))].sort();
  }, [listings]);

  const filtered = useMemo(() => {
    if (!listings) return [];
    return listings.filter((l) => {
      if (!l.is_live) return false; // don't show inactive listings, despite docs claiming /v1/listings already excludes them
      if (locality && l.locality !== locality) return false;
      if (bedroom && l.bedroom !== Number(bedroom)) return false;
      if (minPrice && l.price < Number(minPrice)) return false;
      if (maxPrice && l.price > Number(maxPrice)) return false;
      if (furnishing && l.furnishing !== furnishing) return false;
      return true;
    });
  }, [listings, locality, bedroom, minPrice, maxPrice, furnishing]);

  const visible = filtered.slice(0, visibleCount);

  function resetFilters() {
    setLocality('');
    setBedroom('');
    setMinPrice('');
    setMaxPrice('');
    setFurnishing('');
    setVisibleCount(PAGE_SIZE);
  }

  if (loading) return <p className="text-muted">Loading listings…</p>;
  if (error) return <p className="text-red-700">Couldn't load listings: {error}</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-6">Listings in Pune</h1>

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
          <label className="block text-xs text-muted mb-1">Min price (₹)</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="0"
            className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink w-32"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Max price (₹)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="Any"
            className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink w-32"
          />
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

        {(locality || bedroom || minPrice || maxPrice || furnishing) && (
          <button onClick={resetFilters} className="text-sm text-slate hover:text-ink">
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-muted mb-4">{filtered.length} listings match</p>

      <div>
        {visible.map((listing) => (
          <ListingRow key={listing.listing_id} listing={listing} />
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
