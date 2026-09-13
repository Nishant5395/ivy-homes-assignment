// // // src/pages/Listings.jsx
// // import { useState, useMemo } from 'react';
// // import { useAllListings } from '../hooks/UseAllListings.jsx';
// // import ListingRow from '../components/ListingRow';

// // const PAGE_SIZE = 20;

// // export default function Listings() {
// //   const { listings, loading, error } = useAllListings();
// //   const [locality, setLocality] = useState('');
// //   const [bedroom, setBedroom] = useState('');
// //   const [minPrice, setMinPrice] = useState('');
// //   const [maxPrice, setMaxPrice] = useState('');
// //   const [furnishing, setFurnishing] = useState('');
// //   const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

// //   const localities = useMemo(() => {
// //     if (!listings) return [];
// //     return [...new Set(listings.map((l) => l.locality))].sort();
// //   }, [listings]);

// //   const filtered = useMemo(() => {
// //     if (!listings) return [];
// //     return listings.filter((l) => {
// //       if (!l.is_live) return false; // don't show inactive listings, despite docs claiming /v1/listings already excludes them
// //       if (locality && l.locality !== locality) return false;
// //       if (bedroom && l.bedroom !== Number(bedroom)) return false;
// //       if (minPrice && l.price < Number(minPrice)) return false;
// //       if (maxPrice && l.price > Number(maxPrice)) return false;
// //       if (furnishing && l.furnishing !== furnishing) return false;
// //       return true;
// //     });
// //   }, [listings, locality, bedroom, minPrice, maxPrice, furnishing]);

// //   const visible = filtered.slice(0, visibleCount);

// //   function resetFilters() {
// //     setLocality('');
// //     setBedroom('');
// //     setMinPrice('');
// //     setMaxPrice('');
// //     setFurnishing('');
// //     setVisibleCount(PAGE_SIZE);
// //   }

// //   if (loading) return <p className="text-muted">Loading listings…</p>;
// //   if (error) return <p className="text-red-700">Couldn't load listings: {error}</p>;

// //   return (
// //     <div>
// //       <h1 className="font-serif text-2xl text-ink mb-6">Listings in Pune</h1>

// //       <div className="flex flex-wrap gap-3 mb-6 items-end">
// //         <div>
// //           <label className="block text-xs text-muted mb-1">Locality</label>
// //           <select
// //             value={locality}
// //             onChange={(e) => { setLocality(e.target.value); setVisibleCount(PAGE_SIZE); }}
// //             className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
// //           >
// //             <option value="">All</option>
// //             {localities.map((loc) => (
// //               <option key={loc} value={loc}>{loc}</option>
// //             ))}
// //           </select>
// //         </div>

// //         <div>
// //           <label className="block text-xs text-muted mb-1">Bedrooms</label>
// //           <select
// //             value={bedroom}
// //             onChange={(e) => { setBedroom(e.target.value); setVisibleCount(PAGE_SIZE); }}
// //             className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
// //           >
// //             <option value="">Any</option>
// //             {[0, 1, 2, 3, 4, 5].map((n) => (
// //               <option key={n} value={n}>{n} BHK</option>
// //             ))}
// //           </select>
// //         </div>

// //         <div>
// //           <label className="block text-xs text-muted mb-1">Min price (₹)</label>
// //           <input
// //             type="number"
// //             value={minPrice}
// //             onChange={(e) => { setMinPrice(e.target.value); setVisibleCount(PAGE_SIZE); }}
// //             placeholder="0"
// //             className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink w-32"
// //           />
// //         </div>

// //         <div>
// //           <label className="block text-xs text-muted mb-1">Max price (₹)</label>
// //           <input
// //             type="number"
// //             value={maxPrice}
// //             onChange={(e) => { setMaxPrice(e.target.value); setVisibleCount(PAGE_SIZE); }}
// //             placeholder="Any"
// //             className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink w-32"
// //           />
// //         </div>

// //         <div>
// //           <label className="block text-xs text-muted mb-1">Furnishing</label>
// //           <select
// //             value={furnishing}
// //             onChange={(e) => { setFurnishing(e.target.value); setVisibleCount(PAGE_SIZE); }}
// //             className="border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
// //           >
// //             <option value="">Any</option>
// //             <option value="unfurnished">Unfurnished</option>
// //             <option value="semi-furnished">Semi-furnished</option>
// //             <option value="fully-furnished">Fully-furnished</option>
// //           </select>
// //         </div>

