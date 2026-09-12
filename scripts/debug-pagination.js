// scripts/debug-pagination.js
//
// Tests whether the `page` parameter on /v1/listings actually changes the
// results, and whether the response's own `page`/`page_size` fields match
// what we requested. Run this directly against the live API.
//
// Run with: node scripts/debug-pagination.js

import 'dotenv/config';

const BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;
const DEMO_EMAIL = process.env.DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });
  const data = await res.json();
  return data.access_token;
}

async function fetchPage(token, page, limit = 200, extraParams = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), ...extraParams });
  const url = `${BASE_URL}/v1/listings?${params.toString()}`;
  const res = await fetch(url, {
    headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  return { url, data };
}

async function main() {
  const token = await login();
  console.log('Logged in.\n');

  // Fetch page 1 and page 2 with the same limit, compare
  const p1 = await fetchPage(token, 1);
  const p2 = await fetchPage(token, 2);
  const p5 = await fetchPage(token, 5);

  console.log('=== Requested page=1 ===');
  console.log('  URL:', p1.url);
  console.log('  Response top-level fields:', Object.keys(p1.data));
  console.log('  Response says total:', p1.data.total, '| page:', p1.data.page, '| page_size:', p1.data.page_size);
  console.log('  results.length:', p1.data.results?.length);
  console.log('  First 3 listing_ids:', p1.data.results?.slice(0, 3).map((r) => r.listing_id));

  console.log('\n=== Requested page=2 ===');
  console.log('  URL:', p2.url);
  console.log('  Response says total:', p2.data.total, '| page:', p2.data.page, '| page_size:', p2.data.page_size);
  console.log('  results.length:', p2.data.results?.length);
  console.log('  First 3 listing_ids:', p2.data.results?.slice(0, 3).map((r) => r.listing_id));

  console.log('\n=== Requested page=5 ===');
  console.log('  URL:', p5.url);
  console.log('  Response says total:', p5.data.total, '| page:', p5.data.page, '| page_size:', p5.data.page_size);
  console.log('  results.length:', p5.data.results?.length);
  console.log('  First 3 listing_ids:', p5.data.results?.slice(0, 3).map((r) => r.listing_id));

  // Are page 1 and page 2 identical?
  const ids1 = p1.data.results?.map((r) => r.listing_id).join(',');
  const ids2 = p2.data.results?.map((r) => r.listing_id).join(',');
  const ids5 = p5.data.results?.map((r) => r.listing_id).join(',');

  console.log('\n=== Comparison ===');
  console.log('  page=1 results identical to page=2 results?', ids1 === ids2);
  console.log('  page=1 results identical to page=5 results?', ids1 === ids5);

  // Also test with a small limit, to see if limit itself works
  const smallLimit = await fetchPage(token, 1, 5);
  console.log('\n=== Requested page=1, limit=5 ===');
  console.log('  Response says page_size:', smallLimit.data.page_size, '| results.length:', smallLimit.data.results?.length);

  // Test with an explicit sort_by, in case default order is unstable across requests
  const sorted1 = await fetchPage(token, 1, 200, { sort_by: 'posted_at', order: 'asc' });
  const sorted2 = await fetchPage(token, 2, 200, { sort_by: 'posted_at', order: 'asc' });
  const sortedIds1 = sorted1.data.results?.map((r) => r.listing_id).join(',');
  const sortedIds2 = sorted2.data.results?.map((r) => r.listing_id).join(',');
  console.log('\n=== With explicit sort_by=posted_at ===');
  console.log('  page=1 vs page=2 identical with explicit sort?', sortedIds1 === sortedIds2);
  console.log('  page=1 first 3 ids:', sorted1.data.results?.slice(0, 3).map((r) => r.listing_id));
  console.log('  page=2 first 3 ids:', sorted2.data.results?.slice(0, 3).map((r) => r.listing_id));

  // Now test OFFSET-based pagination instead of page-based
  async function fetchOffset(offset, limit) {
    const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    const url = `${BASE_URL}/v1/listings?${params.toString()}`;
    const res = await fetch(url, {
      headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  }

  console.log('\n=== Testing offset-based pagination ===');
  const off0 = await fetchOffset(0, 50);
  const off50 = await fetchOffset(50, 50);
  console.log('  offset=0: count=', off0.count, 'has_more=', off0.has_more, 'total=', off0.total);
  console.log('  offset=0 first 3 ids:', off0.results?.slice(0, 3).map((r) => r.listing_id));
  console.log('  offset=50: count=', off50.count, 'has_more=', off50.has_more, 'total=', off50.total);
  console.log('  offset=50 first 3 ids:', off50.results?.slice(0, 3).map((r) => r.listing_id));
  console.log(
    '  offset=0 and offset=50 different?',
    off0.results?.map((r) => r.listing_id).join(',') !== off50.results?.map((r) => r.listing_id).join(',')
  );

  // Probe the real max limit
  console.log('\n=== Probing real max limit ===');
  for (const testLimit of [50, 100, 150, 200, 500]) {
    const res = await fetchOffset(0, testLimit);
    console.log(`  requested limit=${testLimit} -> got count=${res.count}, results.length=${res.results?.length}`);
  }
}

main().catch((err) => {
  console.error('Debug script failed:', err);
});