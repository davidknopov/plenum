import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloorPlan({ building }) {
  const [layers, setLayers] = useState({
    viable: true,
    deadZones: true,
    daylight: true,
    core: true,
  });

  const { width, depth, coreOffset, shape } = building.floorPlate;
  const scale = 1.8;
  const padding = 30;
  const svgWidth = width * scale + padding * 2;
  const svgHeight = depth * scale + padding * 2;
  
  const toggleLayer = (layer) => setLayers(l => ({ ...l, [layer]: !l[layer] }));

  // Calculate daylight reach (25-30 ft from windows is optimal)
  const daylightReach = Math.min(30 * scale, depth * scale * 0.25);
  const hasDeadZones = depth > 90;
  const deadZoneSize = hasDeadZones ? Math.max(0, (depth - 60) * scale * 0.3) : 0;

  // Render floor plate shape based on building type
  const renderFloorPlate = () => {
    const x = padding;
    const y = padding;
    const w = width * scale;
    const h = depth * scale;
    const coreW = 50 * scale;
    const coreH = 35 * scale;
    const coreX = x + coreOffset * scale;
    const coreY = y + (h - coreH) / 2;

    // Courtyard dimensions for deep buildings
    const courtyardW = 40 * scale;
    const courtyardH = 50 * scale;
    const courtyardX = x + (w - courtyardW) / 2;
    const courtyardY = y + (h - courtyardH) / 2;

    return (
      <g>
        {/* Main floor plate outline */}
        {shape === 'courtyard' ? (
          <path
            d={`M ${x} ${y} 
                L ${x + w} ${y} 
                L ${x + w} ${y + h} 
                L ${x} ${y + h} Z
                M ${courtyardX} ${courtyardY}
                L ${courtyardX} ${courtyardY + courtyardH}
                L ${courtyardX + courtyardW} ${courtyardY + courtyardH}
                L ${courtyardX + courtyardW} ${courtyardY} Z`}
            fill="none"
            stroke="#334155"
            strokeWidth={2}
            fillRule="evenodd"
          />
        ) : shape === 'U' ? (
          <path
            d={`M ${x} ${y} 
                L ${x + w} ${y} 
                L ${x + w} ${y + h} 
                L ${x} ${y + h} Z
                M ${x + w * 0.3} ${y}
                L ${x + w * 0.3} ${y + h * 0.5}
                L ${x + w * 0.7} ${y + h * 0.5}
                L ${x + w * 0.7} ${y} Z`}
            fill="none"
            stroke="#334155"
            strokeWidth={2}
            fillRule="evenodd"
          />
        ) : shape === 'L' ? (
          <path
            d={`M ${x} ${y} 
                L ${x + w * 0.6} ${y}
                L ${x + w * 0.6} ${y + h * 0.4}
                L ${x + w} ${y + h * 0.4}
                L ${x + w} ${y + h}
                L ${x} ${y + h} Z`}
            fill="none"
            stroke="#334155"
            strokeWidth={2}
          />
        ) : shape === 'atrium' ? (
          <>
            <rect x={x} y={y} width={w} height={h} fill="none" stroke="#334155" strokeWidth={2} />
            <rect 
              x={x + w * 0.35} y={y + h * 0.2} 
              width={w * 0.3} height={h * 0.6} 
              fill="none" stroke="#334155" strokeWidth={1.5} strokeDasharray="4,2"
            />
            <text x={x + w * 0.5} y={y + h * 0.5} textAnchor="middle" fill="#64748b" fontSize={10}>
              ATRIUM
            </text>
          </>
        ) : shape === 'superblock' ? (
          <rect x={x} y={y} width={w} height={h} fill="none" stroke="#334155" strokeWidth={2} />
        ) : (
          <rect x={x} y={y} width={w} height={h} fill="none" stroke="#334155" strokeWidth={2} />
        )}

        {/* Viable space layer */}
        <AnimatePresence>
          {layers.viable && (
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              x={x + 2}
              y={y + 2}
              width={w - 4}
              height={h - 4}
              fill={building.spatialScore >= 70 ? '#10b981' : building.spatialScore >= 50 ? '#f59e0b' : '#ef4444'}
              fillOpacity={0.12}
              rx={2}
            />
          )}
        </AnimatePresence>

        {/* Daylight reach from all edges */}
        <AnimatePresence>
          {layers.daylight && (
            <g>
              {/* Top edge daylight */}
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                exit={{ opacity: 0 }}
                x={x}
                y={y}
                width={w}
                height={daylightReach}
                fill="url(#daylightTop)"
              />
              {/* Bottom edge daylight */}
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                exit={{ opacity: 0 }}
                x={x}
                y={y + h - daylightReach}
                width={w}
                height={daylightReach}
                fill="url(#daylightBottom)"
              />
              {/* Left edge daylight */}
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                exit={{ opacity: 0 }}
                x={x}
                y={y}
                width={daylightReach}
                height={h}
                fill="url(#daylightLeft)"
              />
              {/* Right edge daylight */}
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                exit={{ opacity: 0 }}
                x={x + w - daylightReach}
                y={y}
                width={daylightReach}
                height={h}
                fill="url(#daylightRight)"
              />
            </g>
          )}
        </AnimatePresence>

        {/* Dead zones (center areas far from windows) */}
        <AnimatePresence>
          {layers.deadZones && hasDeadZones && (
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              x={x + daylightReach + 10}
              y={y + daylightReach + 10}
              width={w - (daylightReach + 10) * 2}
              height={h - (daylightReach + 10) * 2}
              fill="#ef4444"
              rx={4}
            />
          )}
        </AnimatePresence>

        {/* Core */}
        <AnimatePresence>
          {layers.core && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect
                x={coreX}
                y={coreY}
                width={coreW}
                height={coreH}
                fill="#475569"
                rx={3}
              />
              <text
                x={coreX + coreW / 2}
                y={coreY + coreH / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={11}
                fontWeight={600}
              >
                CORE
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Dimension labels */}
        <text x={x + w / 2} y={y - 10} textAnchor="middle" fill="#64748b" fontSize={11} fontWeight={500}>
          {width} ft
        </text>
        <text
          x={x + w + 15}
          y={y + h / 2}
          textAnchor="middle"
          fill="#64748b"
          fontSize={11}
          fontWeight={500}
          transform={`rotate(90, ${x + w + 15}, ${y + h / 2})`}
        >
          {depth} ft
        </text>

        {/* Courtyard label */}
        {shape === 'courtyard' && (
          <text x={courtyardX + courtyardW / 2} y={courtyardY + courtyardH / 2} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize={9}>
            LIGHT WELL
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Floor Plate Analysis</h3>
        <div className="flex gap-2">
          {[
            { key: 'viable', label: 'Viable Space', color: building.spatialScore >= 70 ? 'bg-emerald-500' : building.spatialScore >= 50 ? 'bg-amber-500' : 'bg-red-500' },
            { key: 'deadZones', label: 'Dead Zones', color: 'bg-red-500' },
            { key: 'daylight', label: 'Daylight', color: 'bg-blue-500' },
            { key: 'core', label: 'Core', color: 'bg-slate-500' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                layers[key] ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${color} ${layers[key] ? 'opacity-100' : 'opacity-30'}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center bg-slate-50 rounded-lg p-6">
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
          <defs>
            <linearGradient id="daylightTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="daylightBottom" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="daylightLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="daylightRight" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {renderFloorPlate()}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Floor Plate</p>
          <p className="font-semibold text-slate-700">{(width * depth).toLocaleString()} SF</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Max Depth</p>
          <p className={`font-semibold ${depth > 90 ? 'text-red-600' : depth > 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {depth} ft
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Core-to-Window</p>
          <p className={`font-semibold ${depth/2 - 15 > 45 ? 'text-red-600' : depth/2 - 15 > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {Math.round(depth / 2 - 15)} ft avg
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Shape</p>
          <p className="font-semibold text-slate-700 capitalize">{shape || 'Rectangle'}</p>
        </div>
      </div>
    </div>
  );
}
