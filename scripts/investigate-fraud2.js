import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));

// ---------------------------------------------------------------------------
// 1. Exact duplicate numeric fingerprint across different apartment names
// ---------------------------------------------------------------------------
const byFingerprint = {};
for (const l of listings) {
  const key = [l.price, l.carpet_area, l.super_built_up_area, l.bedroom, l.bathroom, l.floor, l.total_floors].join('|');
  if (!byFingerprint[key]) byFingerprint[key] = [];
  byFingerprint[key].push(l);
}
const suspiciousFingerprints = Object.entries(byFingerprint).filter(([, group]) => {
  const distinctNames = new Set(group.map((l) => l.apartment_name));
  return group.length > 1 && distinctNames.size > 1;
});
console.log(`--- Exact duplicate (price, areas, bed, bath, floor, total_floors) across DIFFERENT apartment names: ${suspiciousFingerprints.length} groups ---`);
for (const [key, group] of suspiciousFingerprints.slice(0, 15)) {
  console.log(`  ${key}:`, group.map((l) => ({ id: l.listing_id, name: l.apartment_name, locality: l.locality })));
}
console.log('');

// ---------------------------------------------------------------------------
// 2. listing_url numeric id vs listing_id numeric suffix consistency
// ---------------------------------------------------------------------------
const urlMismatches = [];
for (const l of listings) {
  const idSuffix = l.listing_id.match(/(\d+)$/)?.[1];
  const urlSuffix = l.listing_url.match(/(\d+)$/)?.[1];
  if (idSuffix !== urlSuffix) {
    urlMismatches.push({ listing_id: l.listing_id, listing_url: l.listing_url, idSuffix, urlSuffix });
  }
}
console.log(`--- listing_id vs listing_url numeric mismatch: ${urlMismatches.length} ---`);
console.log(urlMismatches.slice(0, 10));
console.log('');

// ---------------------------------------------------------------------------
// 3. Price-per-sqft distribution — look for a distinct low-end cluster
// ---------------------------------------------------------------------------
const pricePerSqft = listings
  .filter((l) => l.carpet_area > 0)
  .map((l) => ({ id: l.listing_id, ppsf: l.price / l.carpet_area, bedroom: l.bedroom, locality: l.locality }));

pricePerSqft.sort((a, b) => a.ppsf - b.ppsf);

console.log('--- Price-per-sqft: 20 lowest (excluding negative-price corrupt ones) ---');
console.log(pricePerSqft.filter((p) => p.ppsf > 0).slice(0, 20));
console.log('');
console.log('--- Price-per-sqft: 20 highest ---');
console.log(pricePerSqft.slice(-20));
console.log('');

// Basic stats to see if there's a natural break point
const positivePpsf = pricePerSqft.filter((p) => p.ppsf > 0).map((p) => p.ppsf);
const mean = positivePpsf.reduce((a, b) => a + b, 0) / positivePpsf.length;
const sorted = [...positivePpsf].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
console.log(`Mean price/sqft: ${mean.toFixed(0)}, Median: ${median.toFixed(0)}`);
console.log(`5th percentile: ${sorted[Math.floor(sorted.length * 0.05)].toFixed(0)}, 95th percentile: ${sorted[Math.floor(sorted.length * 0.95)].toFixed(0)}`);
console.log('');

// ---------------------------------------------------------------------------
// 4. Is extreme price-per-sqft concentrated in one website source?
// ---------------------------------------------------------------------------
const byWebsite = {};
for (const l of listings) {
  if (l.carpet_area <= 0 || l.price <= 0) continue; // skip corrupt ones
  const ppsf = l.price / l.carpet_area;
  if (!byWebsite[l.website]) byWebsite[l.website] = [];
  byWebsite[l.website].push(ppsf);
}

console.log('--- Price-per-sqft stats by website ---');
for (const [site, values] of Object.entries(byWebsite)) {
  const sortedVals = [...values].sort((a, b) => a - b);
  const siteMean = values.reduce((a, b) => a + b, 0) / values.length;
  const siteMedian = sortedVals[Math.floor(sortedVals.length / 2)];
  const over50k = values.filter((v) => v > 50000).length;
  const over100k = values.filter((v) => v > 100000).length;
  console.log(
    `  ${site}: count=${values.length}, mean=${siteMean.toFixed(0)}, median=${siteMedian.toFixed(0)}, >50000psf: ${over50k}, >100000psf: ${over100k}`
  );
}
console.log('');

