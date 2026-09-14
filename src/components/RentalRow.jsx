// import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';

// export default function RentalRow({ rental }) {
//   return (
//     <div className="group relative flex items-center justify-between gap-4 py-5 border-b border-gray-200 pl-4 -ml-4 pr-2 transition-colors hover:bg-white/70">
//       <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />

//       <div className="min-w-0 flex-1">
//         <p className="font-serif text-lg text-ink truncate mb-1">{rental.apartment_name}</p>
//         <p className="flex items-center gap-1 text-sm text-muted mb-2">
//           <MapPin size={13} strokeWidth={1.75} className="shrink-0" />
//           {rental.locality} &nbsp;·&nbsp; {rental.property_type} &nbsp;·&nbsp; {rental.furnishing}
//         </p>
//         <div className="flex items-center gap-4 text-xs text-muted">
//           <span className="flex items-center gap-1"><BedDouble size={14} strokeWidth={1.75} /> {rental.bedroom}</span>
//           <span className="flex items-center gap-1"><Bath size={14} strokeWidth={1.75} /> {rental.bathroom}</span>
//           <span className="flex items-center gap-1"><Ruler size={14} strokeWidth={1.75} /> {rental.carpet_area} sqft</span>
//         </div>
//       </div>

//       <div className="text-right shrink-0">
//         <p className="text-gold font-medium text-xl">₹{rental.price.toLocaleString('en-IN')}<span className="text-sm text-muted font-normal">/mo</span></p>
//         <p className="text-xs text-muted mt-1">Deposit ₹{rental.deposit.toLocaleString('en-IN')}</p>
//       </div>
//     </div>
//   );
// }
// src/components/RentalRow.jsx
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';

// zerobroker rentals store `deposit` as a number of months' rent (2-10)
// instead of the actual rupee amount — see findings.json. Correct it for
// display rather than showing a nonsensical few-rupee deposit.
function correctedDeposit(rental) {
  if (rental.website === 'zerobroker' && rental.deposit > 0 && rental.deposit <= 12) {
    return rental.deposit * rental.price;
  }
  return rental.deposit;
}

export default function RentalRow({ rental }) {
  const deposit = correctedDeposit(rental);

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
        <p className="text-xs text-muted mt-1">Deposit ₹{deposit.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}