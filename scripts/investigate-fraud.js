import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const listings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'listings.json'), 'utf-8'));

// ---------------------------------------------------------------------------
// 1. Phone number reuse — group listings by posted_by_contact
// ---------------------------------------------------------------------------
const byPhone = {};
for (const l of listings) {
  const phone = l.posted_by_contact;
  if (!byPhone[phone]) byPhone[phone] = [];
  byPhone[phone].push(l);
}

const phoneEntries = Object.entries(byPhone).sort((a, b) => b[1].length - a[1].length);
console.log('--- Phone numbers by how many listings they appear on (top 20) ---');
for (const [phone, group] of phoneEntries.slice(0, 20)) {
  const distinctNames = new Set(group.map((l) => l.posted_by_name));
  const distinctLocalities = new Set(group.map((l) => l.locality));
  const distinctPostedBy = new Set(group.map((l) => l.posted_by));
  console.log(
    `${phone}: ${group.length} listings, ${distinctNames.size} distinct seller names, ${distinctLocalities.size} distinct localities, posted_by types: ${[...distinctPostedBy]}`
  );
}
console.log('');

// How many phone numbers appear on more than 1 listing at all?
const multiListingPhones = phoneEntries.filter(([, group]) => group.length > 1);
console.log(`Phone numbers used on more than one listing: ${multiListingPhones.length} out of ${phoneEntries.length} total phone numbers`);
console.log('');

// ---------------------------------------------------------------------------
// 2. Exact duplicate descriptions across DIFFERENT apartment names
//    (a real description should mention its own apartment/locality)
// ---------------------------------------------------------------------------
const byDescription = {};
for (const l of listings) {
  if (!byDescription[l.description]) byDescription[l.description] = [];
  byDescription[l.description].push(l);
}
const duplicateDescriptions = Object.entries(byDescription).filter(([, group]) => group.length > 1);
console.log(`--- Exact duplicate description text: ${duplicateDescriptions.length} distinct descriptions reused ---`);
for (const [desc, group] of duplicateDescriptions.slice(0, 10)) {
  console.log(`  "${desc.slice(0, 60)}..." used by:`, group.map((l) => l.listing_id));
}
console.log('');

// ---------------------------------------------------------------------------
// 3. Repeated exact coordinates across different apartment_names
// ---------------------------------------------------------------------------
const byCoords = {};
for (const l of listings) {
  const key = `${l.latitude},${l.longitude}`;
  if (!byCoords[key]) byCoords[key] = [];
  byCoords[key].push(l);
}
const suspiciousCoords = Object.entries(byCoords).filter(([, group]) => {
  const distinctNames = new Set(group.map((l) => l.apartment_name));
  return group.length > 1 && distinctNames.size > 1;
});
console.log(`--- Exact coordinates shared by listings with DIFFERENT apartment names: ${suspiciousCoords.length} coordinate groups ---`);
for (const [coords, group] of suspiciousCoords.slice(0, 10)) {
  console.log(`  ${coords}:`, group.map((l) => ({ id: l.listing_id, name: l.apartment_name })));
}
console.log('');

// ---------------------------------------------------------------------------
// 4. Cross-reference: listings whose phone number is on 3+ DIFFERENT
//    apartment names/localities — the strongest single fraud signal
// ---------------------------------------------------------------------------
const suspiciousPhoneGroups = phoneEntries.filter(([, group]) => {
  const distinctNames = new Set(group.map((l) => l.apartment_name));
  return group.length >= 3 && distinctNames.size >= 3;
});
console.log(`--- Phone numbers on 3+ listings spanning 3+ different apartment names: ${suspiciousPhoneGroups.length} ---`);
const suspiciousIds = new Set();
for (const [phone, group] of suspiciousPhoneGroups) {
  for (const l of group) suspiciousIds.add(l.listing_id);
}
console.log('  total listing_ids caught by this pattern:', suspiciousIds.size);
console.log('  sample:', [...suspiciousIds].slice(0, 20));
console.log('');

// ---------------------------------------------------------------------------
// 5. Does the description text actually match its own structured fields?
//    Descriptions follow the pattern "<adj> N BHK <type> in <apartment>, <locality>."
// ---------------------------------------------------------------------------
const bhkWordToNum = { studio: 0 };

function extractBedroomFromDescription(desc) {
  const match = desc.match(/(\d+)\s*BHK/i);
  if (match) return parseInt(match[1], 10);
  if (/studio/i.test(desc)) return 0;
  return null;
}

const mismatches = [];
for (const l of listings) {
  const descBedroom = extractBedroomFromDescription(l.description);
  const mentionsApartment = l.description.includes(l.apartment_name);
  const mentionsLocality = l.description.toLowerCase().includes(l.locality.toLowerCase());

  const bedroomMismatch = descBedroom !== null && descBedroom !== l.bedroom;
  const apartmentMismatch = !mentionsApartment;
  const localityMismatch = !mentionsLocality;

  if (bedroomMismatch || apartmentMismatch || localityMismatch) {
    mismatches.push({
      listing_id: l.listing_id,
      bedroom_field: l.bedroom,
      bedroom_in_description: descBedroom,
      bedroomMismatch,
      apartment_field: l.apartment_name,
      apartmentMismatch,
      locality_field: l.locality,
      localityMismatch,
      description: l.description,
    });
  }
}

console.log(`--- Listings where description text disagrees with its own structured fields: ${mismatches.length} ---`);
for (const m of mismatches.slice(0, 30)) {
  console.log(JSON.stringify(m, null, 2));
}