import 'dotenv/config';
import fs from 'fs';
import path from 'path';

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

async function tryBody(token, listingId, body) {
  const res = await fetch(`${BASE_URL}/v1/saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`Body ${JSON.stringify(body)} -> ${res.status}`);
  console.log(`  response: ${text}`);
}

async function main() {
  const token = await login();
  console.log('Logged in.\n');

  // grab a real listing_id from local data
  const listings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'listings.json'), 'utf-8'));
  const realId = listings[0].listing_id;
  console.log('Using real listing_id:', realId, '\n');

  await tryBody(token, realId, { id: realId });
  await tryBody(token, realId, { listing_id: realId });
  await tryBody(token, realId, { listingId: realId });
}

main().catch((err) => console.error('Script failed:', err));