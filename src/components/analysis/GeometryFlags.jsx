const levelStyle = {
  red: { bg: '#fdf2f2', border: '#f5c6c6' },
  amber: { bg: '#fef9ed', border: '#f5deb3' },
  green: { bg: '#f0f7f1', border: '#c5dcc8' },
};

export default function GeometryFlags({ flags }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: '#d6d0c4', background: '#faf9f6' }}>
      <h3 className="text-base font-semibold mb-4" style={{ color: '#1A4D2E' }}>Geometry Risk Flags</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {flags.map((f, i) => {
          const s = levelStyle[f.level];
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-3 border" style={{ background: s.bg, borderColor: s.border }}>
              <span className="text-lg">{f.icon}</span>
              <span className="text-sm font-medium" style={{ color: '#334155' }}>{f.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
