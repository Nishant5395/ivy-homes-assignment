import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));
const projects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projects.json'), 'utf-8'));

// ---------------------------------------------------------------------------
// 1. Overlap between the three "impossible" record checks
// ---------------------------------------------------------------------------
const floorExceeds = new Set(
  listings.filter((l) => l.floor > l.total_floors).map((l) => l.listing_id)
);
const carpetExceedsSuper = new Set(
  listings.filter((l) => l.carpet_area > l.super_built_up_area).map((l) => l.listing_id)
);
const nonPositivePrice = new Set(
  listings.filter((l) => l.price <= 0).map((l) => l.listing_id)
);

const unionAll = new Set([...floorExceeds, ...carpetExceedsSuper, ...nonPositivePrice]);
const intersectAll = [...unionAll].filter(
  (id) => floorExceeds.has(id) && carpetExceedsSuper.has(id) && nonPositivePrice.has(id)
);

console.log('--- Overlap between the three anomaly checks ---');
console.log('  floor > total_floors:', [...floorExceeds]);
console.log('  carpet_area > super_built_up_area:', [...carpetExceedsSuper]);
console.log('  non-positive price:', [...nonPositivePrice]);
console.log('  union (any of the three):', [...unionAll].sort());
console.log('  intersection (all three at once):', intersectAll.sort());
console.log('');

// Print full records for the union so you can eyeball what's actually wrong
console.log('--- Full records for the union set ---');
for (const id of [...unionAll].sort()) {
  const rec = listings.find((l) => l.listing_id === id);
  console.log(JSON.stringify(rec, null, 2));
}
console.log('');

// ---------------------------------------------------------------------------
// 2. Are zero/negative floor records actually plots (legitimate, no floors)?
// ---------------------------------------------------------------------------
const zeroFloorRecords = listings.filter((l) => l.floor <= 0 || l.total_floors <= 0);
const propertyTypeBreakdown = {};
for (const l of zeroFloorRecords) {
  propertyTypeBreakdown[l.property_type] = (propertyTypeBreakdown[l.property_type] || 0) + 1;
}
console.log('--- property_type breakdown among zero/negative floor records ---');
console.log(propertyTypeBreakdown);
console.log('  total such records:', zeroFloorRecords.length);
console.log('');

// Also check: among NON-plot property types, how many have zero/negative floor?
// (if plots explain almost all of it, remaining ones are more suspicious)
const nonPlotZeroFloor = zeroFloorRecords.filter((l) => l.property_type !== 'plot');
console.log('--- Zero/negative floor records that are NOT plots ---');
console.log('  count:', nonPlotZeroFloor.length);
console.log('  examples:', nonPlotZeroFloor.slice(0, 10).map((l) => ({
  id: l.listing_id,
  property_type: l.property_type,
  floor: l.floor,
  total_floors: l.total_floors,
})));
console.log('');

// ---------------------------------------------------------------------------
// 3. Project total_listings mismatch — direction and magnitude
// ---------------------------------------------------------------------------
const actualCountByProject = {};
for (const l of listings) {
  if (l.project_id) {
    actualCountByProject[l.project_id] = (actualCountByProject[l.project_id] || 0) + 1;
  }
}

let higherDocumented = 0; // docs say more than actual
let higherActual = 0; // actual has more than docs say
let exactMatch = 0;
const diffs = [];

for (const p of projects) {
  const actual = actualCountByProject[p.project_id] || 0;
  const diff = p.total_listings - actual;
  if (diff === 0) exactMatch += 1;
  else if (diff > 0) higherDocumented += 1;
  else higherActual += 1;
  diffs.push(diff);
}

console.log('--- Project total_listings mismatch direction ---');
console.log('  exact match:', exactMatch);
console.log('  documented HIGHER than actual:', higherDocumented);
console.log('  actual HIGHER than documented:', higherActual);

// Look at the distribution of diffs — is there a consistent offset?
const diffCounts = {};
for (const d of diffs) {
  diffCounts[d] = (diffCounts[d] || 0) + 1;
}
console.log('  diff value distribution (documented - actual):', diffCounts);
console.log('');

// ---------------------------------------------------------------------------
// 4. Corrected check: total_floors <= 0 for NON-plot properties only
//    (floor: 0 is a normal ground floor, not an anomaly)
// ---------------------------------------------------------------------------
const impossibleFloors = listings.filter(
  (l) => l.property_type !== 'plot' && l.total_floors <= 0
);
console.log('--- Non-plot listings with total_floors <= 0 (genuinely impossible) ---');
console.log('  count:', impossibleFloors.length);
console.log('  ids:', impossibleFloors.map((l) => l.listing_id));
console.log('');

// ---------------------------------------------------------------------------
// 5. Does total_listings match live-only listings instead of all listings?
// ---------------------------------------------------------------------------
const liveCountByProject = {};
for (const l of listings) {
  if (l.project_id && l.is_live) {
    liveCountByProject[l.project_id] = (liveCountByProject[l.project_id] || 0) + 1;
  }
}

let liveExactMatch = 0;
for (const p of projects) {
  const actualLive = liveCountByProject[p.project_id] || 0;
  if (actualLive === p.total_listings) liveExactMatch += 1;
}
console.log('--- Does total_listings match count of is_live=true listings instead? ---');
console.log('  exact match against LIVE-only count:', liveExactMatch, 'out of', projects.length);
console.log('  (compare to exact match against ALL listings:', exactMatch, ')');
console.log('');

// ---------------------------------------------------------------------------
// 6. Refine further: live-only count, EXCLUDING the 21 corrupt listings found
// ---------------------------------------------------------------------------
const corruptIds = new Set([
  '100-3000174', '100-3000236', '100-3000608', '100-3001067', '100-3001543',
  '100-3001548', '100-3002344', '100-3003022', 'DWE-3000235', 'DWE-3000299',
  'DWE-3001307', 'DWE-3001849', 'DWE-3003186', 'MAG-3000932', 'MAG-3001263',
  'MAG-3001979', 'MAG-3001986', 'SQU-3000419', 'SQU-3000591', 'SQU-3001698',
  'ZER-3000380',
]);

const liveNonCorruptCountByProject = {};
for (const l of listings) {
  if (l.project_id && l.is_live && !corruptIds.has(l.listing_id)) {
    liveNonCorruptCountByProject[l.project_id] = (liveNonCorruptCountByProject[l.project_id] || 0) + 1;
  }
}

let liveNonCorruptExactMatch = 0;
const remainingMismatches = [];
for (const p of projects) {
  const actual = liveNonCorruptCountByProject[p.project_id] || 0;
  if (actual === p.total_listings) {
    liveNonCorruptExactMatch += 1;
  } else {
    remainingMismatches.push({ project_id: p.project_id, documented: p.total_listings, actual, diff: p.total_listings - actual });
  }
}
console.log('--- total_listings vs LIVE, NON-CORRUPT listings only ---');
console.log('  exact match:', liveNonCorruptExactMatch, 'out of', projects.length);
console.log('  remaining mismatches:', remainingMismatches.length);
console.log('  first 20 remaining mismatches:', remainingMismatches.slice(0, 20));

// Diff distribution of what's left, to spot a further pattern (e.g. fake listings)
const remainingDiffCounts = {};
for (const m of remainingMismatches) {
  remainingDiffCounts[m.diff] = (remainingDiffCounts[m.diff] || 0) + 1;
}
console.log('  remaining diff distribution:', remainingDiffCounts);