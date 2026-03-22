"""
Build 100-building training dataset for Plenum ML model.
50 successful conversions + 50 unconverted/infeasible buildings.
"""
import json, csv, urllib.request, time, sys

PLUTO_URL = "https://data.cityofnewyork.us/resource/64uk-42ks.json?bbl={}"
GEO_URL = "https://geosearch.planninglabs.nyc/v2/autocomplete?text={}"

def bbl_from_address(addr):
    url = GEO_URL.format(urllib.request.quote(addr + " New York"))
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Plenum/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            for f in data.get("features", []):
                bbl = f["properties"].get("addendum", {}).get("pad", {}).get("bbl")
                if bbl: return bbl
    except: pass
    return None

def fetch_pluto(bbl):
    url = PLUTO_URL.format(bbl)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Plenum/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            if data: return data[0]
    except: pass
    return None

def sf(val):
    try: return float(val)
    except: return 0.0

# (address, outcome, notes)
# 1 = successful conversion, 0 = not converted / infeasible
ADDRESSES = [
    # === 50 SUCCESSFUL CONVERSIONS ===
    ("25 Water Street Manhattan", 1, "25 Water St - SoMA 1300 units"),
    ("55 Broad Street Manhattan", 1, "55 Broad St - 571 rental units"),
    ("160 Water Street Manhattan", 1, "160 Water St - 580 units"),
    ("180 Water Street Manhattan", 1, "180 Water St - 573 units"),
    ("1 Wall Street Manhattan", 1, "1 Wall St - 566 condos"),
    ("70 Pine Street Manhattan", 1, "70 Pine St - 644 rentals"),
    ("5 Beekman Street Manhattan", 1, "5 Beekman St - hotel + condos"),
    ("233 Broadway Manhattan", 1, "Woolworth - upper floor condos"),
    ("20 Broad Street Manhattan", 1, "20 Broad St - 533 rentals"),
    ("49 Chambers Street Manhattan", 1, "49 Chambers - rental conversion"),
    ("116 John Street Manhattan", 1, "116 John St - residential"),
    ("17 John Street Manhattan", 1, "17 John St - residential"),
    ("15 Broad Street Manhattan", 1, "15 Broad St - rental 2022"),
    ("10 Liberty Street Manhattan", 1, "10 Liberty St - residential"),
    ("21 West Street Manhattan", 1, "21 West St - residential"),
    ("77 Water Street Manhattan", 1, "77 Water St - conversion"),
    ("10 Madison Square West Manhattan", 1, "Toy Center to condos"),
    ("63 Wall Street Manhattan", 1, "63 Wall St - residential"),
    ("75 Wall Street Manhattan", 1, "75 Wall St - residential"),
    ("90 John Street Manhattan", 1, "90 John St - residential"),
    ("100 Maiden Lane Manhattan", 1, "100 Maiden Lane - residential"),
    ("8 Spruce Street Manhattan", 1, "8 Spruce St - Gehry tower"),
    ("67 Wall Street Manhattan", 1, "67 Wall St - rental conversion"),
    ("110 Maiden Lane Manhattan", 1, "110 Maiden Lane - residential"),
    ("44 Wall Street Manhattan", 1, "44 Wall St - rental conversion"),
    ("48 Wall Street Manhattan", 1, "48 Wall St - rental conversion"),
    ("71 Broadway Manhattan", 1, "71 Broadway - rental conversion"),
    ("2 Gold Street Manhattan", 1, "2 Gold St - rental conversion"),
    ("99 John Street Manhattan", 1, "99 John St - rental conversion"),
    ("88 Greenwich Street Manhattan", 1, "88 Greenwich - rental conversion"),
    ("125 Maiden Lane Manhattan", 1, "125 Maiden Lane - residential"),
    ("59 Maiden Lane Manhattan", 1, "59 Maiden Lane - residential"),
    ("4 New York Plaza Manhattan", 1, "4 NY Plaza - residential"),
    ("85 John Street Manhattan", 1, "85 John St - residential"),
    ("15 William Street Manhattan", 1, "15 William St - residential"),
    ("80 John Street Manhattan", 1, "80 John St - residential"),
    ("87 Nassau Street Manhattan", 1, "87 Nassau St - residential"),
    ("1 Maiden Lane Manhattan", 1, "1 Maiden Lane - residential"),
    ("130 William Street Manhattan", 1, "130 William St - residential"),
    ("95 Wall Street Manhattan", 1, "95 Wall St - residential"),
    ("29 Broadway Manhattan", 1, "29 Broadway - residential"),
    ("50 West Street Manhattan", 1, "50 West St - residential tower"),
    ("19 Dutch Street Manhattan", 1, "19 Dutch St - residential"),
    ("45 Wall Street Manhattan", 1, "45 Wall St - residential"),
    ("115 Broadway Manhattan", 1, "115 Broadway - residential"),
    ("14 Wall Street Manhattan", 1, "14 Wall St - residential"),
    ("120 Wall Street Manhattan", 1, "120 Wall St - residential"),
    ("111 John Street Manhattan", 1, "111 John St - residential"),
    ("343 Gold Street Brooklyn", 1, "343 Gold St - office to res"),
    ("1 Hanson Place Brooklyn", 1, "1 Hanson Pl - Williamsburg Bank"),

    # === 50 NOT CONVERTED / INFEASIBLE ===
    ("55 Water Street Manhattan", 0, "55 Water St - largest floor plates"),
    ("1271 Avenue of the Americas Manhattan", 0, "Time-Life Building"),
    ("1270 Avenue of the Americas Manhattan", 0, "1270 6th Ave"),
    ("One Penn Plaza Manhattan", 0, "One Penn Plaza"),
    ("195 Broadway Manhattan", 0, "195 Broadway - AT&T"),
    ("388 Greenwich Street Manhattan", 0, "Citigroup campus"),
    ("1185 Avenue of the Americas Manhattan", 0, "1185 6th Ave"),
    ("200 Vesey Street Manhattan", 0, "Brookfield Place"),
    ("225 Liberty Street Manhattan", 0, "Brookfield Place"),
    ("250 Vesey Street Manhattan", 0, "Brookfield Place"),
    ("1290 Avenue of the Americas Manhattan", 0, "1290 6th Ave"),
    ("1345 Avenue of the Americas Manhattan", 0, "1345 6th Ave"),
    ("1301 Avenue of the Americas Manhattan", 0, "1301 6th Ave"),
    ("1211 Avenue of the Americas Manhattan", 0, "1211 6th Ave"),
    ("375 Hudson Street Manhattan", 0, "375 Hudson St"),
    ("1133 Avenue of the Americas Manhattan", 0, "1133 6th Ave"),
    ("1411 Broadway Manhattan", 0, "1411 Broadway"),
    ("11 Times Square Manhattan", 0, "11 Times Square"),
    ("101 Park Avenue Manhattan", 0, "101 Park Ave"),
    ("7 World Trade Center Manhattan", 0, "7 WTC"),
    ("4 Times Square Manhattan", 0, "Conde Nast building"),
    ("1515 Broadway Manhattan", 0, "1515 Broadway - Viacom"),
    ("1585 Broadway Manhattan", 0, "Morgan Stanley"),
    ("1633 Broadway Manhattan", 0, "Paramount Plaza"),
    ("1675 Broadway Manhattan", 0, "1675 Broadway"),
    ("1221 Avenue of the Americas Manhattan", 0, "McGraw-Hill"),
    ("1251 Avenue of the Americas Manhattan", 0, "Exxon Building"),
    ("277 Park Avenue Manhattan", 0, "277 Park Ave"),
    ("299 Park Avenue Manhattan", 0, "299 Park Ave"),
    ("245 Park Avenue Manhattan", 0, "245 Park Ave"),
    ("1166 Avenue of the Americas Manhattan", 0, "1166 6th Ave"),
    ("1114 Avenue of the Americas Manhattan", 0, "Grace Building"),
    ("1095 Avenue of the Americas Manhattan", 0, "1095 6th Ave"),
    ("51 West 52nd Street Manhattan", 0, "CBS Building"),
    ("1285 Avenue of the Americas Manhattan", 0, "1285 6th Ave"),
    ("237 Park Avenue Manhattan", 0, "237 Park Ave"),
    ("320 Park Avenue Manhattan", 0, "320 Park Ave"),
    ("399 Park Avenue Manhattan", 0, "Citibank HQ"),
    ("410 Park Avenue Manhattan", 0, "410 Park Ave"),
    ("450 Park Avenue Manhattan", 0, "450 Park Ave"),
    ("1 New York Plaza Manhattan", 0, "1 NY Plaza"),
    ("2 World Financial Center Manhattan", 0, "225 Vesey"),
    ("3 World Financial Center Manhattan", 0, "200 Vesey"),
    ("100 Church Street Manhattan", 0, "100 Church St"),
    ("90 Church Street Manhattan", 0, "90 Church St"),
    ("60 Hudson Street Manhattan", 0, "60 Hudson - Western Union"),
    ("32 Avenue of the Americas Manhattan", 0, "32 6th Ave"),
    ("620 Avenue of the Americas Manhattan", 0, "620 6th Ave"),
    ("1 Liberty Plaza Manhattan", 0, "1 Liberty Plaza"),
    ("140 Broadway Manhattan", 0, "140 Broadway - Marine Midland"),
]

