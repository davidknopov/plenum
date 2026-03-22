# Plenum — Claude Context

## What This App Is

Plenum is an NYC office-to-residential conversion feasibility screening tool built as a React SPA. Given any NYC address, it pulls live building data from NYC PLUTO and scores the property across three dimensions — spatial feasibility, daylight viability, and efficiency — then produces a report with an ML-backed viability prediction.

The core thesis: no one has a labeled dataset of NYC conversion outcomes mapped to spatial building attributes at scale. That dataset is Plenum's competitive moat. Competitors (Property Scout, Matterport) can pull DOB data but can't replicate hand-labeled outcome data without doing the same manual work.

## Tech Stack

- React 19 + Vite + Tailwind CSS v4 + Framer Motion + Leaflet
- Hash-based routing (react-router-dom) for static hosting on GitHub Pages
- NYC Planning Labs Geosearch API for address autocomplete
- NYC Open Data PLUTO API (`64uk-42ks`) for building attributes
- Bundled random forest model (`src/scoring/model.json`) for ML prediction, trained in Python and exported as JSON for client-side inference

## Key Files

| File | Purpose |
|---|---|
| `src/api/geosearch.js` | Address search + PLUTO data fetch |
| `src/scoring/engine.js` | Rule-based scoring (spatial, daylight, efficiency) + geometry flags + explainability |
| `src/scoring/mlPredict.js` | Client-side random forest inference |
| `src/scoring/model.json` | Bundled trained model (replace after retraining) |
| `src/components/analysis/ReportPanel.jsx` | Main report UI — assembles all scores, flags, ML prediction |
| `model/training_data.csv` | 96 hand-labeled NYC buildings (outcome + PLUTO attributes) |
| `model/train_model.py` | Trains random forest, exports to `src/scoring/model.json` |
| `model/collect_outcomes.py` | Queries DOB + PLUTO to find conversion candidates for labeling |
| `model/search_press.py` | Searches The Real Deal / Crain's / Commercial Observer for press coverage |
| `model/backfill_features.py` | Re-fetches PLUTO for existing training rows to add new feature columns |

## Scoring Logic

**Spatial score** (0–100): floor count, FAR, year built, building class, landmark status, flood zone, irregular lot
**Daylight score** (0–100): lot area, floor count
**Efficiency score** (0–100): FAR, floor count, year built

**Geometry flags**: floor plate depth, core placement, daylight penetration, net-to-gross efficiency, flood zone, landmark/historic district, irregular lot

**ML features**: numfloors, lotarea, bldgarea, yearbuilt, far, is_office, is_prewar, is_postwar_ideal, is_modern, is_landmark, is_floodzone, is_irregular, office_ratio

## PLUTO Fields in Use

Core: `bbl`, `address`, `ownername`, `yearbuilt`, `numfloors`, `lotarea`, `bldgarea`, `landuse`, `zonedist1`, `bldgclass`, `unitsres`, `unitstotal`

Extended: `officearea`, `retailarea`, `resarea`, `histdist`, `landmark`, `pfirm15_flag`, `irrlotcode`

## Roadmap (Prioritized)

| Priority | Feature | Status |
|---|---|---|
| 1 | Floor plate perimeter/area ratio (NYC 3D Building Model) | Not started |
| 2 | Floor-to-floor height + structural type (DOB PDFs) | Manual only |
| 3 | Core location — central vs. side core (DOB PDFs) | Manual only |
| 4 | Flood zone flag (pfirm15) | Done |
| 5 | Landmark / historic district | Done |
| 6 | Open DOB violation count (DOB BIS API) | Not started |
| 7 | Subway entrance distance (MTA GTFS) | Not started |
| 8 | 485-x tax abatement eligibility (NYC DCP) | Not started |
| 9 | Existing debt load (ACRIS) | Not started |
| 10 | Street View facade imagery (Google API) | Phase 2 |

## Training Data Strategy

- Current dataset: 96 labeled NYC buildings in `model/training_data.csv`
- Target: 50 additional hand-labeled buildings (user is building this list manually)
- Outcome labels: 1 = converted successfully, 0 = did not convert
- Key insight: ~50/50 outcome balance matters more than total volume
- Notes column should capture *why* a building failed (too deep, landmark, structural cost, etc.)
- Pipeline: `collect_outcomes.py` → manual labeling → `search_press.py` → `train_model.py`

## GitHub

- Repo: `github.com/davidknopov/plenum`
- Auth: classic PAT for `reillykarger-oss` account (fine-grained PATs do not work for git push even with collaborator access — always use classic)
- Push command: `git -c credential.helper="" push https://reillykarger-oss:TOKEN@github.com/davidknopov/plenum.git master`
- Deploy: `npm run deploy` (builds and pushes to gh-pages branch)

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5173/plenum/
```

## Retraining the Model

```bash
python3 model/backfill_features.py   # update existing rows with new PLUTO fields
python3 model/train_model.py         # retrain + export model.json
```
