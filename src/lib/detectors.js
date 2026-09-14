export function isCorrupt(listing) {
  return (
    listing.price <= 0 ||
    listing.floor > listing.total_floors ||
    listing.carpet_area > listing.super_built_up_area
  );
}

/**
 * Builds a bedroom-count -> median carpet_area lookup from a set of
 * "normal" listings (i.e. excluding the source known to fake listings).
 * Used as the baseline for detecting Q9's fake listings.
 */
export function computeNormalMedianAreaByBhk(listings, excludeWebsite = 'magichomes') {
  const byBhk = {};
  for (const l of listings) {
    if (l.website === excludeWebsite || l.carpet_area <= 0) continue;
    if (!byBhk[l.bedroom]) byBhk[l.bedroom] = [];
    byBhk[l.bedroom].push(l.carpet_area);
  }
  const medians = {};
  for (const [bhk, areas] of Object.entries(byBhk)) {
    const sorted = [...areas].sort((a, b) => a - b);
    medians[bhk] = sorted[Math.floor(sorted.length / 2)];
  }
  return medians;
}

/**
 * Q9 — a listing's carpet_area is far below the normal median for its
 * bedroom count (threshold 0.2, well above the observed ~0.09-0.11 pattern,
 * confirmed stable across a 0.15-0.25 sensitivity sweep).
 */
export function isFakeListing(listing, normalMedianAreaByBhk, threshold = 0.2) {
  const median = normalMedianAreaByBhk[listing.bedroom];
  if (!median || listing.carpet_area <= 0) return false;
  return listing.carpet_area / median < threshold;
}

/**
 * Rentals finding — zerobroker rentals store `deposit` as a small integer
 * (2-10) representing months of rent, instead of the actual rupee amount
 * every other source uses. Corrects it for display.
 */
export function correctedDeposit(rental) {
  if (rental.website === 'zerobroker' && rental.deposit > 0 && rental.deposit <= 12) {
    return rental.deposit * rental.price;
  }
  return rental.deposit;
}