// //         {(locality || bedroom || minPrice || maxPrice || furnishing) && (
// //           <button onClick={resetFilters} className="text-sm text-slate hover:text-ink">
// //             Clear filters
// //           </button>
// //         )}
// //       </div>

// //       <p className="text-sm text-muted mb-4">{filtered.length} listings match</p>

// //       <div>
// //         {visible.map((listing) => (
// //           <ListingRow key={listing.listing_id} listing={listing} />
// //         ))}
// //       </div>

// //       {visible.length < filtered.length && (
// //         <button
// //           onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
// //           className="mt-6 w-full border border-gray-300 rounded py-2 text-sm text-ink hover:bg-white transition-colors"
// //         >
// //           Load more ({filtered.length - visible.length} remaining)
// //         </button>
// //       )}
// //     </div>
// //   );
// // }


// // src/pages/Listings.jsx
// import { useState, useMemo } from 'react';
// import { useAllListings } from '../hooks/UseAllListings.jsx';
// import ListingRow from '../components/ListingRow';

// const PAGE_SIZE = 20;

// export default function Listings() {
//   const { listings, loading, error } = useAllListings();

//   const [locality, setLocality] = useState('');
//   const [bedroom, setBedroom] = useState('');
//   const [minPrice, setMinPrice] = useState('');
//   const [maxPrice, setMaxPrice] = useState('');
//   const [furnishing, setFurnishing] = useState('');
//   const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

//   const localities = useMemo(() => {
//     if (!listings) return [];

//     return [...new Set(
//       listings
//         .map((listing) => listing.locality)
//         .filter(Boolean)
//     )].sort();
//   }, [listings]);

//   const filtered = useMemo(() => {
//     if (!listings) return [];

//     return listings.filter((listing) => {
//       if (!listing.is_live) return false;

//       if (locality && listing.locality !== locality) {
//         return false;
//       }

//       if (
//         bedroom !== '' &&
//         Number(listing.bedroom) !== Number(bedroom)
//       ) {
//         return false;
//       }

//       if (
//         minPrice !== '' &&
//         Number(listing.price) < Number(minPrice)
//       ) {
//         return false;
//       }

//       if (
//         maxPrice !== '' &&
//         Number(listing.price) > Number(maxPrice)
//       ) {
//         return false;
//       }

//       if (
//         furnishing &&
//         listing.furnishing !== furnishing
//       ) {
//         return false;
//       }

//       return true;
//     });
//   }, [
//     listings,
//     locality,
//     bedroom,
//     minPrice,
//     maxPrice,
//     furnishing,
//   ]);

//   const visible = filtered.slice(0, visibleCount);

//   function resetFilters() {
//     setLocality('');
//     setBedroom('');
//     setMinPrice('');
//     setMaxPrice('');
//     setFurnishing('');
//     setVisibleCount(PAGE_SIZE);
//   }

//   function updateFilter(setter, value) {
//     setter(value);
//     setVisibleCount(PAGE_SIZE);
//   }

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div className="text-center">
//           <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate/20 border-t-slate" />

//           <p className="mt-4 text-sm text-muted">
//             Finding homes for you...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center px-4">
//         <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
//             !
//           </div>

//           <h2 className="mt-4 font-serif text-2xl text-ink">
//             Couldn't load listings
//           </h2>

//           <p className="mt-2 text-sm leading-6 text-muted">
//             Something went wrong while loading the properties.
//             Please try again.
//           </p>

//           <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
//             {error}
//           </p>

//           <button
//             onClick={() => window.location.reload()}
//             className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate"
//           >
//             Try again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-paper">

//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

//           <div>
//             <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate">
//               Pune real estate
//             </p>

//             <h1 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
//               Find your next home
//             </h1>

//             <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
//               Explore carefully selected homes and apartments across Pune.
//             </p>
//           </div>

//           <div className="rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm">
//             <p className="text-xs text-muted">
//               Available homes
//             </p>

//             <p className="mt-0.5 text-xl font-semibold text-ink">
//               {filtered.length}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="mb-8 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">

//         <div className="mb-4 flex items-center justify-between">
//           <div>
//             <h2 className="text-sm font-semibold text-ink">
//               Refine your search
//             </h2>

