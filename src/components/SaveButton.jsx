// // src/components/SaveButton.jsx
// import { useState } from 'react';
// import { useFavourites } from '../context/FavouritesContext';

// export default function SaveButton({ listing, className = '' }) {
//   const { isFavourite, toggleFavourite } = useFavourites();
//   const [busy, setBusy] = useState(false);
//   const saved = isFavourite(listing.listing_id);

//   async function handleClick(e) {
//     e.preventDefault(); // in case this button sits inside a <Link>
//     e.stopPropagation();
//     setBusy(true);
//     try {
//       await toggleFavourite(listing);
//     } catch {
//       // silently ignore — optimistic state already reverted by the context
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <button
//       onClick={handleClick}
//       disabled={busy}
//       className={`text-sm px-3 py-1.5 rounded border transition-colors ${
//         saved
//           ? 'border-gold text-gold bg-gold/10'
//           : 'border-gray-300 text-muted hover:border-slate hover:text-slate'
//       } ${className}`}
//     >
//       {saved ? '★ Saved' : '☆ Save'}
//     </button>
//   );
// }

// src/components/SaveButton.jsx
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavourites } from '../context/FavouritesContext.jsx';

export default function SaveButton({ listing, className = '' }) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const [busy, setBusy] = useState(false);
  const saved = isFavourite(listing.listing_id);

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    try {
      await toggleFavourite(listing);
    } catch {
      // optimistic state already reverted by the context on failure
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={saved ? 'Remove from saved' : 'Save listing'}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        saved ? 'text-gold' : 'text-muted hover:text-ink'
      } ${className}`}
    >
      <Heart size={16} strokeWidth={1.75} fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}