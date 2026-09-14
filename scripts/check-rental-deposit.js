import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const rentals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'rentals.json'), 'utf-8'));

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const suspect = rentals.filter((r) => r.price > 0 && r.deposit / r.price < 0.5);
const normal = rentals.filter((r) => r.price > 0 && r.deposit / r.price >= 0.5);

console.log('Suspect records (deposit looks like a small month-count):', suspect.length);
console.log('Normal records:', normal.length);
console.log('');

const normalRatios = normal.map((r) => r.deposit / r.price);
console.log('NORMAL deposit/price ratio — median:', median(normalRatios).toFixed(2), 'min:', Math.min(...normalRatios).toFixed(2), 'max:', Math.max(...normalRatios).toFixed(2));
console.log('');

const correctedRatios = suspect.map((r) => r.deposit);
console.log('SUSPECT raw deposit values (would-be month counts) — median:', median(correctedRatios).toFixed(2), 'min:', Math.min(...correctedRatios), 'max:', Math.max(...correctedRatios));
console.log('');

console.log('Sample corrected values (deposit * price) vs normal deposit range:');
for (const r of suspect.slice(0, 10)) {
  const correctedDeposit = r.deposit * r.price;
  console.log(`  ${r.listing_id}: raw deposit=${r.deposit}, price=${r.price} -> corrected=${correctedDeposit}`);
}

const normalDeposits = normal.map((r) => r.deposit);
const correctedSuspectDeposits = suspect.map((r) => r.deposit * r.price);
console.log('\nNormal deposit amounts (rupees) — median:', median(normalDeposits).toLocaleString('en-IN'));
console.log('Corrected suspect deposit amounts (rupees) — median:', median(correctedSuspectDeposits).toLocaleString('en-IN'));

const byWebsite = {};
for (const r of suspect) byWebsite[r.website] = (byWebsite[r.website] || 0) + 1;
console.log('\nSuspect records by website:', byWebsite);
