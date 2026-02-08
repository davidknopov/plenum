import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBuildingById } from '../data/mockBuildings';
import { ScoreGauge, ScoreCard } from '../components/analysis/ScoreGauge';
import { FloorPlan } from '../components/analysis/FloorPlan';
import { Badge, Button } from '../components/common';

export default function PropertyAnalysis() {
  const { id } = useParams();
  const building = getBuildingById(id);

  if (!building) {
    return <div className="text-center py-12">Building not found</div>;
  }

  const recConfig = {
    go: { label: 'Proceed with Diligence', color: 'success', bg: 'bg-emerald-50 border-emerald-200' },
    caution: { label: 'Proceed with Caution', color: 'warning', bg: 'bg-amber-50 border-amber-200' },
    nogo: { label: 'Not Recommended', color: 'danger', bg: 'bg-red-50 border-red-200' },
  };
  const rec = recConfig[building.recommendation];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/" className="text-sm text-primary-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">{building.name}</h1>
          <p className="text-slate-500">{building.address} • {building.neighborhood}</p>
        </div>
        <Link to={`/report/${building.id}`}>
          <Button variant="secondary">View Report →</Button>
        </Link>
      </div>

      {/* Recommendation banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border mb-8 ${rec.bg}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={rec.color}>{rec.label}</Badge>
            <span className="text-sm text-slate-600">
              Based on spatial feasibility analysis • Analyzed {building.analysisDate}
            </span>
          </div>
          {building.riskFlags.length > 0 && (
            <div className="flex gap-2">
              {building.riskFlags.map((flag, i) => (
                <Badge key={i} variant="warning">{flag}</Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Scores */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center"
        >
          <p className="text-sm text-slate-500 mb-4">Spatial Feasibility</p>
          <ScoreGauge score={building.spatialScore} />
        </motion.div>
        <div className="col-span-3 grid grid-cols-3 gap-4">
          <ScoreCard label="Daylight Viability" score={building.daylightScore} icon="☀️" />
          <ScoreCard label="Efficiency Score" score={building.efficiencyScore} icon="📐" />
          <ScoreCard label="Geometry Score" score={building.geometryScore} icon="🔷" />
        </div>
      </div>

      {/* Floor plan */}
      <div className="mb-8">
        <FloorPlan building={building} />
      </div>

      {/* Findings */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Key Findings</h3>
          <div className="space-y-3">
            {building.findings.map((finding, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-lg">
                  {finding.type === 'positive' ? '✅' : finding.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <p className="text-sm text-slate-600">{finding.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Building Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Year Built</span>
              <span className="font-medium">{building.yearBuilt}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Floors</span>
              <span className="font-medium">{building.floors}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Total Area</span>
              <span className="font-medium">{building.sqft.toLocaleString()} SF</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Floor Plate</span>
              <span className="font-medium">{building.floorPlate.width} × {building.floorPlate.depth} ft</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Original Use</span>
              <span className="font-medium">{building.originalUse}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
