const GEOSEARCH_URL = 'https://geosearch.planninglabs.nyc/v2/autocomplete';
const PLUTO_URL = 'https://data.cityofnewyork.us/resource/64uk-42ks.json';

export async function searchAddress(text) {
  if (!text || text.length < 3) return [];
  const res = await fetch(`${GEOSEARCH_URL}?text=${encodeURIComponent(text)}`);
  if (!res.ok) throw new Error('network');
  const data = await res.json();
  return (data.features || []).map(f => ({
    label: f.properties.label,
    bbl: f.properties.addendum?.pad?.bbl || null,
    coordinates: f.geometry?.coordinates
      ? [f.geometry.coordinates[1], f.geometry.coordinates[0]]
      : null,
  }));
}

export async function fetchPlutoData(bbl) {
  if (!bbl) return null;
  const res = await fetch(`${PLUTO_URL}?bbl=${bbl}`);
  if (!res.ok) throw new Error('network');
  const data = await res.json();
  if (!data.length) return null;
  const r = data[0];
  return {
    bbl: r.bbl,
    address: r.address,
    ownername: r.ownername,
    yearbuilt: Number(r.yearbuilt) || 0,
    numfloors: Number(r.numfloors) || 0,
    lotarea: Number(r.lotarea) || 0,
    bldgarea: Number(r.bldgarea) || 0,
    landuse: r.landuse,
    zonedist1: r.zonedist1,
    bldgclass: r.bldgclass,
    unitsres: Number(r.unitsres) || 0,
    unitstotal: Number(r.unitstotal) || 0,
    // Extended fields for richer scoring
    officearea: Number(r.officearea) || 0,
    retailarea: Number(r.retailarea) || 0,
    resarea: Number(r.resarea) || 0,
    histdist: r.histdist || '',
    landmark: r.landmark || '',
    pfirm15_flag: r.pfirm15_flag || '',
    irrlotcode: r.irrlotcode || '',
  };
}
