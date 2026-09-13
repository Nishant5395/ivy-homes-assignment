// // src/components/ListingRow.jsx
// import { Link } from 'react-router-dom';
// import SaveButton from './SaveButton';

// function formatPrice(price) {
//   if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
//   if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
//   return `₹${price.toLocaleString('en-IN')}`;
// }

// export default function ListingRow({ listing }) {
//   return (
//     <div className="flex items-center justify-between py-4 border-b border-gray-200 hover:bg-white/60 transition-colors px-2 -mx-2">
//       <Link to={`/listings/${listing.listing_id}`} className="min-w-0 flex-1">
//         <p className="font-serif text-lg text-ink truncate">{listing.apartment_name}</p>
//         <p className="text-sm text-muted">
//           {listing.locality} · {listing.bedroom} BHK · {listing.property_type} · {listing.furnishing}
//         </p>
//         <p className="text-xs text-muted mt-1">
//           {listing.carpet_area} sqft carpet · Floor {listing.floor}/{listing.total_floors}
//         </p>
//       </Link>
//       <div className="text-right shrink-0 ml-6 flex flex-col items-end gap-2">
//         <p className="text-gold font-medium text-lg">{formatPrice(listing.price)}</p>
//         <SaveButton listing={listing} />
//       </div>
//     </div>
//   );
// }

// src/components/ListingRow.jsx
import { Link } from 'react-router-dom';
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';
import SaveButton from './SaveButton';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ListingRow({ listing }) {
  return (
    <div className="group relative flex items-center justify-between gap-4 py-5 border-b border-gray-200 pl-4 -ml-4 pr-2 transition-colors hover:bg-white/70">
      <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />

      <Link to={`/listings/${listing.listing_id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-serif text-lg text-ink truncate">{listing.apartment_name}</p>
          {!listing.is_live && (
            <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded bg-gray-200 text-muted">Inactive</span>
          )}
        </div>
        <p className="flex items-center gap-1 text-sm text-muted mb-2">
          <MapPin size={13} strokeWidth={1.75} className="shrink-0" />
          {listing.locality} &nbsp;·&nbsp; {listing.property_type} &nbsp;·&nbsp; {listing.furnishing}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><BedDouble size={14} strokeWidth={1.75} /> {listing.bedroom}</span>
          <span className="flex items-center gap-1"><Bath size={14} strokeWidth={1.75} /> {listing.bathroom}</span>
          <span className="flex items-center gap-1"><Ruler size={14} strokeWidth={1.75} /> {listing.carpet_area} sqft</span>
        </div>
      </Link>

      <div className="text-right shrink-0 flex flex-col items-end gap-2">
        <p className="text-gold font-medium text-xl">{formatPrice(listing.price)}</p>
        <SaveButton listing={listing} />
      </div>
    </div>
  );
}