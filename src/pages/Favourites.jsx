// src/pages/Favourites.jsx
import { useFavourites } from '../context/FavouritesContext';
import ListingRow from '../components/ListingRow';

export default function Favourites() {
  const { favourites, loading, error } = useFavourites();

  if (loading) return <p className="text-muted">Loading your saved listings…</p>;
  if (error) return <p className="text-red-700">Couldn't load favourites: {error}</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-6">Saved listings</h1>
      {favourites.length === 0 ? (
        <p className="text-muted">You haven't saved any listings yet. Browse listings and tap Save to add some here.</p>
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