// ---------------------------------------------------------------------------
// 5. How many listings exceed a clearly-impossible ppsf threshold, and from
//    which website?
// ---------------------------------------------------------------------------
const threshold = 50000; // adjust after seeing the by-website breakdown above
const extremeListings = listings.filter((l) => l.carpet_area > 0 && l.price > 0 && l.price / l.carpet_area > threshold);
const extremeByWebsite = {};
for (const l of extremeListings) {
  extremeByWebsite[l.website] = (extremeByWebsite[l.website] || 0) + 1;
}
console.log(`--- Listings with price/sqft > ${threshold}: ${extremeListings.length} total ---`);
console.log('  by website:', extremeByWebsite);
console.log('  sample ids:', extremeListings.slice(0, 20).map((l) => l.listing_id));
console.log('');

// ---------------------------------------------------------------------------
// 6. Find the exact gap in magichomes' distribution — confirm a clean
//    bimodal split rather than a gradual tail
// ---------------------------------------------------------------------------
const magichomesPpsf = listings
  .filter((l) => l.website === 'magichomes' && l.carpet_area > 0 && l.price > 0)
  .map((l) => ({ id: l.listing_id, ppsf: l.price / l.carpet_area }))
  .sort((a, b) => a.ppsf - b.ppsf);

console.log(`--- magichomes: all ${magichomesPpsf.length} listings sorted by ppsf, showing the middle transition zone ---`);
// Print values around where the jump likely happens — look at ranks 400-470
console.log(magichomesPpsf.slice(430, 480));
console.log('');

// Find the single biggest jump (ratio) between consecutive sorted values —
// that's the real boundary between "normal" and "fake" clusters
let biggestGapRatio = 0;
let biggestGapIndex = -1;
for (let i = 1; i < magichomesPpsf.length; i++) {
  const ratio = magichomesPpsf[i].ppsf / magichomesPpsf[i - 1].ppsf;
  if (ratio > biggestGapRatio) {
    biggestGapRatio = ratio;
    biggestGapIndex = i;
  }
}
console.log('Biggest jump in magichomes ppsf distribution:');
console.log('  just below the gap:', magichomesPpsf[biggestGapIndex - 1]);
console.log('  just above the gap:', magichomesPpsf[biggestGapIndex]);
console.log('  ratio:', biggestGapRatio.toFixed(2));
console.log('  number of listings AT OR ABOVE this gap:', magichomesPpsf.length - biggestGapIndex);
console.log('');

// ---------------------------------------------------------------------------
// 7. That gap-finder got thrown off by extreme LOW outliers (different
//    anomaly). Search for the biggest jump only among values > 1000, where
//    the real normal-vs-fake boundary for magichomes should live.
// ---------------------------------------------------------------------------
const magichomesPpsfHighRange = magichomesPpsf.filter((p) => p.ppsf > 1000);
let realGapRatio = 0;
let realGapIndex = -1;
for (let i = 1; i < magichomesPpsfHighRange.length; i++) {
  const ratio = magichomesPpsfHighRange[i].ppsf / magichomesPpsfHighRange[i - 1].ppsf;
  if (ratio > realGapRatio) {
    realGapRatio = ratio;
    realGapIndex = i;
  }
}
console.log('--- Real gap in magichomes ppsf (searching only values > 1000) ---');
console.log('  just below the gap:', magichomesPpsfHighRange[realGapIndex - 1]);
console.log('  just above the gap:', magichomesPpsfHighRange[realGapIndex]);
console.log('  ratio:', realGapRatio.toFixed(2));

const fakeThreshold = (magichomesPpsfHighRange[realGapIndex - 1].ppsf + magichomesPpsfHighRange[realGapIndex].ppsf) / 2;
console.log('  using midpoint threshold:', fakeThreshold.toFixed(0));

const fakeListings = listings.filter(
  (l) => l.website === 'magichomes' && l.carpet_area > 0 && l.price > 0 && l.price / l.carpet_area > fakeThreshold
);
console.log(`\n=== FINAL fake_listing_ids candidate: ${fakeListings.length} listings ===`);
console.log(fakeListings.map((l) => l.listing_id).sort());
console.log('');

