// scripts/fetch-data.js
//
// Pulls the ENTIRE dataset (listings, rentals, projects) from the Ivy Homes API
// and saves it locally as JSON files, so you can investigate offline without
// re-hitting the API every time.
//
// Run with: node scripts/fetch-data.js

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const DEMO_EMAIL = process.env.DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

const OUTPUT_DIR = path.join(process.cwd(), 'data');

if (!BASE_URL || !API_KEY) {
  console.error('Missing API_BASE_URL or API_KEY in .env — check your .env file.');
  process.exit(1);
}

// Make sure the output folder exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// ---- Step 1: log in (optional for this script, but good to verify auth works) ----
async function login() {
  if (!DEMO_EMAIL || !DEMO_PASSWORD) {
    console.log('No demo credentials in .env — skipping login test.');
    return null;
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Login failed (${res.status}):`, body);
    return null;
  }
  const data = await res.json();
  console.log('Login succeeded. Access token expires in', data.expires_in, 'seconds.');
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

// ---- Step 1b: refresh an expired access token using the refresh token ----
async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.warn(`Refresh failed (${res.status}): ${body} — falling back to full re-login.`);
    return null;
  }
  const data = await res.json();
  console.log('Refreshed. New access token expires in', data.expires_in, 'seconds.');
  return { accessToken: data.access_token, refreshToken: data.refresh_token || refreshToken };
}

// ---- Step 2: generic paginator for any collection endpoint ----
async function fetchAll(endpointPath, tokens, extraParams = {}) {
  const allResults = [];
  let page = 1;
  const limit = 200; // max allowed per the docs — fewer requests overall
  let total = null;
  let currentTokens = tokens;

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...extraParams,
    });

    const url = `${BASE_URL}${endpointPath}?${params.toString()}`;
    let res = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${currentTokens.accessToken}`,
      },
    });

    // If the token expired mid-pagination, refresh (or re-login) and retry this page
    if (res.status === 401) {
      const body = await res.text();
      console.warn(`Got 401 on ${endpointPath} page ${page} (${body}) — refreshing token...`);
      let refreshed = await refreshAccessToken(currentTokens.refreshToken);
      if (!refreshed) {
        refreshed = await login(); // fallback: full re-login
      }
      if (!refreshed) {
        throw new Error('Could not refresh or re-login — cannot continue.');
      }
      currentTokens = refreshed;
      res = await fetch(url, {
        headers: {
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${currentTokens.accessToken}`,
        },
      });
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Request failed (${res.status}) for ${url}: ${body}`);
    }

    const data = await res.json();

    // Log the raw shape once, on the first page, so you can eyeball it
    if (page === 1) {
      console.log(`\nFirst page of ${endpointPath} — response shape:`);
      console.log(Object.keys(data));
    }

    total = data.total;
    const results = data.results || [];
    allResults.push(...results);

    console.log(
      `${endpointPath} — page ${page}: got ${results.length} records (running total: ${allResults.length} / reported total: ${total})`
    );

    // Stop conditions: no more results, or we've collected >= reported total
    if (results.length === 0) break;
    if (total !== undefined && allResults.length >= total) break;

    page += 1;

    // Small safety valve in case pagination misbehaves and total is wrong —
    // stop after a very high page count rather than looping forever.
    if (page > 500) {
      console.warn(`Stopped ${endpointPath} after 500 pages as a safety limit.`);
      break;
    }
  }

  return allResults;
}

// ---- Step 3: run everything and save to disk ----
async function main() {
  const tokens = await login();
  if (!tokens || !tokens.accessToken) {
    console.error('Could not log in — check DEMO_EMAIL / DEMO_PASSWORD / API_KEY in .env');
    process.exit(1);
  }

  console.log('\n=== Fetching listings ===');
  const listings = await fetchAll('/v1/listings', tokens);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'listings.json'),
    JSON.stringify(listings, null, 2)
  );
  console.log(`Saved ${listings.length} listings to data/listings.json`);

  console.log('\n=== Fetching rentals ===');
  const rentals = await fetchAll('/v1/rentals', tokens);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'rentals.json'),
    JSON.stringify(rentals, null, 2)
  );
  console.log(`Saved ${rentals.length} rentals to data/rentals.json`);

  console.log('\n=== Fetching projects ===');
  const projects = await fetchAll('/v1/projects', tokens);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'projects.json'),
    JSON.stringify(projects, null, 2)
  );
  console.log(`Saved ${projects.length} projects to data/projects.json`);

  console.log('\nAll done. Check the data/ folder.');
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});