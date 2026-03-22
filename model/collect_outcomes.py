#!/usr/bin/env python3
"""
Plenum — Conversion Outcome Data Collector

Step 1: Query NYC DOB for ALT1 permits where existing occupancy is commercial
        and proposed occupancy is residential.
Step 2: Cross-reference each building's BBL with PLUTO for spatial attributes.
Step 3: Write a CSV ready for manual outcome labeling and press research.

Usage:
    python model/collect_outcomes.py

Output:
    model/collected_buildings.csv
"""

import csv
import time
import requests

DOB_URL = "https://data.cityofnewyork.us/resource/ipu4-2q9a.json"
PLUTO_URL = "https://data.cityofnewyork.us/resource/64uk-42ks.json"

# NYC DOB occupancy group codes
COMMERCIAL_EXISTING = ('B', 'E', 'F', 'S')       # business, mercantile, factory, storage
RESIDENTIAL_PROPOSED = ('J', 'J1', 'J2', 'J3')   # multiple dwelling

OUTPUT_COLUMNS = [
    # Identifiers
    'bbl', 'address', 'borough', 'bin',
    # DOB permit
    'job_status', 'existing_occupancy', 'proposed_occupancy',
    'filing_date', 'job_description',
    # Core PLUTO spatial attributes (match training_data.csv)
    'numfloors', 'lotarea', 'bldgarea', 'yearbuilt', 'bldgclass', 'zonedist1',
    'far', 'is_office', 'is_prewar', 'is_postwar_ideal', 'is_modern',
    # Extended PLUTO fields
    'officearea', 'retailarea', 'resarea',
    'histdist', 'landmark', 'pfirm15_flag', 'irrlotcode',
    'is_landmark', 'is_floodzone', 'is_irregular', 'office_ratio',
    # To be filled manually after collection
    'outcome', 'outcome_confidence', 'notes', 'press_source',
]


def fetch_dob_conversions(limit=2000):
    """Fetch ALT1 permits with residential proposed occupancy from DOB."""
    occ_filter = " OR ".join(f"proposedoccupancy='{c}'" for c in RESIDENTIAL_PROPOSED)
    params = {
        '$limit': limit,
        '$where': f"job_type='A1' AND ({occ_filter})",
        '$select': (
            'bbl,bin,house__,street_name,borough,job_status,'
            'existingoccupancy,proposedoccupancy,job_description,approval_date'
        ),
        '$order': 'approval_date DESC',
    }
    print("Querying DOB for ALT1 residential conversion permits...")
    resp = requests.get(DOB_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def fetch_pluto(bbl):
    """Fetch PLUTO record for a given BBL."""
    resp = requests.get(
        PLUTO_URL,
        params={'$where': f"bbl='{bbl}'", '$limit': 1},
        timeout=15,
    )
    if not resp.ok:
        return None
    data = resp.json()
    return data[0] if data else None


def compute_features(p):
    """Derive scoring features from a PLUTO record."""
    numfloors   = float(p.get('numfloors', 0) or 0)
    lotarea     = float(p.get('lotarea', 0) or 0)
    bldgarea    = float(p.get('bldgarea', 0) or 0)
    yearbuilt   = float(p.get('yearbuilt', 0) or 0)
    officearea  = float(p.get('officearea', 0) or 0)
    bldgclass   = p.get('bldgclass', '')
    histdist    = p.get('histdist', '')
    landmark    = p.get('landmark', '')
    pfirm15     = p.get('pfirm15_flag', '')
    irrlotcode  = p.get('irrlotcode', '')

    far          = round(bldgarea / lotarea, 2) if lotarea > 0 else 0
    office_ratio = round(officearea / bldgarea, 3) if bldgarea > 0 else 0

    return {
        'numfloors':        numfloors,
        'lotarea':          lotarea,
        'bldgarea':         bldgarea,
        'yearbuilt':        yearbuilt,
        'bldgclass':        bldgclass,
        'zonedist1':        p.get('zonedist1', ''),
        'far':              far,
        'is_office':        1 if bldgclass.startswith('O') else 0,
        'is_prewar':        1 if 1900 < yearbuilt < 1945 else 0,
        'is_postwar_ideal': 1 if 1945 <= yearbuilt <= 1980 else 0,
        'is_modern':        1 if yearbuilt > 2000 else 0,
        'officearea':       officearea,
        'retailarea':       float(p.get('retailarea', 0) or 0),
        'resarea':          float(p.get('resarea', 0) or 0),
        'histdist':         histdist,
        'landmark':         landmark,
        'pfirm15_flag':     pfirm15,
        'irrlotcode':       irrlotcode,
        'is_landmark':      1 if (landmark or histdist) else 0,
        'is_floodzone':     1 if pfirm15 == 'Y' else 0,
        'is_irregular':     1 if (irrlotcode and irrlotcode != '0') else 0,
        'office_ratio':     office_ratio,
    }


def main():
    # --- Step 1: Pull DOB permits ---
    records = fetch_dob_conversions()

    # Keep only records where existing occupancy is commercial
    conversions = [
        r for r in records
        if any(r.get('existingoccupancy', '').startswith(c) for c in COMMERCIAL_EXISTING)
    ]

    # Deduplicate by BBL
    seen, unique = set(), []
    for r in conversions:
        bbl = r.get('bbl')
        if bbl and bbl not in seen:
            seen.add(bbl)
            unique.append(r)

    print(f"  {len(records)} total ALT1 residential permits")
    print(f"  {len(conversions)} with commercial existing occupancy")
    print(f"  {len(unique)} unique buildings by BBL")

    # --- Step 2: Cross-reference with PLUTO ---
    rows = []
    for i, r in enumerate(unique):
        bbl     = r.get('bbl', '')
        address = f"{r.get('house__', '')} {r.get('street_name', '')}".strip()
        print(f"[{i+1}/{len(unique)}] {address}  BBL: {bbl}")

        row = {
            'bbl':               bbl,
            'address':           address,
            'borough':           r.get('borough', ''),
            'bin':               r.get('bin', ''),
            'job_status':        r.get('job_status', ''),
            'existing_occupancy': r.get('existingoccupancy', ''),
            'proposed_occupancy': r.get('proposedoccupancy', ''),
            'filing_date':       r.get('approval_date', ''),
            'job_description':   r.get('job_description', ''),
            'outcome':           '',
            'outcome_confidence': '',
            'notes':             '',
            'press_source':      '',
        }

        pluto = fetch_pluto(bbl) if bbl else None
        if pluto:
            row.update(compute_features(pluto))
        else:
            for col in OUTPUT_COLUMNS:
                row.setdefault(col, '')

        rows.append(row)
        time.sleep(0.15)  # respect API rate limits

    # --- Step 3: Write CSV ---
    outpath = 'model/collected_buildings.csv'
    with open(outpath, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=OUTPUT_COLUMNS, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nWrote {len(rows)} buildings to {outpath}")
    print("\nTop 10 by building area (prioritize these for manual labeling):")
    sized = [
        (float(r.get('bldgarea') or 0), r.get('address', ''), r.get('bbl', ''))
        for r in rows
    ]
    for area, addr, bbl in sorted(sized, reverse=True)[:10]:
        if area > 0:
            print(f"  {addr:45s}  {int(area):>12,} sf   BBL: {bbl}")

    print("\nNext steps:")
    print("  1. Run: python model/search_press.py  (find press coverage for each building)")
    print("  2. Open collected_buildings.csv and fill in 'outcome' (1=converted, 0=not)")
    print("  3. Run: python model/train_model.py  (retrain the model)")


if __name__ == '__main__':
    main()
