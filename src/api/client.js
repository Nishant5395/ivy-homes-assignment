const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const TOKEN_STORAGE_KEY = 'ivy_auth_tokens';

// ---------------------------------------------------------------------------
// Token storage (survives page refresh)
// ---------------------------------------------------------------------------
function saveTokens(tokens) {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

function loadTokens() {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Login failed (${res.status})`);
  }

  const data = await res.json();
  const tokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
  };
  saveTokens(tokens);
  return tokens;
}

export function logout() {
  clearTokens();
}

export function getCurrentUser() {
  const tokens = loadTokens();
  return tokens?.user ?? null;
}

export function isLoggedIn() {
  return loadTokens() !== null;
}

async function refreshAccessToken() {
  const tokens = loadTokens();
  if (!tokens?.refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ refresh_token: tokens.refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  const newTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokens.refreshToken,
    user: tokens.user,
  };
  saveTokens(newTokens);
  return newTokens;
}

// ---------------------------------------------------------------------------
// Core authenticated request helper — auto-refreshes on 401
// ---------------------------------------------------------------------------
async function authedFetch(path, options = {}) {
  let tokens = loadTokens();
  if (!tokens) throw new Error('Not logged in');

  const doFetch = (accessToken) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        'X-API-Key': API_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    });

  let res = await doFetch(tokens.accessToken);

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error('Session expired — please log in again');
    res = await doFetch(refreshed.accessToken);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Generic paginated fetch — uses the REAL offset/limit mechanism, not the
// documented (non-functional) page param
// ---------------------------------------------------------------------------
export async function fetchPage(path, { offset = 0, limit = 50, params = {} } = {}) {
  const query = new URLSearchParams({ offset: String(offset), limit: String(limit), ...params });
  return authedFetch(`${path}?${query.toString()}`);
}

export async function fetchAllPages(path, params = {}) {
  const all = [];
  let offset = 0;
  const limit = 50;
  while (true) {
    const data = await fetchPage(path, { offset, limit, params });
    all.push(...(data.results || []));
    if (!data.has_more) break;
    offset += limit;
  }
  return all;
}

// ---------------------------------------------------------------------------
// Domain-specific calls
// ---------------------------------------------------------------------------
export const api = {
  listings: (params) => fetchPage('/v1/listings', { params }),
  listing: (id) => authedFetch(`/v1/listings/${id}`),
  similarListings: (id) => authedFetch(`/v1/listings/${id}/similar`),
  rentals: (params) => fetchPage('/v1/rentals', { params }),
  rental: (id) => authedFetch(`/v1/rentals/${id}`),
  projects: (params) => fetchPage('/v1/projects', { params }),
  project: (id) => authedFetch(`/v1/projects/${id}`),
  favourites: () => authedFetch('/v1/saved'),
  addFavourite: (id) => authedFetch('/v1/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listing_id: id }) }),
  removeFavourite: (id) => authedFetch(`/v1/saved/${id}`, { method: 'DELETE' }),
  analyticsSummary: () => authedFetch('/v1/analytics/summary'),
};