
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));
const rentals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'rentals.json'), 'utf-8'));
const projects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projects.json'), 'utf-8'));

console.log(`Loaded: ${listings.length} listings, ${rentals.length} rentals, ${projects.length} projects\n`);

// ---------------------------------------------------------------------------
// 1. Field inventory — what fields actually show up, vs what the docs claim
// ---------------------------------------------------------------------------
function fieldInventory(records, label) {
  const fieldCounts = {};
  for (const r of records) {
    for (const key of Object.keys(r)) {
      fieldCounts[key] = (fieldCounts[key] || 0) + 1;
    }
  }
  console.log(`--- Field inventory for ${label} (${records.length} records) ---`);
  for (const [key, count] of Object.entries(fieldCounts).sort()) {
    const pct = ((count / records.length) * 100).toFixed(1);
    console.log(`  ${key}: present in ${count} (${pct}%)`);
  }
  console.log('');
}

fieldInventory(listings, 'listings');
fieldInventory(rentals, 'rentals');
fieldInventory(projects, 'projects');

// ---------------------------------------------------------------------------
// 2. is_live distribution (Question 3)
// ---------------------------------------------------------------------------
const liveCount = listings.filter((l) => l.is_live === true).length;
const notLiveCount = listings.filter((l) => l.is_live === false).length;
const missingIsLive = listings.length - liveCount - notLiveCount;
console.log(`--- is_live distribution ---`);
console.log(`  true: ${liveCount}`);
console.log(`  false: ${notLiveCount}`);
console.log(`  missing/other: ${missingIsLive}`);
console.log('');

// ---------------------------------------------------------------------------
// 3. Duplicate listing_id check (should be globally unique per docs)
// ---------------------------------------------------------------------------
const idCounts = {};
for (const l of listings) {
  idCounts[l.listing_id] = (idCounts[l.listing_id] || 0) + 1;
}
const duplicateIds = Object.entries(idCounts).filter(([, count]) => count > 1);
console.log(`--- Duplicate listing_id check ---`);
console.log(`  ${duplicateIds.length} listing_id(s) appear more than once`);
if (duplicateIds.length > 0) {
  console.log('  Examples:', duplicateIds.slice(0, 10));
}
console.log('');

// ---------------------------------------------------------------------------
// 4. bedroom (bhk) distribution — sanity check
// ---------------------------------------------------------------------------
const bedroomCounts = {};
for (const l of listings) {
  bedroomCounts[l.bedroom] = (bedroomCounts[l.bedroom] || 0) + 1;
}
console.log(`--- Bedroom distribution ---`);
console.log(bedroomCounts);
console.log('');

// ---------------------------------------------------------------------------
// 5. Obviously impossible records — floor > total_floors, non-positive areas,
//    super_built_up_area < carpet_area (should always be >=)
// ---------------------------------------------------------------------------
console.log(`--- Potential data-quality issues ---`);

const floorExceeds = listings.filter((l) => l.floor > l.total_floors);
console.log(`  floor > total_floors: ${floorExceeds.length}`);
if (floorExceeds.length) console.log('    e.g.', floorExceeds.slice(0, 5).map((l) => l.listing_id));

const nonPositiveArea = listings.filter((l) => l.carpet_area <= 0 || l.super_built_up_area <= 0);
console.log(`  non-positive area: ${nonPositiveArea.length}`);
if (nonPositiveArea.length) console.log('    e.g.', nonPositiveArea.slice(0, 5).map((l) => l.listing_id));

const carpetExceedsSuper = listings.filter((l) => l.carpet_area > l.super_built_up_area);
console.log(`  carpet_area > super_built_up_area: ${carpetExceedsSuper.length}`);
if (carpetExceedsSuper.length) console.log('    e.g.', carpetExceedsSuper.slice(0, 5).map((l) => l.listing_id));

const nonPositivePrice = listings.filter((l) => l.price <= 0);
console.log(`  non-positive price: ${nonPositivePrice.length}`);

const negativeFloor = listings.filter((l) => l.floor < 0 || l.total_floors <= 0);
console.log(`  negative/zero floor or total_floors: ${negativeFloor.length}`);
if (negativeFloor.length) console.log('    e.g.', negativeFloor.slice(0, 5).map((l) => l.listing_id));

console.log('');

// ---------------------------------------------------------------------------
// 6. project_id references — do all non-null project_ids actually exist
//    in the projects dataset?
// ---------------------------------------------------------------------------
const projectIds = new Set(projects.map((p) => p.project_id));
const listingsWithBadProjectId = listings.filter(
  (l) => l.project_id !== null && !projectIds.has(l.project_id)
);
console.log(`--- Listings referencing a project_id that doesn't exist in /v1/projects ---`);
console.log(`  count: ${listingsWithBadProjectId.length}`);
if (listingsWithBadProjectId.length) {
  console.log('  e.g.', listingsWithBadProjectId.slice(0, 5).map((l) => [l.listing_id, l.project_id]));
}
console.log('');

// ---------------------------------------------------------------------------
// 7. total_listings on each project vs actual count of listings referencing it
//    (Question 10)
// ---------------------------------------------------------------------------
const actualListingCountByProject = {};
for (const l of listings) {
  if (l.project_id) {
    actualListingCountByProject[l.project_id] = (actualListingCountByProject[l.project_id] || 0) + 1;
  }
}

let wrongCountProjects = 0;
const wrongExamples = [];
for (const p of projects) {
  const actual = actualListingCountByProject[p.project_id] || 0;
  if (actual !== p.total_listings) {
    wrongCountProjects += 1;
    if (wrongExamples.length < 10) {
      wrongExamples.push({ project_id: p.project_id, documented: p.total_listings, actual });
    }
  }
}
console.log(`--- Projects where total_listings disagrees with actual count of referencing listings ---`);
console.log(`  count: ${wrongCountProjects} out of ${projects.length}`);
console.log('  examples:', wrongExamples);
console.log('');

// ---------------------------------------------------------------------------
// 8. posted_at spot-check — print a few raw values so you can visually
//    check the timezone/format claim
// ---------------------------------------------------------------------------
console.log(`--- Sample posted_at values (listings) ---`);
console.log(listings.slice(0, 5).map((l) => l.posted_at));
console.log('');

console.log('Done. Extend this script as you form more hypotheses.');