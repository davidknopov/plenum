# Plenum

Plenum is a web application for analyzing NYC commercial buildings as candidates for residential conversion. Given a NYC address, it pulls live property data and scores the building across spatial, daylight, and efficiency dimensions — then produces a feasibility report with an ML-backed viability prediction.

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173/plenum/`.

---

## Updating the Application

### Data & Scoring Logic

- **Scoring rules** are in `src/scoring/engine.js` — each of the three scores (spatial, daylight, efficiency) is calculated by a simple rule-based function. Edit the weights and thresholds there to tune scoring.
- **ML model** lives in `src/scoring/model.json` (a bundled random forest). To retrain: update `model/training_data.csv`, run `model/train_model.py`, and replace `src/scoring/model.json` with the output.
- **External APIs** are in `src/api/geosearch.js` — address search uses the NYC Planning Labs Geosearch API; property data comes from the NYC PLUTO dataset via the NYC Open Data API.

### UI

Pages are in `src/pages/`, reusable components in `src/components/`. Routing is defined in `src/App.jsx`.

### Deploying

```bash
npm run deploy
```

This builds the app and pushes to the `gh-pages` branch via `gh-pages`.

---

## How It Works

### Overview

1. **Address Search** — The user types a NYC address. Plenum queries the NYC Planning Labs Geosearch API for autocomplete results and resolves the address to a BBL (Borough-Block-Lot identifier).

2. **Property Data Fetch** — Using the BBL, Plenum pulls the building's record from NYC PLUTO (via NYC Open Data). This gives structured data: lot area, building area, floors, year built, building class, zoning, ownership, etc.

3. **Scoring** — Three scores (0–100) are calculated from the PLUTO data:
   - **Spatial Score** — Evaluates conversion suitability based on floor count, floor-area ratio (FAR), year built, and building class. Higher scores indicate better floor plate geometry for residential use.
   - **Daylight Score** — Estimates natural light access based on lot size and building height. Smaller lots and taller buildings tend to score higher.
   - **Efficiency Score** — Assesses net-to-gross floor plate efficiency using FAR, floor count, and construction era. Pre-1960 buildings often score better due to shallower floor plates.

4. **ML Prediction** — A random forest model (trained offline and bundled as JSON) produces a viability probability from the same PLUTO features. The top feature drivers are surfaced alongside the prediction.

5. **Report** — The app assembles scores, geometry flags (floor plate depth risk, core placement risk, daylight penetration, net-to-gross efficiency), and a plain-language recommendation into a printable report.

### Tech Stack

- **React 19** with **React Router** (hash-based routing for static hosting)
- **Vite** for dev server and bundling
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Leaflet / react-leaflet** for map display
- **NYC Planning Labs Geosearch API** for address autocomplete
- **NYC Open Data (PLUTO)** for building attributes
