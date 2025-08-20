# Bharath + Vaish 💍 Countdown

Minimal, static Next.js 14 + TypeScript + Tailwind app that counts down to 30 Aug 2025 with days, minutes, seconds, and milliseconds. Pure client-side, exportable to `out/` for Vercel or GitHub Pages.

## Tech
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- date-fns for date formatting
- zod for simple form validation

## Local Development
```bash
npm i
npm run dev
```

## Build/Export
```bash
npm run export
# Static output in ./out
```

## Deploy to Vercel
1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. No extra config required. The site builds and serves statically.

## Deploy to GitHub Pages
1. Enable Pages in repo Settings → Pages → Source: GitHub Actions.
2. Push to `main`. The included workflow builds and deploys.
3. URL will be shown in Actions logs.

## Query Parameters
- `title`: overrides heading
- `date`: ISO datetime, e.g. `2025-08-30T00:00:00`

Example: `?title=Bharath%20+%20Vaish%20💍&date=2025-08-30T00:00:00`