//             <p className="mt-1 text-xs text-muted">
//               Filter homes based on your preferences.
//             </p>
//           </div>

//           {(locality ||
//             bedroom ||
//             minPrice ||
//             maxPrice ||
//             furnishing) && (
//             <button
//               onClick={resetFilters}
//               className="text-xs font-medium text-slate transition hover:text-ink"
//             >
//               Clear all
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

//           {/* Locality */}
//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-ink">
//               Locality
//             </label>

//             <select
//               value={locality}
//               onChange={(e) =>
//                 updateFilter(setLocality, e.target.value)
//               }
//               className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-slate focus:bg-white focus:ring-4 focus:ring-slate/10"
//             >
//               <option value="">All localities</option>

//               {localities.map((loc) => (
//                 <option key={loc} value={loc}>
//                   {loc}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Bedrooms */}
//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-ink">
//               Bedrooms
//             </label>

//             <select
//               value={bedroom}
//               onChange={(e) =>
//                 updateFilter(setBedroom, e.target.value)
//               }
//               className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-slate focus:bg-white focus:ring-4 focus:ring-slate/10"
//             >
//               <option value="">Any bedrooms</option>

//               {[0, 1, 2, 3, 4, 5].map((n) => (
//                 <option key={n} value={n}>
//                   {n} BHK
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Min Price */}
//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-ink">
//               Minimum price
//             </label>

//             <input
//               type="number"
//               value={minPrice}
//               onChange={(e) =>
//                 updateFilter(setMinPrice, e.target.value)
//               }
//               placeholder="₹ 0"
//               className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-slate focus:bg-white focus:ring-4 focus:ring-slate/10"
//             />
//           </div>

//           {/* Max Price */}
//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-ink">
//               Maximum price
//             </label>

//             <input
//               type="number"
//               value={maxPrice}
//               onChange={(e) =>
//                 updateFilter(setMaxPrice, e.target.value)
//               }
//               placeholder="₹ Any"
//               className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-slate focus:bg-white focus:ring-4 focus:ring-slate/10"
//             />
//           </div>

//           {/* Furnishing */}
//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-ink">
//               Furnishing
//             </label>

//             <select
//               value={furnishing}
//               onChange={(e) =>
//                 updateFilter(setFurnishing, e.target.value)
//               }
//               className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-slate focus:bg-white focus:ring-4 focus:ring-slate/10"
//             >
//               <option value="">Any type</option>
//               <option value="unfurnished">Unfurnished</option>
//               <option value="semi-furnished">
//                 Semi-furnished
//               </option>
//               <option value="fully-furnished">
//                 Fully-furnished
//               </option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Results header */}
//       <div className="mb-5 flex items-center justify-between">
//         <div>
//           <h2 className="font-serif text-xl text-ink">
//             Properties
//           </h2>

//           <p className="mt-1 text-xs text-muted">
//             {filtered.length === 0
//               ? 'No properties found'
//               : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'} found`}
//           </p>
//         </div>

//         {filtered.length > 0 && (
//           <span className="hidden rounded-full bg-slate/10 px-3 py-1 text-xs font-medium text-slate sm:block">
//             Showing {visible.length} of {filtered.length}
//           </span>
//         )}
//       </div>

//       {/* Listings */}
//       {visible.length > 0 ? (
//         <div className="space-y-4">
//           {visible.map((listing) => (
//             <ListingRow
//               key={listing.listing_id}
//               listing={listing}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper text-xl">
//             🏠
//           </div>

//           <h3 className="mt-4 font-serif text-xl text-ink">
//             No homes found
//           </h3>

//           <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
//             Try changing your filters or clearing them to see
//             more available properties.
//           </p>

//           <button
//             onClick={resetFilters}
//             className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate"
//           >
//             Clear filters
//           </button>
//         </div>
//       )}

//       {/* Load More */}
//       {visible.length < filtered.length && (
//         <div className="mt-8 text-center">
//           <button
//             onClick={() =>
//               setVisibleCount((count) => count + PAGE_SIZE)
//             }
//             className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-slate hover:text-slate hover:shadow-md"
//           >
//             Load more
//             <span className="ml-2 text-muted">
//               ({filtered.length - visible.length} remaining)
//             </span>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// src/pages/Listings.jsx
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