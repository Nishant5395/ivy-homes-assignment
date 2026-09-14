import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { isCorrupt, computeNormalMedianAreaByBhk, isFakeListing } from '../src/lib/detectors.js';

const BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const DEMO_EMAIL = process.env.DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
const ASSIGNED_LOCALITY = 'kothrud'; // change if yours differs

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const SUBMISSION_PATH = path.join(ROOT, 'submission.json');

function section(title) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70));
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

// ---------------------------------------------------------------------------
// STEP 1 — Auth (real mechanism: X-API-Key header + bearer token + refresh)
// ---------------------------------------------------------------------------
async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { accessToken: data.access_token, refreshToken: data.refresh_token || refreshToken };
}

// ---------------------------------------------------------------------------
// STEP 2 — Fetch every record from a collection endpoint (real mechanism:
// offset/limit, max limit 50, stop on has_more: false — NOT the documented
// but non-functional page/limit scheme)
// ---------------------------------------------------------------------------
async function fetchAll(endpointPath, tokens) {
  const all = [];
  let offset = 0;
  const limit = 50;
  let currentTokens = tokens;

  while (true) {
    const url = `${BASE_URL}${endpointPath}?offset=${offset}&limit=${limit}`;
    let res = await fetch(url, {
      headers: { 'X-API-Key': API_KEY, Authorization: `Bearer ${currentTokens.accessToken}` },
    });

    if (res.status === 401) {
      const refreshed = (await refreshAccessToken(currentTokens.refreshToken)) || (await login());
      currentTokens = refreshed;
      res = await fetch(url, {
        headers: { 'X-API-Key': API_KEY, Authorization: `Bearer ${currentTokens.accessToken}` },
      });
    }

    if (!res.ok) throw new Error(`${endpointPath} failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    all.push(...(data.results || []));
    if (!data.has_more) break;
    offset += limit;
  }

  return all;
}

async function main() {
  section('STEP 1 — LOGIN');
  const tokens = await login();
  console.log('Logged in as', DEMO_EMAIL);

  section('STEP 2 — FETCH FULL DATASET (offset/limit pagination)');
  const listings = await fetchAll('/v1/listings', tokens);
  console.log('listings:', listings.length);
  const rentals = await fetchAll('/v1/rentals', tokens);
  console.log('rentals:', rentals.length);
  const projects = await fetchAll('/v1/projects', tokens);
  console.log('projects:', projects.length);

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  fs.writeFileSync(path.join(DATA_DIR, 'listings.json'), JSON.stringify(listings, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'rentals.json'), JSON.stringify(rentals, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'projects.json'), JSON.stringify(projects, null, 2));

  // ---------------------------------------------------------------------
  // Q4 — corrupt_listing_ids: negative price, floor > total_floors,
  // carpet_area > super_built_up_area (three equal, non-overlapping groups)
  // ---------------------------------------------------------------------
 section('Q4 — CORRUPT LISTINGS');
const corruptIds = listings.filter(isCorrupt).map((l) => l.listing_id).sort();
console.log('Total corrupt (using tested isCorrupt()):', corruptIds.length);

  // ---------------------------------------------------------------------
  // Q9 — fake_listing_ids: magichomes carpet_area shrunk to ~1/10 of the
  // normal median for that bedroom count, detected via area ratio directly
  // (robust even when a record's price is independently corrupted)
  // ---------------------------------------------------------------------
 const normalMedianAreaByBhk = computeNormalMedianAreaByBhk(listings, 'magichomes');
console.log('Normal median carpet_area by bedroom count:', normalMedianAreaByBhk);
  // Sensitivity check: does the fake count stay stable across nearby
  // thresholds, confirming this is a real gap rather than an arbitrary cut?
  for (const t of [0.15, 0.18, 0.2, 0.22, 0.25]) {
    const count = listings.filter((l) => {
      const m = normalMedianAreaByBhk[l.bedroom];
      return m && l.carpet_area > 0 && l.carpet_area / m < t;
    }).length;
    console.log(`  threshold ratio < ${t}: ${count} listings flagged`);
  }

 const fakeIds = listings
  .filter((l) => isFakeListing(l, normalMedianAreaByBhk))
  .map((l) => l.listing_id)
  .sort();
  console.log('Final fake_listing_ids count (threshold 0.2):', fakeIds.length);

  // Sharper root-cause check: is it exactly carpet_area/10, rounded?
  const fakeListingObjs = listings.filter((l) => fakeIds.includes(l.listing_id));
  const exactTenthMatches = fakeListingObjs.filter((l) => {
    const m = normalMedianAreaByBhk[l.bedroom];
    return Math.abs(l.carpet_area - Math.round(m / 10)) <= 5; // small tolerance for rounding
  }).length;
  console.log(`Of ${fakeListingObjs.length} fake listings, ${exactTenthMatches} have carpet_area within 5 of exactly (normal median / 10)`);

  // ---------------------------------------------------------------------
  // Q1, Q2, Q3
  // ---------------------------------------------------------------------
  section('Q1, Q2, Q3 — BASIC COUNTS');
  const total_listing_records = listings.length;
  const active_listings = listings.filter((l) => l.is_live).length;
  // Q2: exhaustively checked (exact fuzzy key, coordinate match, loose match)
  // — no genuine duplicate physical properties found in this dataset; see
  // README "what turned out to be fine". unique_properties == total records.
  const unique_properties = total_listing_records;
  console.log('total_listing_records:', total_listing_records);
  console.log('unique_properties:', unique_properties);
  console.log('active_listings:', active_listings);

  // ---------------------------------------------------------------------
  // Q5 — total_monthly_rent in assigned locality
  // ---------------------------------------------------------------------
  section('Q5 — RENTAL SUM IN ASSIGNED LOCALITY');
  const localityRentals = rentals.filter((r) => r.locality?.toLowerCase() === ASSIGNED_LOCALITY);
  const total_monthly_rent = localityRentals.reduce((sum, r) => sum + r.price, 0);
  console.log(`${ASSIGNED_LOCALITY}: ${localityRentals.length} rentals, sum = ${total_monthly_rent}`);

  // ---------------------------------------------------------------------
  // Q6 — avg price/sqft, live 2BHK, excluding corrupt & fake
  // ---------------------------------------------------------------------
  section('Q6 — AVG PRICE/SQFT (LIVE 2BHK, CLEAN)');
  const corruptSet = new Set(corruptIds);
  const fakeSet = new Set(fakeIds);
  const eligible = listings.filter(
    (l) => l.is_live && l.bedroom === 2 && !corruptSet.has(l.listing_id) && !fakeSet.has(l.listing_id) && l.carpet_area > 0
  );
  const avg_price_per_sqft_2bhk = Number(
    (eligible.reduce((sum, l) => sum + l.price / l.carpet_area, 0) / eligible.length).toFixed(2)
  );
  console.log('Eligible records:', eligible.length, '-> avg:', avg_price_per_sqft_2bhk);

  // ---------------------------------------------------------------------
  // Q7 — costliest project (price_max is in CRORES, not rupees — see
  // findings.json units discrepancy)
  // ---------------------------------------------------------------------
  section('Q7 — COSTLIEST PROJECT (crore-to-rupee corrected)');
  const costliest = projects.reduce((best, p) => (!best || p.price_max > best.price_max ? p : best), null);
  const costliest_project = { project_id: costliest.project_id, price_max_inr: Math.round(costliest.price_max * 1e7) };
  console.log(costliest_project);

  // ---------------------------------------------------------------------
  // Q8 — listings posted in the 7 days before REFERENCE (IST)
  // ---------------------------------------------------------------------
  section('Q8 — LISTINGS IN LAST 7 DAYS BEFORE REFERENCE');
  const REFERENCE = new Date('2026-09-10T00:00:00+05:30');
  const WINDOW_START = new Date(REFERENCE.getTime() - 7 * 24 * 60 * 60 * 1000);
  const listings_last_7_days = listings.filter((l) => {
    const d = new Date(l.posted_at);
    return d >= WINDOW_START && d < REFERENCE;
  }).length;
  console.log('Window:', WINDOW_START.toISOString(), '->', REFERENCE.toISOString());
  console.log('Count:', listings_last_7_days);

  // ---------------------------------------------------------------------
  // Q10 — projects where total_listings disagrees with the live-only count
  // ---------------------------------------------------------------------
  section('Q10 — PROJECTS WITH WRONG LISTING COUNT');
  const liveCountByProject = {};
  for (const l of listings) {
    if (l.project_id && l.is_live) liveCountByProject[l.project_id] = (liveCountByProject[l.project_id] || 0) + 1;
  }
  const projects_with_wrong_listing_count = projects.filter(
    (p) => (liveCountByProject[p.project_id] || 0) !== p.total_listings
  ).length;
  console.log('Mismatched (vs live-only count):', projects_with_wrong_listing_count, 'of', projects.length);

  // ---------------------------------------------------------------------
  // FINAL — assemble and write
  // ---------------------------------------------------------------------
  section('FINAL ANSWERS');
  const answers = {
    total_listing_records,
    unique_properties,
    active_listings,
    corrupt_listing_ids: corruptIds,
    total_monthly_rent,
    avg_price_per_sqft_2bhk,
    costliest_project,
    listings_last_7_days,
    fake_listing_ids: fakeIds,
    projects_with_wrong_listing_count,
  };
  console.log(JSON.stringify(answers, null, 2));

  let submission = { api_key: API_KEY, candidate: {}, answers: {}, findings: [] };
  if (fs.existsSync(SUBMISSION_PATH)) {
    submission = JSON.parse(fs.readFileSync(SUBMISSION_PATH, 'utf-8'));
  }
  submission.answers = answers;
  fs.writeFileSync(SUBMISSION_PATH, JSON.stringify(submission, null, 2));
  console.log('\nsubmission.json answers block updated. Candidate info and findings preserved as-is.');
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});