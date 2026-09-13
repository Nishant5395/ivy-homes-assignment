// // src/pages/Rentals.jsx
// import { useState, useMemo } from 'react';
// import { useAllRentals } from '../hooks/useAllRentals';
// import RentalRow from '../components/RentalRow';

// const PAGE_SIZE = 20;

// export default function Rentals() {
//   const { rentals, loading, error } = useAllRentals();
//   const [locality, setLocality] = useState('');
//   const [bedroom, setBedroom] = useState('');
//   const [furnishing, setFurnishing] = useState('');
//   const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

//   const localities = useMemo(() => {
//     if (!rentals) return [];
//     return [...new Set(rentals.map((r) => r.locality))].sort();
//   }, [rentals]);

//   const filtered = useMemo(() => {
//     if (!rentals) return [];
//     return rentals.filter((r) => {
//       if (locality && r.locality !== locality) return false;
//       if (bedroom && r.bedroom !== Number(bedroom)) return false;
//       if (furnishing && r.furnishing !== furnishing) return false;
//       return true;
//     });
//   }, [rentals, locality, bedroom, furnishing]);

//   const visible = filtered.slice(0, visibleCount);

//   if (loading) return <p className="text-muted">Loading rentals…</p>;
//   if (error) return <p className="text-red-700">Couldn't load rentals: {error}</p>;

//   return (
//     <div>
//       <h1 className="font-serif text-2xl text-ink mb-6">Rentals in Pune</h1>

//       <div className="flex flex-wrap gap-3 mb-6 items-end">
//         <div>
//           <label className="block text-xs text-muted mb-1">Locality</label>
//           <select
//             value={locality}
//             onChange={(e) => { setLocality(e.target.value); setVisibleCount(PAGE_SIZE); }}
//             className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
//           >
//             <option value="">All</option>
//             {localities.map((loc) => (
//               <option key={loc} value={loc}>{loc}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-xs text-muted mb-1">Bedrooms</label>
//           <select
//             value={bedroom}
//             onChange={(e) => { setBedroom(e.target.value); setVisibleCount(PAGE_SIZE); }}
//             className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
//           >
//             <option value="">Any</option>
//             {[0, 1, 2, 3, 4, 5].map((n) => (
//               <option key={n} value={n}>{n} BHK</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-xs text-muted mb-1">Furnishing</label>
//           <select
//             value={furnishing}
//             onChange={(e) => { setFurnishing(e.target.value); setVisibleCount(PAGE_SIZE); }}
//             className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
//           >
//             <option value="">Any</option>
//             <option value="unfurnished">Unfurnished</option>
//             <option value="semi-furnished">Semi-furnished</option>
//             <option value="fully-furnished">Fully-furnished</option>
//           </select>
//         </div>
//       </div>

//       <p className="text-sm text-muted mb-4">{filtered.length} rentals match</p>

//       <div>
//         {visible.map((rental) => (
//           <RentalRow key={rental.listing_id} rental={rental} />
//         ))}
//       </div>

//       {visible.length < filtered.length && (
//         <button
//           onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
//           className="mt-6 w-full border border-gray-300 rounded py-2 text-sm text-ink hover:bg-white transition-colors"
//         >
//           Load more ({filtered.length - visible.length} remaining)
//         </button>
//       )}
//     </div>
//   );
// }

// src/pages/Rentals.jsx
import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
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
  const hasFilters = locality || bedroom || furnishing;
  const selectClass = "border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-slate/30";

  if (loading) return <p className="text-muted">Loading rentals…</p>;
  if (error) return <p className="text-red-700">Couldn't load rentals: {error}</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Rentals in Pune</h1>
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

        <select value={furnishing} onChange={(e) => { setFurnishing(e.target.value); setVisibleCount(PAGE_SIZE); }} className={selectClass}>
          <option value="">Any furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="fully-furnished">Fully-furnished</option>
        </select>

        {hasFilters && (
          <button onClick={() => { setLocality(''); setBedroom(''); setFurnishing(''); }} className="text-sm text-slate hover:text-ink ml-1">
            Clear
          </button>
        )}
      </div>

      <div>
        {visible.map((rental) => (
          <RentalRow key={rental.listing_id} rental={rental} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-muted py-8 text-center">No rentals match these filters.</p>
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