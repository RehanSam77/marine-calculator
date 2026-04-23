# Marine Cable Calculator

A modern, minimalist web application for **marine cable sizing** — a full React + TypeScript rewrite of the original PyQt6 desktop tool. It selects the optimal cable cross-sectional area (CSA) based on current carrying capacity and voltage drop, with automatic fallback to multiple parallel runs.

## Features

- Clean, responsive UI (React 18 + Tailwind CSS)
- 100% TypeScript, strict mode
- Iterative cable selection (Minimum Run mode) ported 1:1 from the Python reference
- Fixed-CSA mode with parallel-run calculation
- Live voltage-drop vs CSA chart (Recharts)
- Detailed calculation log
- Client-side PDF report export (jsPDF + autoTable) including the chart
- Zero backend — deploys as static files to Vercel / Netlify / GitHub Pages / any CDN

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle in ./dist
npm run preview      # preview the production build locally
```

Requires Node.js 18 or newer.

## Project structure

```
src/
  App.tsx                  # Main shell
  main.tsx                 # Entry point
  types.ts                 # Shared types
  data/cableTables.ts      # Current / R / X tables
  lib/calculator.ts        # Pure calculation engine
  lib/pdf.ts               # PDF report generation
  components/
    InputForm.tsx
    Results.tsx
    VoltageDropChart.tsx
    CalculationLog.tsx
```

## Deployment

### Vercel (recommended — easiest)

1. Push this folder to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Vite; `vercel.json` is already configured.
4. Click **Deploy**. That's it.

### Netlify

1. Push to GitHub.
2. On [netlify.com](https://app.netlify.com), click **Add new site → Import an existing project**.
3. `netlify.toml` handles build command (`npm run build`) and publish dir (`dist`).

### GitHub Pages

A ready-made workflow lives at `.github/workflows/deploy-pages.yml`.

1. Push to the `main` branch of a GitHub repo.
2. In repo **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Every push to `main` builds and publishes automatically.

Because `vite.config.ts` uses `base: "./"`, the build works at any path — no extra config needed whether you deploy to `user.github.io/`, `user.github.io/repo/`, or a custom domain.

### Any static host

`npm run build` produces a fully static `dist/` folder. Drop it on S3, Cloudflare Pages, nginx, Firebase Hosting, or a USB stick. No server required.

## Calculation reference

- **Voltage drop**: `Vd = I × L × √3 × (R·cos θ + X·sin θ) / 1000`
- **Current capacity**: based on IEC 60287 tables (1.5–300 mm²)
- **Core types**: Single Core, 2 Core, 3 or 4 Core
- **Algorithm**: in **Minimum Run** mode, CSA is increased stepwise until voltage drop ≤ limit. If the largest CSA still exceeds the limit, the tool switches to multiple parallel runs on the largest cable. In **Fixed CSA** mode, the number of parallel runs is increased instead.

## License

MIT © 2026 — for professional engineering use; always verify against applicable standards.
