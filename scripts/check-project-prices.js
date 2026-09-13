// scripts/check-project-prices.js
//
// costliest_project came back as price_max: 99.9 — clearly not raw rupees.
// Checking whether this is an isolated units bug (like the 5 listings with
// price in thousands) or systemic across projects.
//
// Run with: node scripts/check-project-prices.js

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const projects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projects.json'), 'utf-8'));

// ---------------------------------------------------------------------------
// 1. Full raw record for the suspect project
// ---------------------------------------------------------------------------
const suspect = projects.find((p) => p.project_id === 'P30394');
console.log('--- Full raw record for P30394 ---');
console.log(JSON.stringify(suspect, null, 2));
console.log('');

// ---------------------------------------------------------------------------
// 2. Distribution of price_max across ALL projects — is this an outlier or
//    part of a cluster of similarly-scaled-down values?
// ---------------------------------------------------------------------------
const sorted = [...projects].sort((a, b) => a.price_max - b.price_max);
console.log('--- 20 LOWEST price_max values across all projects ---');
console.log(sorted.slice(0, 20).map((p) => ({ id: p.project_id, price_min: p.price_min, price_max: p.price_max, min_area: p.min_area_sqft, max_area: p.max_area_sqft })));
console.log('');
console.log('--- 10 HIGHEST price_max values across all projects ---');
console.log(sorted.slice(-10).map((p) => ({ id: p.project_id, price_min: p.price_min, price_max: p.price_max })));
console.log('');

// ---------------------------------------------------------------------------
// 3. How many projects have a suspiciously small price_max (< 10000, an
//    impossible rupee amount for a whole property)?
// ---------------------------------------------------------------------------
const suspiciouslySmall = projects.filter((p) => p.price_max < 10000);
console.log(`--- Projects with price_max < 10,000 (impossible as plain rupees): ${suspiciouslySmall.length} ---`);
console.log(suspiciouslySmall.map((p) => ({ id: p.project_id, price_min: p.price_min, price_max: p.price_max })));
console.log('');

// Same check for price_min
const suspiciouslySmallMin = projects.filter((p) => p.price_min < 10000);
console.log(`--- Projects with price_min < 10,000: ${suspiciouslySmallMin.length} ---`);
console.log(suspiciouslySmallMin.map((p) => ({ id: p.project_id, price_min: p.price_min, price_max: p.price_max })));
console.log('');

// ---------------------------------------------------------------------------
// 4. If we correct P30394 by treating its value as CRORES instead of rupees
//    (x 10,000,000), does it land in a plausible range vs other projects?
// ---------------------------------------------------------------------------
if (suspect) {
  console.log('--- Correction check for P30394 ---');
  console.log('  as-is (assumed rupees):', suspect.price_max);
  console.log('  if actually in crores (x 1e7):', suspect.price_max * 1e7);
  console.log('  if actually in lakhs (x 1e5):', suspect.price_max * 1e5);
  console.log('  price_min for comparison:', suspect.price_min);
}

// ---------------------------------------------------------------------------
// 5. Recompute costliest_project EXCLUDING any suspiciously-scaled projects,
//    to get a safe fallback answer
// ---------------------------------------------------------------------------
const plausibleProjects = projects.filter((p) => p.price_max >= 10000);
const costliestPlausible = plausibleProjects.reduce((best, p) => (!best || p.price_max > best.price_max ? p : best), null);
console.log('\n--- Costliest project EXCLUDING suspiciously-scaled ones ---');
console.log(costliestPlausible);