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

async function tryPath(token, path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-API-Key': API_KEY, Authorization: `Bearer ${token}` },
  });
  const body = await res.text();
  console.log(`${path} -> ${res.status}`);
  console.log(`  body: ${body.slice(0, 200)}`);
}

async function main() {
  const token = await login();
  console.log('Logged in.\n');

  const candidates = [
    '/v1/favourites',
    '/v1/favorites',
    '/favourites',
    '/favorites',
    '/v1/user/favourites',
    '/v1/users/favourites',
    '/v1/me/favourites',
    '/v1/account/favourites',
    '/v1/saved',
    '/v1/saved-listings',
    '/v1/listings/favourites',
  ];

  for (const path of candidates) {
    await tryPath(token, path);
  }
}

main().catch((err) => console.error('Script failed:', err));