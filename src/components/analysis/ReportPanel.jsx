import { motion } from 'framer-motion';
import BuildingSummary from './BuildingSummary';
import ScoreRing from './ScoreRing';
import ScoreExplainer from './ScoreExplainer';
import GeometryFlags from './GeometryFlags';
import {
  spatialLabel, daylightLabel, efficiencyLabel,
  explainSpatial, explainDaylight, explainEfficiency,
  geometryFlags, recommendation,
} from '../../scoring/engine';

export default function ReportPanel({ pluto, scores, compact = false }) {
  const flags = geometryFlags(pluto, scores.daylight, scores.efficiency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 report-area"
    >
      <BuildingSummary pluto={pluto} />

      {/* PLUTO data */}
      {!compact && (
        <div className="rounded-xl border p-5" style={{ borderColor: '#d6d0c4', background: '#faf9f6' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1A4D2E' }}>PLUTO Parcel Data</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {[
              ['BBL', pluto.bbl],
              ['Owner', pluto.ownername || '—'],
              ['Year Built', pluto.yearbuilt || '—'],
              ['Floors', pluto.numfloors],
              ['Lot Area', `${pluto.lotarea.toLocaleString()} sf`],
              ['Bldg Area', `${pluto.bldgarea.toLocaleString()} sf`],
              ['Zoning', pluto.zonedist1 || '—'],
              ['Bldg Class', pluto.bldgclass || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b" style={{ borderColor: '#e8e4df' }}>
                <span style={{ color: '#6b7c6e' }}>{k}</span>
                <span className="font-medium" style={{ color: '#1A4D2E' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scores */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#d6d0c4', background: '#faf9f6' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#1A4D2E' }}>Feasibility Scores</h3>
        <div className={`flex flex-wrap justify-center ${compact ? 'gap-6' : 'gap-10'}`}>
          <ScoreRing score={scores.spatial} label="Spatial" interpretation={spatialLabel(scores.spatial)} size={compact ? 90 : 120} />
          <ScoreRing score={scores.daylight} label="Daylight" interpretation={daylightLabel(scores.daylight)} size={compact ? 90 : 120} />
          <ScoreRing score={scores.efficiency} label="Efficiency" interpretation={efficiencyLabel(scores.efficiency)} size={compact ? 90 : 120} />
        </div>
      </div>

      {/* Why this score? */}
      <div className="space-y-2">
        <ScoreExplainer title="Spatial Feasibility" score={scores.spatial} factors={explainSpatial(pluto)} />
        <ScoreExplainer title="Daylight Viability" score={scores.daylight} factors={explainDaylight(pluto)} />
        <ScoreExplainer title="Efficiency Risk" score={scores.efficiency} factors={explainEfficiency(pluto)} />
      </div>

      {/* Geometry flags */}
      <GeometryFlags flags={flags} />

      {/* Recommendation */}
      <div className="rounded-xl border p-4" style={{ borderColor: '#d6d0c4', background: '#f0f7f1' }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: '#1A4D2E' }}>Recommended Next Steps</h3>
        <p className="text-xs leading-relaxed" style={{ color: '#334155' }}>
          {recommendation(scores.spatial)}
        </p>
      </div>
    </motion.div>
  );
}