def main():
    rows = []
    seen = set()
    for addr, outcome, notes in ADDRESSES:
        print(f"Looking up: {addr}")
        bbl = bbl_from_address(addr)
        if not bbl or bbl in seen:
            print(f"  SKIP: no BBL or duplicate")
            continue
        seen.add(bbl)
        time.sleep(0.2)

        pluto = fetch_pluto(bbl)
        if not pluto:
            print(f"  SKIP: no PLUTO for {bbl}")
            continue
        time.sleep(0.2)

        nf = sf(pluto.get("numfloors", 0))
        la = sf(pluto.get("lotarea", 0))
        ba = sf(pluto.get("bldgarea", 0))
        yb = sf(pluto.get("yearbuilt", 0))
        bc = pluto.get("bldgclass", "")
        far = ba / la if la > 0 else 0

        rows.append({
            "bbl": bbl, "numfloors": nf, "lotarea": la, "bldgarea": ba,
            "yearbuilt": yb, "bldgclass": bc,
            "zonedist1": pluto.get("zonedist1", ""),
            "far": round(far, 2),
            "is_office": 1 if bc.startswith("O") else 0,
            "is_prewar": 1 if 1900 < yb < 1945 else 0,
            "is_postwar_ideal": 1 if 1945 <= yb <= 1980 else 0,
            "is_modern": 1 if yb > 2000 else 0,
            "outcome": outcome, "notes": notes,
        })
        print(f"  ✓ {bbl} | {nf:.0f}fl | {la:.0f}lot | {ba:.0f}bldg | {yb:.0f} | {bc}")

    outpath = "model/training_data.csv"
    with open(outpath, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    conv = sum(1 for r in rows if r["outcome"] == 1)
    print(f"\nWrote {len(rows)} buildings ({conv} converted, {len(rows)-conv} not)")

if __name__ == "__main__":
    main()
