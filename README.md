# Ivy Homes Internship Assignment

## Status
🚧 In progress — started Sept 12, 2026

## How to run
(TBD)

## Approach: what I distrusted in the docs, and how I tested it

- Docs say API key goes as `?api_key=` query param — actual API requires it as
  `X-API-Key` header. (finding: auth)
- Docs say `/v1/listings` etc. only need the API key — actual API also requires
  a bearer token from login. (finding: auth)
- Docs say login token lasts 24h (`expires_in: 86400`) with "no refresh flow" —
  actual token lasts 900s (15 min) and there IS a refresh flow via
  `POST /auth/refresh` (undocumented). (finding: auth)

## What I checked that turned out to be fine
page param silently ignored → discovered via direct comparison → confirmed real mechanism is offset-based

total_listings first looked broken across the board, then turned out to correctly track is_live listings, and excluding corrupt records actually made the match worse, ruling that hypothesis out

checked whether posted_at was secretly mislabeled IST instead of UTC; found no evidence — uniform Z formatting, and posting-hour distribution was flat under both interpretations (data is likely synthetic, no diurnal pattern to exploit either way)

Checked phone number reuse → ruled out (almost every phone reused, not source-specific)
Checked duplicate descriptions → ruled out (only 1 coincidental pair)
Checked repeated coordinates → ruled out (zero hits)
Checked description-vs-fields mismatches → ruled out (zero hits)
Checked price-per-sqft outliers → found it, traced to one website, root-caused to shrunk carpet_area, refined detection from a derived-metric threshold to the actual underlying mechanism.

## What I'd do with two more days
(TBD)

## Tools/LLMs used
(TBD)