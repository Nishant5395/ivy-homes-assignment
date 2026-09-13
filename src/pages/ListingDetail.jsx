import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BedDouble, Bath, Ruler, Building2, Compass, CarFront, BadgeCheck } from 'lucide-react';
import { api } from '../api/client.js';
import SaveButton from '../components/SaveButton.jsx';

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={18} strokeWidth={1.5} className="text-muted mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-ink font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.listing(id)
      .then((data) => { if (!cancelled) setListing(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    api.similarListings(id)
      .then((data) => { if (!cancelled) setSimilar(data.results || data || []); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <p className="text-muted">Loading…</p>;
  if (error) return <p className="text-red-700">Couldn't load this listing: {error}</p>;
  if (!listing) return null;

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink mb-6">
        <ArrowLeft size={15} strokeWidth={1.75} /> Back to listings
      </Link>

      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="font-serif text-3xl text-ink">{listing.apartment_name}</h1>
        <SaveButton listing={listing} className="mt-2 shrink-0" />
      </div>

      <p className="text-muted mb-1">
        {listing.locality} · {listing.bedroom} BHK {listing.property_type} · {listing.furnishing}
        {!listing.is_live && <span className="ml-2 text-red-700 font-medium">Inactive</span>}
      </p>

      <p className="text-gold text-4xl font-serif mt-4 mb-8">{formatPrice(listing.price)}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 mb-10 p-6 bg-white border border-gray-200 rounded-lg">
        <Spec icon={Ruler} label="Carpet area" value={`${listing.carpet_area} sqft`} />
        <Spec icon={Building2} label="Super built-up" value={`${listing.super_built_up_area} sqft`} />
        <Spec icon={BedDouble} label="Floor" value={`${listing.floor} of ${listing.total_floors}`} />
        <Spec icon={Compass} label="Facing" value={<span className="capitalize">{listing.facing_direction}</span>} />
        <Spec icon={Bath} label="Bathrooms" value={listing.bathroom} />
        <Spec icon={BedDouble} label="Balcony" value={listing.balcony} />
        <Spec icon={CarFront} label="Parking" value={listing.covered_parking} />
        <Spec icon={BadgeCheck} label="Verified" value={listing.is_verified ? 'Yes' : 'No'} />
      </div>

      <div className="mb-10 max-w-2xl">
        <h2 className="text-sm text-muted mb-2">Description</h2>
        <p className="text-ink leading-relaxed">{listing.description}</p>
      </div>

      <div className="mb-10 text-sm">
        <h2 className="text-muted mb-1">Posted by</h2>
        <p className="text-ink">{listing.posted_by_name} <span className="text-muted">({listing.posted_by})</span> · {listing.posted_by_contact}</p>
      </div>

      {similar.length > 0 && (
        <div>
          <h2 className="font-serif text-xl text-ink mb-4">You may also like</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {similar.slice(0, 4).map((s) => (
              <Link
                key={s.listing_id}
                to={`/listings/${s.listing_id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-slate/50 hover:bg-white transition-colors"
              >
                <p className="text-ink font-medium truncate">{s.apartment_name}</p>
                <p className="text-sm text-muted mb-1">{s.locality} · {s.bedroom} BHK</p>
                <p className="text-gold font-medium">{formatPrice(s.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}