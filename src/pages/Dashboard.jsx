import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockBuildings, getScoreColor } from '../data/mockBuildings';
import { Card, Badge } from '../components/common';

function StatCard({ label, value, subtext }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
}

function PropertyCard({ building, index }) {
  const recColors = {
    go: 'success',
    caution: 'warning',
    nogo: 'danger',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card hover className="overflow-hidden">
        <div className="h-36 bg-slate-200 relative overflow-hidden">
          <img 
            src={building.image} 
            alt={building.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 items-center justify-center text-4xl opacity-30 hidden">
            🏢
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant={recColors[building.recommendation]}>
              {building.recommendation === 'go' ? 'Proceed' : building.recommendation === 'caution' ? 'Caution' : 'No-Go'}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-800 truncate">{building.name}</h3>
          <p className="text-sm text-slate-500 mb-3">{building.neighborhood}</p>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Spatial Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(building.spatialScore)}`}>
                {building.spatialScore}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="text-center">
                <p className="text-xs text-slate-400">Day</p>
                <p className={`text-sm font-semibold ${getScoreColor(building.daylightScore)}`}>
                  {building.daylightScore}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Eff</p>
                <p className={`text-sm font-semibold ${getScoreColor(building.efficiencyScore)}`}>
                  {building.efficiencyScore}
                </p>
              </div>
            </div>
          </div>

          <Link
            to={`/analysis/${building.id}`}
            className="mt-4 block w-full text-center py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
          >
            View Analysis →
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const avgScore = Math.round(mockBuildings.reduce((a, b) => a + b.spatialScore, 0) / mockBuildings.length);
  const flagged = mockBuildings.filter(b => b.riskFlags.length > 0).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Property Pipeline</h1>
        <p className="text-slate-500">Spatial feasibility analysis for adaptive reuse candidates</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Buildings Analyzed" value={mockBuildings.length} />
        <StatCard label="Average Score" value={avgScore} subtext="Spatial feasibility" />
        <StatCard label="Flagged" value={flagged} subtext="Require attention" />
        <StatCard label="Ready to Proceed" value={mockBuildings.filter(b => b.recommendation === 'go').length} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {mockBuildings.map((building, i) => (
          <PropertyCard key={building.id} building={building} index={i} />
        ))}
      </div>
    </div>
  );
}
