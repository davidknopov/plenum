import { motion } from 'framer-motion';
import { scoreColor } from '../../scoring/engine';

export default function ScoreRing({ score, label, interpretation, size = 120 }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e8e4df" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {score}
        </motion.span>
      </div>
      <p className="text-sm font-semibold" style={{ color: '#1A4D2E' }}>{label}</p>
      <p className="text-xs text-center max-w-[180px]" style={{ color: '#6b7c6e' }}>{interpretation}</p>
    </div>
  );
}
