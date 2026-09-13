// // src/components/RentalRow.jsx
// export default function RentalRow({ rental }) {
//   return (
//     <div className="flex items-center justify-between py-4 border-b border-gray-200 px-2 -mx-2">
//       <div className="min-w-0">
//         <p className="font-serif text-lg text-ink truncate">{rental.apartment_name}</p>
//         <p className="text-sm text-muted">
//           {rental.locality} · {rental.bedroom} BHK · {rental.property_type} · {rental.furnishing}
//         </p>
//         <p className="text-xs text-muted mt-1">
//           {rental.carpet_area} sqft carpet · Floor {rental.floor}/{rental.total_floors} · Deposit ₹{rental.deposit.toLocaleString('en-IN')}
//         </p>
//       </div>
//       <div className="text-right shrink-0 ml-6">
//         <p className="text-gold font-medium text-lg">₹{rental.price.toLocaleString('en-IN')}/mo</p>
//         <p className="text-xs text-muted">+ ₹{rental.maintenance.toLocaleString('en-IN')} maintenance</p>
//       </div>
//     </div>
//   );
// }

// src/components/RentalRow.jsx
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';

export default function RentalRow({ rental }) {
  return (
    <div className="group relative flex items-center justify-between gap-4 py-5 border-b border-gray-200 pl-4 -ml-4 pr-2 transition-colors hover:bg-white/70">
      <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />

      <div className="min-w-0 flex-1">
        <p className="font-serif text-lg text-ink truncate mb-1">{rental.apartment_name}</p>
        <p className="flex items-center gap-1 text-sm text-muted mb-2">
          <MapPin size={13} strokeWidth={1.75} className="shrink-0" />
          {rental.locality} &nbsp;·&nbsp; {rental.property_type} &nbsp;·&nbsp; {rental.furnishing}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><BedDouble size={14} strokeWidth={1.75} /> {rental.bedroom}</span>
          <span className="flex items-center gap-1"><Bath size={14} strokeWidth={1.75} /> {rental.bathroom}</span>
          <span className="flex items-center gap-1"><Ruler size={14} strokeWidth={1.75} /> {rental.carpet_area} sqft</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-gold font-medium text-xl">₹{rental.price.toLocaleString('en-IN')}<span className="text-sm text-muted font-normal">/mo</span></p>
        <p className="text-xs text-muted mt-1">Deposit ₹{rental.deposit.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}