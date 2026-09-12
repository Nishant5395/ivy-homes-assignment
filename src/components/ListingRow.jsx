// src/components/ListingRow.jsx
import { Link } from 'react-router-dom';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ListingRow({ listing }) {
  return (
    <Link
      to={`/listings/${listing.listing_id}`}
      className="flex items-center justify-between py-4 border-b border-gray-200 hover:bg-white/60 transition-colors px-2 -mx-2"
    >
      <div className="min-w-0">
        <p className="font-serif text-lg text-ink truncate">{listing.apartment_name}</p>
        <p className="text-sm text-muted">
          {listing.locality} · {listing.bedroom} BHK · {listing.property_type} · {listing.furnishing}
        </p>
        <p className="text-xs text-muted mt-1">
          {listing.carpet_area} sqft carpet · Floor {listing.floor}/{listing.total_floors}
        </p>
      </div>
      <div className="text-right shrink-0 ml-6">
        <p className="text-gold font-medium text-lg">{formatPrice(listing.price)}</p>
        {!listing.is_live && (
          <span className="text-xs text-muted">Inactive</span>
        )}
      </div>
    </Link>
  );
}
