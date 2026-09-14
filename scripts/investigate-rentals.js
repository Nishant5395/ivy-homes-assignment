import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const rentals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'rentals.json'), 'utf-8'));

function section(title) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70));
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

console.log(`Loaded ${rentals.length} rentals.`);

// ---------------------------------------------------------------------------
// 1. Field inventory
// ---------------------------------------------------------------------------
section('1. FIELD INVENTORY');
const fieldCounts = {};
for (const r of rentals) {
  for (const key of Object.keys(r)) fieldCounts[key] = (fieldCounts[key] || 0) + 1;
}
for (const [key, count] of Object.entries(fieldCounts).sort()) {
  const pct = ((count / rentals.length) * 100).toFixed(1);
  console.log(`  ${key}: ${count} (${pct}%)`);
}

// ---------------------------------------------------------------------------
// 2. Duplicate listing_id
// ---------------------------------------------------------------------------
section('2. DUPLICATE listing_id CHECK');
const idCounts = {};
for (const r of rentals) idCounts[r.listing_id] = (idCounts[r.listing_id] || 0) + 1;
const dupes = Object.entries(idCounts).filter(([, c]) => c > 1);
console.log(`Duplicate listing_ids: ${dupes.length}`);
if (dupes.length) console.log(dupes.slice(0, 10));

// ---------------------------------------------------------------------------
// 3. Impossible / corrupt records
// ---------------------------------------------------------------------------
section('3. IMPOSSIBLE RECORDS');
const floorExceeds = rentals.filter((r) => r.floor > r.total_floors);
console.log(`floor > total_floors: ${floorExceeds.length}`, floorExceeds.map((r) => r.listing_id));

const carpetExceeds = rentals.filter((r) => r.carpet_area > r.super_builtup_area);
console.log(`carpet_area > super_builtup_area: ${carpetExceeds.length}`, carpetExceeds.map((r) => r.listing_id));

const nonPositivePrice = rentals.filter((r) => r.price <= 0);
console.log(`price <= 0: ${nonPositivePrice.length}`, nonPositivePrice.map((r) => r.listing_id));

const nonPositiveDeposit = rentals.filter((r) => r.deposit <= 0);
console.log(`deposit <= 0: ${nonPositiveDeposit.length}`, nonPositiveDeposit.map((r) => r.listing_id));

const negativeMaintenance = rentals.filter((r) => r.maintenance < 0);
console.log(`maintenance < 0: ${negativeMaintenance.length}`, negativeMaintenance.map((r) => r.listing_id));

const nonPlotZeroFloor = rentals.filter((r) => r.property_type !== 'plot' && r.total_floors <= 0);
console.log(`non-plot total_floors <= 0: ${nonPlotZeroFloor.length}`, nonPlotZeroFloor.map((r) => r.listing_id));

// ---------------------------------------------------------------------------
// 4. Deposit-to-rent ratio sanity (typical India norm: 2-12 months of rent)
// ---------------------------------------------------------------------------
section('4. DEPOSIT-TO-RENT RATIO');
const ratios = rentals.filter((r) => r.price > 0).map((r) => r.deposit / r.price);
console.log('Median months-of-rent-as-deposit:', median(ratios).toFixed(2));
console.log('Min:', Math.min(...ratios).toFixed(2), 'Max:', Math.max(...ratios).toFixed(2));
const weirdRatio = rentals.filter((r) => r.price > 0 && (r.deposit / r.price < 0.5 || r.deposit / r.price > 24));
console.log(`Deposit outside a plausible 0.5-24 month range: ${weirdRatio.length}`);
if (weirdRatio.length) console.log(weirdRatio.slice(0, 10).map((r) => ({ id: r.listing_id, price: r.price, deposit: r.deposit, ratio: (r.deposit / r.price).toFixed(2) })));

// ---------------------------------------------------------------------------
// 5. Price-per-sqft by website — same fraud pattern as listings?
// ---------------------------------------------------------------------------
section('5. PRICE-PER-SQFT BY WEBSITE (fraud pattern check)');
const byWebsite = {};
for (const r of rentals) {
  if (r.carpet_area <= 0 || r.price <= 0) continue;
  const ppsf = r.price / r.carpet_area;
  if (!byWebsite[r.website]) byWebsite[r.website] = [];
  byWebsite[r.website].push(ppsf);
}
for (const [site, values] of Object.entries(byWebsite)) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  console.log(`  ${site}: count=${values.length}, mean=${mean.toFixed(1)}, median=${sorted[Math.floor(sorted.length / 2)].toFixed(1)}, min=${sorted[0].toFixed(1)}, max=${sorted[sorted.length - 1].toFixed(1)}`);
}

// ---------------------------------------------------------------------------
// 6. Extreme outliers either direction
// ---------------------------------------------------------------------------
section('6. EXTREME PRICE-PER-SQFT OUTLIERS');
const ppsfList = rentals
  .filter((r) => r.carpet_area > 0 && r.price > 0)
  .map((r) => ({ id: r.listing_id, website: r.website, ppsf: r.price / r.carpet_area, bedroom: r.bedroom }))
  .sort((a, b) => a.ppsf - b.ppsf);
console.log('20 lowest:', ppsfList.slice(0, 20));
console.log('20 highest:', ppsfList.slice(-20));

// ---------------------------------------------------------------------------
// 7. Field-naming consistency vs listings (super_builtup_area, no underscore
//    before "built", vs listings' super_built_up_area)
// ---------------------------------------------------------------------------
section('7. FIELD NAME NOTE');
console.log('rentals uses "super_builtup_area" (no underscore before "built").');
console.log('listings uses "super_built_up_area". Same concept, inconsistent naming across endpoints.');

// ---------------------------------------------------------------------------
// 8. Timestamp format consistency
// ---------------------------------------------------------------------------
section('8. posted_at FORMAT CONSISTENCY');
const formatCounts = {};
for (const r of rentals) {
  const suffix = r.posted_at.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, '');
  formatCounts[suffix] = (formatCounts[suffix] || 0) + 1;
}
console.log(formatCounts);

// ---------------------------------------------------------------------------
// 9. Locality string consistency (case, spacing)
// ---------------------------------------------------------------------------
section('9. LOCALITY STRING CONSISTENCY');
const localities = [...new Set(rentals.map((r) => r.locality))].sort();
console.log(`${localities.length} distinct locality strings:`, localities);