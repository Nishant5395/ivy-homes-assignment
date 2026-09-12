// scripts/compute-answers.js
//
// Pulls together everything settled so far into concrete answers.
// Run with: node scripts/compute-answers.js

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));
const rentals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'rentals.json'), 'utf-8'));
const projects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projects.json'), 'utf-8'));

const ASSIGNED_LOCALITY = 'kothrud'; // change if yours differs — check your email

const CORRUPT_IDS = [
  '100-3000174', '100-3000236', '100-3000608', '100-3001067', '100-3001543',
  '100-3001548', '100-3002344', '100-3003022', 'DWE-3000235', 'DWE-3000299',
  'DWE-3001307', 'DWE-3001849', 'DWE-3003186', 'MAG-3000932', 'MAG-3001263',
  'MAG-3001979', 'MAG-3001986', 'SQU-3000419', 'SQU-3000591', 'SQU-3001698',
  'ZER-3000380',
].sort();

// ---------------------------------------------------------------------------
// Q1: total_listing_records
// ---------------------------------------------------------------------------
const total_listing_records = listings.length;

// ---------------------------------------------------------------------------
// Q3: active_listings
// ---------------------------------------------------------------------------
const active_listings = listings.filter((l) => l.is_live === true).length;

// ---------------------------------------------------------------------------
// Q4: corrupt_listing_ids (settled)
// ---------------------------------------------------------------------------
const corrupt_listing_ids = CORRUPT_IDS;

// ---------------------------------------------------------------------------
// Q5: total_monthly_rent in assigned locality
// ---------------------------------------------------------------------------
const localityRentals = rentals.filter(
  (r) => r.locality && r.locality.toLowerCase() === ASSIGNED_LOCALITY
);
const total_monthly_rent = localityRentals.reduce((sum, r) => sum + r.price, 0);

// ---------------------------------------------------------------------------
// Q7: costliest_project
// ---------------------------------------------------------------------------
const costliestProject = projects.reduce((best, p) =>
  !best || p.price_max > best.price_max ? p : best
, null);
const costliest_project = costliestProject
  ? { project_id: costliestProject.project_id, price_max_inr: costliestProject.price_max }
  : null;

// ---------------------------------------------------------------------------
// Q10: projects_with_wrong_listing_count (settled: total_listings counts
// is_live listings, not all listings)
// ---------------------------------------------------------------------------
const liveCountByProject = {};
for (const l of listings) {
  if (l.project_id && l.is_live) {
    liveCountByProject[l.project_id] = (liveCountByProject[l.project_id] || 0) + 1;
  }
}
let projects_with_wrong_listing_count = 0;
for (const p of projects) {
  const actualLive = liveCountByProject[p.project_id] || 0;
  if (actualLive !== p.total_listings) projects_with_wrong_listing_count += 1;
}

// ---------------------------------------------------------------------------
// PENDING — fill these in once solved
// ---------------------------------------------------------------------------
const unique_properties = 'TODO — needs near-duplicate detection (Q2)';
const avg_price_per_sqft_2bhk = 'TODO — needs fake_listing_ids resolved first (Q6)';
const listings_last_7_days = 'TODO — needs timestamp/timezone verification (Q8)';
const fake_listing_ids = 'TODO — needs fraud pattern investigation (Q9)';

console.log('=== Settled answers ===');
console.log({
  total_listing_records,
  active_listings,
  corrupt_listing_ids,
  total_monthly_rent,
  costliest_project,
  projects_with_wrong_listing_count,
});

console.log('\n=== Still pending ===');
console.log({
  unique_properties,
  avg_price_per_sqft_2bhk,
  listings_last_7_days,
  fake_listing_ids,
});

console.log(`\n(Locality rentals matched for "${ASSIGNED_LOCALITY}":`, localityRentals.length, ')');