import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockBuildings, getScoreColor } from '../data/mockBuildings';
import { Card, Badge } from '../components/common';

function StatCard({ label, value, subtext }) {
  return (
    <div className="rounded-xl p-4 md:p-5 border" style={{ background: '#faf9f6', borderColor: '#d6d0c4' }}>
      <p className="text-sm mb-1" style={{ color: '#6b7c6e' }}>{label}</p>
      <p className="text-2xl md:text-3xl font-bold" style={{ color: '#1A4D2E' }}>{value}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{subtext}</p>}
    </div>
  );
}

function PropertyCard({ building, index }) {
  const recColors = { go: 'success', caution: 'warning', nogo: 'danger' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card hover className="overflow-hidden">
        <div className="h-32 md:h-36 bg-slate-200 relative overflow-hidden">
          <img
            src={building.image}
            alt={building.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="absolute inset-0 items-center justify-center text-4xl opacity-30 hidden">🏢</div>
          <div className="absolute top-2 right-2 md:top-3 md:right-3">
            <Badge variant={recColors[building.recommendation]}>
              {building.recommendation === 'go' ? 'Proceed' : building.recommendation === 'caution' ? 'Caution' : 'No-Go'}
            </Badge>
          </div>
        </div>
        <div className="p-3 md:p-4">
          <h3 className="font-semibold truncate text-sm md:text-base" style={{ color: '#1A4D2E' }}>{building.name}</h3>
          <p className="text-xs md:text-sm mb-2 md:mb-3" style={{ color: '#6b7c6e' }}>{building.neighborhood}</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>Spatial Score</p>
              <p className={`text-2xl md:text-3xl font-bold ${getScoreColor(building.spatialScore)}`}>{building.spatialScore}</p>
            </div>
            <div className="flex gap-2">
              <div className="text-center">
                <p className="text-xs" style={{ color: '#94a3b8' }}>Day</p>
                <p className={`text-xs md:text-sm font-semibold ${getScoreColor(building.daylightScore)}`}>{building.daylightScore}</p>
              </div>
              <div className="text-center">
                <p className="text-xs" style={{ color: '#94a3b8' }}>Eff</p>
                <p className={`text-xs md:text-sm font-semibold ${getScoreColor(building.efficiencyScore)}`}>{building.efficiencyScore}</p>
              </div>
            </div>
          </div>
          <Link
            to={`/analysis/${building.id}`}
            className="mt-3 md:mt-4 block w-full text-center py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
            style={{ background: '#f0f7f1', color: '#1A4D2E' }}
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
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1A4D2E' }}>Property Pipeline</h1>
        <p className="text-sm md:text-base" style={{ color: '#6b7c6e' }}>Spatial feasibility analysis for adaptive reuse candidates</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard label="Buildings Analyzed" value={mockBuildings.length} />
        <StatCard label="Average Score" value={avgScore} subtext="Spatial feasibility" />
        <StatCard label="Flagged" value={flagged} subtext="Require attention" />
        <StatCard label="Ready to Proceed" value={mockBuildings.filter(b => b.recommendation === 'go').length} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {mockBuildings.map((building, i) => (
          <PropertyCard key={building.id} building={building} index={i} />
        ))}
      </div>
    </div>
  );
}
