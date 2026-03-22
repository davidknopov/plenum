import { motion } from 'framer-motion';
import BuildingSummary from './BuildingSummary';
import ScoreRing from './ScoreRing';
import ScoreExplainer from './ScoreExplainer';
import GeometryFlags from './GeometryFlags';
import {
  spatialLabel, daylightLabel, efficiencyLabel,
  explainSpatial, explainDaylight, explainEfficiency,
  geometryFlags, recommendation, scoreColor,
} from '../../scoring/engine';
import { mlPredict } from '../../scoring/mlPredict';

export default function ReportPanel({ pluto, scores, compact = false }) {
  const flags = geometryFlags(pluto, scores.daylight, scores.efficiency);
  const ml = mlPredict(pluto);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 report-area"
    >
      <BuildingSummary pluto={pluto} />

      {/* ML Prediction */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#d6d0c4', background: '#faf9f6' }}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold" style={{ color: '#1A4D2E' }}>ML Conversion Prediction</h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f7f1', color: '#1A4D2E' }}>
            Trained on 96 NYC buildings
          </span>
        </div>
        <div className="flex items-center gap-6">
          <ScoreRing score={ml.score} label="ML Score" interpretation={ml.label} size={compact ? 90 : 110} />
          <div className="flex-1">
            <p className="text-xs font-medium mb-2" style={{ color: '#6b7c6e' }}>Top factors driving this prediction:</p>
            <div className="space-y-1.5">
              {ml.drivers.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full" style={{ width: `${d.weight * 300}px`, background: scoreColor(ml.score), minWidth: 8 }} />
                  <span className="text-xs" style={{ color: '#334155' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
              ['Office Area', pluto.officearea ? `${pluto.officearea.toLocaleString()} sf` : '—'],
              ['Res Area', pluto.resarea ? `${pluto.resarea.toLocaleString()} sf` : '—'],
              ['Zoning', pluto.zonedist1 || '—'],
              ['Bldg Class', pluto.bldgclass || '—'],
              ['Landmark', pluto.landmark || '—'],
              ['Historic Dist', pluto.histdist || '—'],
              ['Flood Zone', pluto.pfirm15_flag === 'Y' ? 'Yes' : 'No'],
              ['Irregular Lot', (pluto.irrlotcode && pluto.irrlotcode !== '0') ? 'Yes' : 'No'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b" style={{ borderColor: '#e8e4df' }}>
                <span style={{ color: '#6b7c6e' }}>{k}</span>
                <span className="font-medium" style={{ color: '#1A4D2E' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rule-based Scores */}
      <div className="rounded-xl border p-5" style={{ borderColor: '#d6d0c4', background: '#faf9f6' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#1A4D2E' }}>Rule-Based Feasibility Scores</h3>
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

      <GeometryFlags flags={flags} />

      {/* Recommendation — use ML score for the primary recommendation */}
      <div className="rounded-xl border p-4" style={{ borderColor: '#d6d0c4', background: '#f0f7f1' }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: '#1A4D2E' }}>Recommended Next Steps</h3>
        <p className="text-xs leading-relaxed" style={{ color: '#334155' }}>
          {recommendation(ml.score)}
        </p>
      </div>
    </motion.div>
  );
}
