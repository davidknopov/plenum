import { useState, useRef, useEffect } from 'react';
import { searchAddress } from '../../api/geosearch';

export default function AddressSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (val) => {
    setQuery(val);
    setError(null);
    clearTimeout(timer.current);
    if (val.length < 3) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await searchAddress(val);
        if (r.length === 0) setError('Address not found in NYC. Plenum currently supports NYC properties only.');
        setResults(r);
        setOpen(r.length > 0);
      } catch {
        setError('Data temporarily unavailable. Please try again.');
        setResults([]);
        setOpen(false);
      }
    }, 300);
  };

  const pick = (item) => {
    setQuery(item.label);
    setOpen(false);
    onSelect(item);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium mb-2" style={{ color: '#1A4D2E' }}>
        Search NYC Address
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start typing an NYC address..."
        className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2"
        style={{ borderColor: '#c5cfc8', background: '#faf9f6' }}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <ul className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ borderColor: '#c5cfc8' }}>
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => pick(r)}
              className="px-4 py-3 text-sm cursor-pointer hover:bg-green-50 border-b last:border-b-0"
              style={{ borderColor: '#eee' }}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-sm" style={{ color: '#C0392B' }}>{error}</p>}
    </div>
  );
}
