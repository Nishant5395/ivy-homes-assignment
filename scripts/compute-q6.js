// scripts/compute-q6.js
//
// Question 6: Across retrievable listing records where is_live is true and
// bedroom is 2, leaving out the records in answers to Q4 (corrupt) and Q9
// (fake): the mean of price divided by carpet area, in rupees per square
// foot, to 2 decimals.
//
// Run with: node scripts/compute-q6.js

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));

// ---- Settled answer to Q4 ----
const CORRUPT_IDS = new Set([
  '100-3000174', '100-3000236', '100-3000608', '100-3001067', '100-3001543',
  '100-3001548', '100-3002344', '100-3003022', 'DWE-3000235', 'DWE-3000299',
  'DWE-3001307', 'DWE-3001849', 'DWE-3003186', 'MAG-3000932', 'MAG-3001263',
  'MAG-3001979', 'MAG-3001986', 'SQU-3000419', 'SQU-3000591', 'SQU-3001698',
  'ZER-3000380',
]);

// ---- Settled answer to Q9 (recompute directly here for consistency) ----
function medianFor(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
const normalMedianAreaByBhk = {};
for (const bhk of [0, 1, 2, 3, 4, 5]) {
  const normalOfBhk = listings.filter(
    (l) => l.bedroom === bhk && l.website !== 'magichomes' && l.carpet_area > 0
  );
  if (normalOfBhk.length > 0) {
    normalMedianAreaByBhk[bhk] = medianFor(normalOfBhk.map((l) => l.carpet_area));
  }
}
const FAKE_IDS = new Set(
  listings
    .filter((l) => {
      const normalMedian = normalMedianAreaByBhk[l.bedroom];
      if (!normalMedian || l.carpet_area <= 0) return false;
      return l.carpet_area / normalMedian < 0.2;
    })
    .map((l) => l.listing_id)
);

console.log('Corrupt IDs:', CORRUPT_IDS.size, '| Fake IDs:', FAKE_IDS.size);
const overlap = [...CORRUPT_IDS].filter((id) => FAKE_IDS.has(id));
console.log('Overlap between corrupt and fake:', overlap);
console.log('');

// ---- Now compute Q6 ----
const eligible = listings.filter(
  (l) =>
    l.is_live === true &&
    l.bedroom === 2 &&
    !CORRUPT_IDS.has(l.listing_id) &&
    !FAKE_IDS.has(l.listing_id) &&
    l.carpet_area > 0
);

console.log('Eligible 2BHK live listings (after exclusions):', eligible.length);

const ppsfValues = eligible.map((l) => l.price / l.carpet_area);
const avg = ppsfValues.reduce((a, b) => a + b, 0) / ppsfValues.length;

console.log('avg_price_per_sqft_2bhk =', avg.toFixed(2));

// Sanity: also show what it would be WITHOUT exclusions, for comparison
const allTwoBhkLive = listings.filter((l) => l.is_live === true && l.bedroom === 2 && l.carpet_area > 0);
const allPpsf = allTwoBhkLive.map((l) => l.price / l.carpet_area);
const allAvg = allPpsf.reduce((a, b) => a + b, 0) / allPpsf.length;
console.log('(sanity check) same calc WITHOUT excluding corrupt/fake:', allAvg.toFixed(2), 'over', allTwoBhkLive.length, 'listings');