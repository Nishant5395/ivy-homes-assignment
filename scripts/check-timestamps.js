// scripts/check-timestamps.js
//
// Checks:
// 1. What /health actually returns for the server clock.
// 2. Whether posted_at values behave like genuine UTC, or are secretly
//    already in IST but labeled with a "Z" (UTC) suffix.
// 3. Computes the Question 8 window count under both interpretations, so you
//    can see how much it matters.
//
// Run with: node scripts/check-timestamps.js

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.API_BASE_URL;
const DATA_DIR = path.join(process.cwd(), 'data');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));

async function main() {
  // ---------------------------------------------------------------------
  // 1. Check /health
  // ---------------------------------------------------------------------
  const res = await fetch(`${BASE_URL}/health`);
  const health = await res.json();
  console.log('=== /health raw response ===');
  console.log(JSON.stringify(health, null, 2));
  console.log('\nYour machine\'s current UTC time for comparison:', new Date().toISOString());
  console.log('');

  // ---------------------------------------------------------------------
  // 2. Hour-of-day histogram under two interpretations
  // ---------------------------------------------------------------------
  // Interpretation A: posted_at is genuine UTC (as documented). Convert to
  // IST (+5:30) to see what local hour sellers/agents actually posted at.
  const histA = new Array(24).fill(0);
  // Interpretation B: posted_at is ALREADY IST, just mislabeled with a "Z"
  // suffix. Take the hour digits as-is, no conversion.
  const histB = new Array(24).fill(0);

  for (const l of listings) {
    const d = new Date(l.posted_at); // parsed as UTC because of the Z suffix
    const utcHour = d.getUTCHours();

    // A: shift to IST (+5:30) properly
    const istMinutes = d.getUTCHours() * 60 + d.getUTCMinutes() + 5 * 60 + 30;
    const istHour = Math.floor((istMinutes % (24 * 60)) / 60);
    histA[istHour] += 1;

    // B: just take the raw hour digits from the string as if already local
    histB[utcHour] += 1;
  }

  console.log('=== Hour-of-day histogram (posting activity) ===');
  console.log('Hour | A: treated as UTC->IST | B: treated as already-IST (raw digits)');
  for (let h = 0; h < 24; h++) {
    console.log(`${String(h).padStart(2, '0')}:00 | ${String(histA[h]).padStart(4)} | ${String(histB[h]).padStart(4)}`);
  }
  console.log('');
  console.log('If real estate agents post mostly during daytime/business hours,');
  console.log('whichever column (A or B) clusters around ~9am-9pm is the TRUE local time encoding.');
  console.log('');

  // ---------------------------------------------------------------------
  // 3. Question 8 window count under both interpretations
  // ---------------------------------------------------------------------
  // REFERENCE = 2026-09-10T00:00:00+05:30 (IST)
  const REFERENCE_IST = new Date('2026-09-10T00:00:00+05:30');
  const WINDOW_START_IST = new Date(REFERENCE_IST.getTime() - 7 * 24 * 60 * 60 * 1000);

  console.log('REFERENCE (IST):', REFERENCE_IST.toISOString(), '(shown in UTC here)');
  console.log('Window start (REFERENCE - 7 days):', WINDOW_START_IST.toISOString());
  console.log('');

  // Interpretation A: posted_at genuinely UTC, compare directly against the
  // UTC-equivalent window (no shift needed since JS Date handles this).
  const countA = listings.filter((l) => {
    const d = new Date(l.posted_at);
    return d >= WINDOW_START_IST && d < REFERENCE_IST;
  }).length;

  // Interpretation B: posted_at is mislabeled — the digits are ALREADY IST.
  // To compare correctly, treat the digits as IST by re-parsing with +05:30
  // instead of Z.
  const countB = listings.filter((l) => {
    const istString = l.posted_at.replace('Z', '+05:30');
    const d = new Date(istString);
    return d >= WINDOW_START_IST && d < REFERENCE_IST;
  }).length;

  console.log('=== Question 8 candidate answers ===');
  console.log('Interpretation A (posted_at is genuinely UTC, as documented):', countA);
  console.log('Interpretation B (posted_at digits are actually already IST):', countB);
  console.log('');

  // ---------------------------------------------------------------------
  // 4. Format consistency check — are ALL posted_at values really "Z"
  //    suffixed UTC, or do some sneak in a different offset/format?
  // ---------------------------------------------------------------------
  const formatCounts = {};
  for (const l of listings) {
    // crude bucketing: everything after the seconds digit
    const suffix = l.posted_at.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, '');
    formatCounts[suffix] = (formatCounts[suffix] || 0) + 1;
  }
  console.log('=== posted_at suffix/format distribution across all listings ===');
  console.log(formatCounts);
}

main().catch((err) => {
  console.error('Script failed:', err);
});