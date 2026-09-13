// src/context/FavouritesContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const data = await api.favourites();
      const results = data.results || [];
      setFavourites(results);
      setFavouriteIds(new Set(results.map((l) => l.listing_id)));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) refresh();
    else {
      setFavourites([]);
      setFavouriteIds(new Set());
      setLoading(false);
    }
  }, [isLoggedIn, refresh]);

  const isFavourite = useCallback((listingId) => favouriteIds.has(listingId), [favouriteIds]);

  const toggleFavourite = useCallback(async (listing) => {
    const id = listing.listing_id;
    const currentlyFavourite = favouriteIds.has(id);

    setFavouriteIds((prev) => {
      const next = new Set(prev);
      if (currentlyFavourite) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (currentlyFavourite) {
        await api.removeFavourite(id);
        setFavourites((prev) => prev.filter((l) => l.listing_id !== id));
      } else {
        await api.addFavourite(id);
        setFavourites((prev) => [...prev, listing]);
      }
    } catch (err) {
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFavourite) next.add(id);
        else next.delete(id);
        return next;
      });
      throw err;
    }
  }, [favouriteIds]);

  const value = { favourites, isFavourite, toggleFavourite, loading, error, refresh };

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}
