#!/usr/bin/env python3
"""
Plenum — Press Coverage Search

Reads collected_buildings.csv, searches for press coverage of each building
on The Real Deal, Crain's NY, and Commercial Observer, and writes results
back to the press_source column.

Uses DuckDuckGo HTML search (no API key required).

Usage:
    python model/search_press.py
    python model/search_press.py --limit 20   # only search first N buildings
"""

import csv
import time
import argparse
import requests
from urllib.parse import quote_plus
from html.parser import HTMLParser

INPUT_FILE  = 'model/collected_buildings.csv'
OUTPUT_FILE = 'model/collected_buildings.csv'  # overwrites in place

SOURCES = [
    'therealdeal.com',
    'crainsnewyork.com',
    'commercialobserver.com',
]

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/120.0.0.0 Safari/537.36'
    )
}


class DDGResultParser(HTMLParser):
    """Minimal parser to extract result URLs from DuckDuckGo HTML."""
    def __init__(self):
        super().__init__()
        self.results = []
        self._in_result = False

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            attrs = dict(attrs)
            href = attrs.get('href', '')
            if any(s in href for s in SOURCES):
                self.results.append(href)


def search_building(address, borough):
    """Search DuckDuckGo for press coverage of a building."""
    query = f'"{address}" {borough} NYC office residential conversion'
    site_filter = ' OR '.join(f'site:{s}' for s in SOURCES)
    full_query = f'{query} ({site_filter})'

    url = f'https://html.duckduckgo.com/html/?q={quote_plus(full_query)}'
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if not resp.ok:
            return ''
        parser = DDGResultParser()
        parser.feed(resp.text)
        # Return top 3 unique URLs
        seen, urls = set(), []
        for r in parser.results:
            if r not in seen:
                seen.add(r)
                urls.append(r)
            if len(urls) >= 3:
                break
        return ' | '.join(urls)
    except Exception as e:
        print(f"    Search error: {e}")
        return ''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=None,
                        help='Only search the first N buildings')
    args = parser.parse_args()

    # Read existing CSV
    with open(INPUT_FILE, newline='') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    if args.limit:
        to_search = rows[:args.limit]
        skip = rows[args.limit:]
    else:
        to_search = rows
        skip = []

    print(f"Searching press coverage for {len(to_search)} buildings...")
    print(f"Sources: {', '.join(SOURCES)}\n")

    for i, row in enumerate(to_search):
        address = row.get('address', '')
        borough = row.get('borough', '')

        # Skip if already has press source
        if row.get('press_source'):
            print(f"[{i+1}/{len(to_search)}] {address} — already has source, skipping")
            continue

        print(f"[{i+1}/{len(to_search)}] Searching: {address}, {borough}...")
        result = search_building(address, borough)
        row['press_source'] = result

        if result:
            print(f"    Found: {result[:100]}...")
        else:
            print(f"    No results found")

        time.sleep(1.5)  # avoid rate limiting

    # Write back
    all_rows = to_search + skip
    with open(OUTPUT_FILE, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(all_rows)

    found = sum(1 for r in to_search if r.get('press_source'))
    print(f"\nDone. Found press coverage for {found}/{len(to_search)} buildings.")
    print(f"Results written to {OUTPUT_FILE}")
    print("\nNext step: open the CSV, read the articles, and fill in 'outcome' and 'notes'")


if __name__ == '__main__':
    main()
