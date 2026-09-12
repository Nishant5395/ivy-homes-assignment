// scripts/investigate-duplicates2.js
//
// Looser duplicate check: same apartment_name + locality + bedroom (ignoring
// floor and carpet_area, since those might be exactly the corrupted/faked
// fields). Checks whether corrupt/fake records are secretly duplicates of an
// already-genuine property.
//
// Run with: node scripts/investigate-duplicates2.js

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));

const CORRUPT_IDS = new Set([
  '100-3000174', '100-3000236', '100-3000608', '100-3001067', '100-3001543',
  '100-3001548', '100-3002344', '100-3003022', 'DWE-3000235', 'DWE-3000299',
  'DWE-3001307', 'DWE-3001849', 'DWE-3003186', 'MAG-3000932', 'MAG-3001263',
  'MAG-3001979', 'MAG-3001986', 'SQU-3000419', 'SQU-3000591', 'SQU-3001698',
  'ZER-3000380',
]);

function medianFor(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
const normalMedianAreaByBhk = {};
for (const bhk of [0, 1, 2, 3, 4, 5]) {
  const normalOfBhk = listings.filter((l) => l.bedroom === bhk && l.website !== 'magichomes' && l.carpet_area > 0);
  if (normalOfBhk.length > 0) normalMedianAreaByBhk[bhk] = medianFor(normalOfBhk.map((l) => l.carpet_area));
}
const FAKE_IDS = new Set(
  listings
    .filter((l) => {
      const m = normalMedianAreaByBhk[l.bedroom];
      return m && l.carpet_area > 0 && l.carpet_area / m < 0.2;
    })
    .map((l) => l.listing_id)
);

// ---------------------------------------------------------------------------
// 1. Loose key: apartment_name + locality + bedroom (ignore floor/carpet_area)
// ---------------------------------------------------------------------------
const byLooseKey = {};
for (const l of listings) {
  const key = [l.apartment_name, l.locality, l.bedroom].join('|');
  if (!byLooseKey[key]) byLooseKey[key] = [];
  byLooseKey[key].push(l);
}
const looseGroups = Object.entries(byLooseKey).filter(([, group]) => group.length > 1);
console.log(`--- Loose match (name+locality+bedroom): ${looseGroups.length} groups ---`);

// Of those, how many contain at least one corrupt/fake record alongside a normal one?
let mixedGroups = 0;
const mixedExamples = [];
for (const [key, group] of looseGroups) {
  const hasCorruptOrFake = group.some((l) => CORRUPT_IDS.has(l.listing_id) || FAKE_IDS.has(l.listing_id));
  const hasNormal = group.some((l) => !CORRUPT_IDS.has(l.listing_id) && !FAKE_IDS.has(l.listing_id));
  if (hasCorruptOrFake && hasNormal) {
    mixedGroups += 1;
    if (mixedExamples.length < 10) {
      mixedExamples.push({ key, group: group.map((l) => ({ id: l.listing_id, floor: l.floor, carpet_area: l.carpet_area, tagged: CORRUPT_IDS.has(l.listing_id) ? 'corrupt' : FAKE_IDS.has(l.listing_id) ? 'fake' : 'normal' })) });
    }
  }
}
console.log(`Groups mixing a corrupt/fake record with a normal one (same name+locality+bedroom): ${mixedGroups}`);
console.log(JSON.stringify(mixedExamples, null, 2));
console.log('');

// ---------------------------------------------------------------------------
// 2. Distinct property count using the loose key (name+locality+bedroom)
//    as a candidate for unique_properties — likely too aggressive (a
//    building can legitimately have many distinct 2BHKs), but useful as a
//    ceiling/floor comparison
// ---------------------------------------------------------------------------
console.log('Total records:', listings.length);
console.log('Distinct (name+locality+bedroom) combos:', Object.keys(byLooseKey).length);
console.log('(This is almost certainly an UNDER-count of real distinct properties, since a building can have many separate 2BHK units — shown only for comparison)');