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

## What I'd do with two more days
(TBD)

## Tools/LLMs used
(TBD)