// ---------------------------------------------------------------------------
// 8. Look at the raw price/carpet_area of the extreme LOW outliers
//    (separate anomaly, not yet explained)
// ---------------------------------------------------------------------------
const lowOutlierIds = ['MAG-3000012', 'ZER-3000796', '100-3002878', 'SQU-3000349', '100-3001372', 'MAG-3001932', 'MAG-3001311'];
console.log('--- Raw fields for the extreme LOW ppsf outliers (separate anomaly) ---');
for (const id of lowOutlierIds) {
  const l = listings.find((x) => x.listing_id === id);
  console.log({ id: l.listing_id, price: l.price, carpet_area: l.carpet_area, super_built_up_area: l.super_built_up_area, bedroom: l.bedroom, website: l.website });
}
console.log('');

// ---------------------------------------------------------------------------
// 9. What's actually driving the 303 fake listings — inflated price, or
//    shrunk carpet_area? Compare their raw price and area against normal
//    listings of the same bedroom count.
// ---------------------------------------------------------------------------
function medianFor(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

console.log('--- Comparing fake candidates vs normal listings, by bedroom count ---');
for (const bhk of [1, 2, 3, 4]) {
  const normalOfBhk = listings.filter(
    (l) => l.bedroom === bhk && l.website !== 'magichomes' && l.price > 0 && l.carpet_area > 0
  );
  const fakeOfBhk = fakeListings.filter((l) => l.bedroom === bhk);
  if (fakeOfBhk.length === 0 || normalOfBhk.length === 0) continue;

  const normalMedianPrice = medianFor(normalOfBhk.map((l) => l.price));
  const normalMedianArea = medianFor(normalOfBhk.map((l) => l.carpet_area));
  const fakeMedianPrice = medianFor(fakeOfBhk.map((l) => l.price));
  const fakeMedianArea = medianFor(fakeOfBhk.map((l) => l.carpet_area));

  console.log(`  ${bhk} BHK — normal median price: ${normalMedianPrice}, normal median area: ${normalMedianArea}`);
  console.log(`  ${bhk} BHK — FAKE median price: ${fakeMedianPrice}, FAKE median area: ${fakeMedianArea}`);
  console.log(`  price ratio (fake/normal): ${(fakeMedianPrice / normalMedianPrice).toFixed(2)}, area ratio (fake/normal): ${(fakeMedianArea / normalMedianArea).toFixed(2)}`);
  console.log('');
}

// ---------------------------------------------------------------------------
// 10. Redetect using the REAL mechanism: carpet_area far below the normal
// median for that bedroom count (robust even when price is also buggy)
// ---------------------------------------------------------------------------
const normalMedianAreaByBhk = {};
for (const bhk of [0, 1, 2, 3, 4, 5]) {
  const normalOfBhk = listings.filter(
    (l) => l.bedroom === bhk && l.website !== 'magichomes' && l.carpet_area > 0
  );
  if (normalOfBhk.length > 0) {
    normalMedianAreaByBhk[bhk] = medianFor(normalOfBhk.map((l) => l.carpet_area));
  }
}
console.log('Normal median carpet_area by bedroom count:', normalMedianAreaByBhk);

const fakeByAreaRatio = listings.filter((l) => {
  const normalMedian = normalMedianAreaByBhk[l.bedroom];
  if (!normalMedian || l.carpet_area <= 0) return false;
  return l.carpet_area / normalMedian < 0.2; // well below the ~0.09-0.10 pattern's ceiling
});

console.log(`\n=== Fake listings redetected via area-ratio method: ${fakeByAreaRatio.length} ===`);
console.log('  by website:', fakeByAreaRatio.reduce((acc, l) => { acc[l.website] = (acc[l.website] || 0) + 1; return acc; }, {}));

const areaRatioIds = new Set(fakeByAreaRatio.map((l) => l.listing_id));
const ppsfIds = new Set(fakeListings.map((l) => l.listing_id));
const onlyInAreaRatio = [...areaRatioIds].filter((id) => !ppsfIds.has(id));
const onlyInPpsf = [...ppsfIds].filter((id) => !areaRatioIds.has(id));
console.log('  in area-ratio method but NOT in original ppsf method:', onlyInAreaRatio);
console.log('  in original ppsf method but NOT in area-ratio method:', onlyInPpsf.length, 'ids (first 10):', onlyInPpsf.slice(0, 10));
console.log('');

console.log('=== FINAL fake_listing_ids for submission.json (306, sorted) ===');
console.log(JSON.stringify([...areaRatioIds].sort(), null, 2));