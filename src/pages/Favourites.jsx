import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavourites } from '../context/FavouritesContext.jsx';
import ListingRow from '../components/ListingRow.jsx';

export default function Favourites() {
  const { favourites, loading, error } = useFavourites();

  if (loading) return <p className="text-muted">Loading your saved listings…</p>;
  if (error) return <p className="text-red-700">Couldn't load favourites: {error}</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Saved listings</h1>
        {favourites.length > 0 && <p className="text-sm text-muted">{favourites.length} saved</p>}
      </div>

      {favourites.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 border border-dashed border-gray-300 rounded-lg">
          <Heart size={28} strokeWidth={1.5} className="text-gray-300 mb-3" />
          <p className="text-ink font-medium mb-1">Nothing saved yet</p>
          <p className="text-sm text-muted mb-4">Tap Save on any listing to keep it here.</p>
          <Link to="/" className="text-sm text-slate hover:text-ink">Browse listings &rarr;</Link>
        </div>
      ) : (
        <div>
          {favourites.map((listing) => (
            <ListingRow key={listing.listing_id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}