export default function BuildingSummary({ pluto }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#1A4D2E', color: '#faf9f6' }}>
      <p className="text-lg font-semibold mb-1">📍 {pluto.address}</p>
      <p className="text-sm opacity-90 mb-1">
        🏢 {pluto.numfloors}-story building &nbsp;|&nbsp; Built {pluto.yearbuilt} &nbsp;|&nbsp; {pluto.bldgarea.toLocaleString()} sq ft
      </p>
      <p className="text-sm opacity-90 mb-1">
        🗺️ Zoning: {pluto.zonedist1 || '—'} &nbsp;|&nbsp; Building Class: {pluto.bldgclass || '—'}
      </p>
      <p className="text-sm opacity-90 mb-1">👤 Owner: {pluto.ownername || '—'}</p>
      <p className="text-xs opacity-70">🔑 BBL: {pluto.bbl}</p>
    </div>
  );
}
