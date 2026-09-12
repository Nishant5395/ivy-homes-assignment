// scripts/investigate-duplicates.js
//
// Question 2: how many DISTINCT properties do all listing records describe?
// A property described by several records counts once. Likely mechanism:
// the same physical unit cross-posted to multiple portals (100acres,
// dwelling, squarelane, zerobroker) under different listing_ids.
//
// Run with: node scripts/investigate-duplicates.js

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));

// ---------------------------------------------------------------------------
// 1. Exact coordinate matches — regardless of apartment name this time
// ---------------------------------------------------------------------------
const byCoords = {};
for (const l of listings) {
  const key = `${l.latitude},${l.longitude}`;
  if (!byCoords[key]) byCoords[key] = [];
  byCoords[key].push(l);
}
const coordGroups = Object.entries(byCoords).filter(([, group]) => group.length > 1);
console.log(`--- Exact coordinate matches (any name): ${coordGroups.length} groups, ${coordGroups.reduce((s, [, g]) => s + g.length, 0)} total listings involved ---`);
for (const [coords, group] of coordGroups.slice(0, 15)) {
  console.log(`  ${coords}:`, group.map((l) => ({
    id: l.listing_id, website: l.website, name: l.apartment_name, locality: l.locality,
    bedroom: l.bedroom, floor: l.floor, carpet_area: l.carpet_area,
  })));
}
console.log('');

// ---------------------------------------------------------------------------
// 2. Fuzzy key: same apartment_name + locality + bedroom + floor + carpet_area
//    (should uniquely identify a real physical unit, regardless of website)
// ---------------------------------------------------------------------------
const byFuzzyKey = {};
for (const l of listings) {
  const key = [l.apartment_name, l.locality, l.bedroom, l.floor, l.carpet_area].join('|');
  if (!byFuzzyKey[key]) byFuzzyKey[key] = [];
  byFuzzyKey[key].push(l);
}
const fuzzyGroups = Object.entries(byFuzzyKey).filter(([, group]) => group.length > 1);
console.log(`--- Fuzzy match (name+locality+bedroom+floor+carpet_area): ${fuzzyGroups.length} groups ---`);
for (const [key, group] of fuzzyGroups.slice(0, 15)) {
  console.log(`  ${key}:`, group.map((l) => ({ id: l.listing_id, website: l.website, price: l.price })));
}
console.log('');

// How many distinct websites appear within each fuzzy group? (cross-posting signal)
const crossPostedGroups = fuzzyGroups.filter(([, group]) => new Set(group.map((l) => l.website)).size > 1);
console.log(`--- Of those, groups spanning MULTIPLE websites (true cross-posting signal): ${crossPostedGroups.length} ---`);
console.log('');

// ---------------------------------------------------------------------------
// 3. Total record count vs. distinct fuzzy-key count — gives a candidate
//    answer for "unique_properties"
// ---------------------------------------------------------------------------
const totalRecords = listings.length;
const distinctFuzzyKeys = Object.keys(byFuzzyKey).length;
console.log(`Total listing records: ${totalRecords}`);
console.log(`Distinct fuzzy keys (candidate unique_properties): ${distinctFuzzyKeys}`);
console.log(`Difference (records that are "extra" copies): ${totalRecords - distinctFuzzyKeys}`);