// src/components/RentalRow.jsx
export default function RentalRow({ rental }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 px-2 -mx-2">
      <div className="min-w-0">
        <p className="font-serif text-lg text-ink truncate">{rental.apartment_name}</p>
        <p className="text-sm text-muted">
          {rental.locality} · {rental.bedroom} BHK · {rental.property_type} · {rental.furnishing}
        </p>
        <p className="text-xs text-muted mt-1">
          {rental.carpet_area} sqft carpet · Floor {rental.floor}/{rental.total_floors} · Deposit ₹{rental.deposit.toLocaleString('en-IN')}
        </p>
      </div>
      <div className="text-right shrink-0 ml-6">
        <p className="text-gold font-medium text-lg">₹{rental.price.toLocaleString('en-IN')}/mo</p>
        <p className="text-xs text-muted">+ ₹{rental.maintenance.toLocaleString('en-IN')} maintenance</p>
      </div>
    </div>
  );
}
