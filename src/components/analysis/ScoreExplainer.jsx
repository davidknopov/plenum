import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scoreColor } from '../../scoring/engine';

export default function ScoreExplainer({ title, score, factors }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border" style={{ borderColor: '#d6d0c4', background: '#faf9f6' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
        style={{ color: '#1A4D2E' }}
      >
        <span>Why this score? — {title}: <span style={{ color: scoreColor(score) }}>{score}</span></span>
        <span className="text-xs" style={{ color: '#94a3b8' }}>{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1">
              {factors.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b" style={{ borderColor: '#e8e4df' }}>
                  <span style={{ color: '#334155' }}>{f.text}</span>
                  <span className="font-mono font-semibold" style={{ color: f.delta > 0 ? '#1A4D2E' : f.delta < 0 ? '#C0392B' : '#6b7c6e' }}>
                    {f.delta > 0 ? `+${f.delta}` : f.delta}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs font-semibold pt-1" style={{ color: '#1A4D2E' }}>
                <span>Total (clamped 0–100)</span>
                <span>{score}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
