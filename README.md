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

---

## Feature Roadmap

The current model uses a subset of available signals. Below is a prioritized list of features to add, ranked by impact-to-effort ratio.

| Priority | Feature | Source | Effort | Impact |
|---|---|---|---|---|
| 1 | Floor plate perimeter/area ratio | NYC 3D Building Model (Open Data) | Low | Very High |
| 2 | Floor-to-floor height + structural type | DOB filings (PDF extraction) | High | Very High |
| 3 | Core location (central vs. side) | DOB filings / offering memoranda | High | Very High |
| 4 | Flood zone flag (`pfirm15`) | PLUTO — **already implemented** | Done | High |
| 5 | Landmark / historic district | PLUTO + LPC database — **already implemented** | Done | High |
| 6 | Open DOB violation count + severity | DOB BIS API | Low | High |
| 7 | Subway entrance distance | MTA GTFS data | Medium | High |
| 8 | 485-x tax abatement eligibility | NYC DCP eligibility maps | Medium | High |
| 9 | Existing debt load | ACRIS mortgage records | Medium | Medium |
| 10 | Street View facade imagery | Google Street View Static API + Vision API | Medium | Medium (Phase 2) |

### The Most Important Gap: Floor Plate Geometry

PLUTO tells you a building exists and its total area — it does not tell you the shape. Shape is the single biggest determinant of conversion feasibility.

**What matters:**
- Is the floor plate a narrow rectangle (good — daylight on both sides) or a deep square (bad — dark interior)?
- Where is the core relative to the perimeter?
- What is the actual window-to-core depth?

**How to compute it without floor plans:**

The [NYC 3D Building Model](https://www.nyc.gov/site/doitt/initiatives/3d-building.page) (free on NYC Open Data) gives full footprint polygons per building. From these you can compute:
- **Perimeter-to-area ratio** — best proxy for daylight viability. Thin buildings score high; large squares score low.
- **Minimum bounding rectangle** — approximates building depth and width
- **Compactness score** — how close the footprint is to a circle (bad) vs. a rectangle (better)

This is Plenum's core technical defensibility — no one is currently running this computation at scale for pre-diligence screening.

### Training Data: What to Label Next

Before adding new model features, manually annotate 20–30 known NYC conversions with as many fields as possible. Well-documented buildings include 25 Water St, 55 Broad St, 160 Water St, and 180 Water St — all covered in The Real Deal, Crain's, and Commercial Observer with enough detail to reconstruct most attributes.

**Outcome labels to capture:**
- Converted successfully → strong positive
- Converted with significant cost overrun → "hard conversion" positive
- Conversion attempted, abandoned → negative (capture failure reason)
- Sold to residential developer, not yet converted → weak positive
- Listed for conversion, no takers → weak negative

**Sources for outcome data:**
- DOB permit filings with "change of use" or "conversion" in the job description
- NYC HPD certificates of occupancy showing commercial → residential
- Real estate press (The Real Deal, Crain's, Commercial Observer)

### Tech Stack

- **React 19** with **React Router** (hash-based routing for static hosting)
- **Vite** for dev server and bundling
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Leaflet / react-leaflet** for map display
- **NYC Planning Labs Geosearch API** for address autocomplete
- **NYC Open Data (PLUTO)** for building attributes
