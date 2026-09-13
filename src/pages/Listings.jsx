import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useAllListings } from '../hooks/UseAllListings.jsx';
import ListingRow from '../components/ListingRow.jsx';

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
      if (!l.is_live) return false;
      if (locality && l.locality !== locality) return false;
      if (bedroom && l.bedroom !== Number(bedroom)) return false;
      if (minPrice && l.price < Number(minPrice)) return false;
      if (maxPrice && l.price > Number(maxPrice)) return false;
      if (furnishing && l.furnishing !== furnishing) return false;
      return true;
    });
  }, [listings, locality, bedroom, minPrice, maxPrice, furnishing]);

  const visible = filtered.slice(0, visibleCount);
  const hasFilters = locality || bedroom || minPrice || maxPrice || furnishing;

  function resetFilters() {
    setLocality(''); setBedroom(''); setMinPrice(''); setMaxPrice(''); setFurnishing('');
    setVisibleCount(PAGE_SIZE);
  }

  const selectClass = "border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-slate/30";

  if (loading) return <p className="text-muted">Loading listings…</p>;
  if (error) return <p className="text-red-700">Couldn't load listings: {error}</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Listings in Pune</h1>
        <p className="text-sm text-muted">{filtered.length} match</p>
      </div>

      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 flex-wrap">
        <SlidersHorizontal size={15} strokeWidth={1.75} className="text-muted shrink-0" />

        <select value={locality} onChange={(e) => { setLocality(e.target.value); setVisibleCount(PAGE_SIZE); }} className={selectClass}>
          <option value="">Any locality</option>
          {localities.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
        </select>

        <select value={bedroom} onChange={(e) => { setBedroom(e.target.value); setVisibleCount(PAGE_SIZE); }} className={selectClass}>
          <option value="">Any bedrooms</option>
          {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} BHK</option>)}
        </select>

        <input
          type="number"
          value={minPrice}
          onChange={(e) => { setMinPrice(e.target.value); setVisibleCount(PAGE_SIZE); }}
          placeholder="Min ₹"
          className={`${selectClass} w-28`}
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => { setMaxPrice(e.target.value); setVisibleCount(PAGE_SIZE); }}
          placeholder="Max ₹"
          className={`${selectClass} w-28`}
        />

        <select value={furnishing} onChange={(e) => { setFurnishing(e.target.value); setVisibleCount(PAGE_SIZE); }} className={selectClass}>
          <option value="">Any furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="fully-furnished">Fully-furnished</option>
        </select>

        {hasFilters && (
          <button onClick={resetFilters} className="text-sm text-slate hover:text-ink ml-1">
            Clear
          </button>
        )}
      </div>

      <div>
        {visible.map((listing) => (
          <ListingRow key={listing.listing_id} listing={listing} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-muted py-8 text-center">No listings match these filters.</p>
      )}

      {visible.length < filtered.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-6 w-full border border-gray-300 rounded-md py-2.5 text-sm text-ink hover:bg-white hover:border-slate/40 transition-colors"
        >
          Show {Math.min(PAGE_SIZE, filtered.length - visible.length)} more
        </button>
      )}
    </div>
  );
}