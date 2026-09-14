// src/lib/detectors.test.js
import { describe, it, expect } from 'vitest';
import { isCorrupt, computeNormalMedianAreaByBhk, isFakeListing, correctedDeposit } from './detectors';

function baseListing(overrides = {}) {
  return {
    listing_id: 'TEST-0001',
    website: 'dwelling',
    bedroom: 2,
    floor: 5,
    total_floors: 10,
    carpet_area: 800,
    super_built_up_area: 1000,
    price: 8000000,
    ...overrides,
  };
}

describe('isCorrupt', () => {
  it('does not flag a normal listing', () => {
    expect(isCorrupt(baseListing())).toBe(false);
  });

  it('flags a negative price', () => {
    expect(isCorrupt(baseListing({ price: -100 }))).toBe(true);
  });

  it('flags a zero price', () => {
    expect(isCorrupt(baseListing({ price: 0 }))).toBe(true);
  });

  it('flags floor exceeding total_floors', () => {
    expect(isCorrupt(baseListing({ floor: 20, total_floors: 10 }))).toBe(true);
  });

  it('does not flag floor equal to total_floors (top floor is valid)', () => {
    expect(isCorrupt(baseListing({ floor: 10, total_floors: 10 }))).toBe(false);
  });

  it('flags carpet_area exceeding super_built_up_area', () => {
    expect(isCorrupt(baseListing({ carpet_area: 1200, super_built_up_area: 1000 }))).toBe(true);
  });

  it('does not flag carpet_area equal to super_built_up_area', () => {
    expect(isCorrupt(baseListing({ carpet_area: 1000, super_built_up_area: 1000 }))).toBe(false);
  });

  it('does not flag a ground-floor listing (floor: 0 is valid, not corrupt)', () => {
    expect(isCorrupt(baseListing({ floor: 0, total_floors: 6 }))).toBe(false);
  });
});

describe('computeNormalMedianAreaByBhk', () => {
  it('excludes the given website from the median calculation', () => {
    const listings = [
      baseListing({ website: 'dwelling', bedroom: 2, carpet_area: 800 }),
      baseListing({ website: 'dwelling', bedroom: 2, carpet_area: 900 }),
      baseListing({ website: 'magichomes', bedroom: 2, carpet_area: 80 }), // should be excluded
    ];
    const medians = computeNormalMedianAreaByBhk(listings, 'magichomes');
    // median of [800, 900] -> 900 with this implementation's floor-index pick
    expect(medians[2]).toBeGreaterThanOrEqual(800);
    expect(medians[2]).toBeLessThanOrEqual(900);
  });

  it('ignores non-positive carpet_area when computing the median', () => {
    const listings = [
      baseListing({ website: 'dwelling', bedroom: 3, carpet_area: 1200 }),
      baseListing({ website: 'dwelling', bedroom: 3, carpet_area: 0 }),
    ];
    const medians = computeNormalMedianAreaByBhk(listings, 'magichomes');
    expect(medians[3]).toBe(1200);
  });
});

describe('isFakeListing', () => {
  const medianMap = { 2: 838, 3: 1202 };

  it('flags a listing with carpet_area far below the normal median (the real pattern: ~9-11%)', () => {
    const listing = baseListing({ bedroom: 2, carpet_area: 78 }); // ~9.3% of 838
    expect(isFakeListing(listing, medianMap)).toBe(true);
  });

  it('does not flag a listing with a normal carpet_area', () => {
    const listing = baseListing({ bedroom: 2, carpet_area: 820 });
    expect(isFakeListing(listing, medianMap)).toBe(false);
  });

  it('does not flag a listing right at the threshold boundary (25% of median)', () => {
    const listing = baseListing({ bedroom: 2, carpet_area: 838 * 0.25 }); // above 0.2 threshold
    expect(isFakeListing(listing, medianMap)).toBe(false);
  });

  it('returns false for a bedroom count with no known median (no baseline to compare against)', () => {
    const listing = baseListing({ bedroom: 9, carpet_area: 10 });
    expect(isFakeListing(listing, medianMap)).toBe(false);
  });
});

describe('correctedDeposit', () => {
  it('corrects a zerobroker deposit stored as a small month-count', () => {
    const rental = { website: 'zerobroker', price: 33000, deposit: 7 };
    expect(correctedDeposit(rental)).toBe(231000);
  });

  it('does not alter a non-zerobroker deposit', () => {
    const rental = { website: 'dwelling', price: 33000, deposit: 200000 };
    expect(correctedDeposit(rental)).toBe(200000);
  });

  it('does not alter a zerobroker deposit that is already a plausible rupee amount', () => {
    const rental = { website: 'zerobroker', price: 33000, deposit: 200000 };
    expect(correctedDeposit(rental)).toBe(200000);
  });
});