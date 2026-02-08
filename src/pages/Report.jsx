import { useParams, Link } from 'react-router-dom';
import { getBuildingById } from '../data/mockBuildings';
import { Button } from '../components/common';

export default function Report() {
  const { id } = useParams();
  const building = getBuildingById(id);

  if (!building) return <div>Building not found</div>;

  const handleDownload = () => {
    alert('PDF export coming soon! This is a mockup demonstration.');
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return 'Strong';
    if (score >= 55) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to={`/analysis/${building.id}`} className="text-sm text-primary-600 hover:underline">
          ← Back to Analysis
        </Link>
        <Button onClick={handleDownload}>Download PDF</Button>
      </div>

      {/* Report document */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-10 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                <span className="text-primary-400">P</span>lenum
              </h1>
              <p className="text-slate-400 text-sm">Spatial Intelligence Platform</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-400">Report Generated</p>
              <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="px-10 py-8 border-b border-slate-200">
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Spatial Feasibility Report</p>
          <h2 className="text-3xl font-bold text-slate-800">{building.name}</h2>
          <p className="text-slate-500 mt-1">{building.address} • {building.neighborhood}, New York</p>
        </div>

        {/* Executive Summary */}
        <div className="px-10 py-8 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Executive Summary</h3>
          <div className={`rounded-lg p-4 ${
            building.recommendation === 'go' ? 'bg-emerald-50' : 
            building.recommendation === 'caution' ? 'bg-amber-50' : 'bg-red-50'
          }`}>
            <p className="font-semibold text-lg mb-2">
              {building.recommendation === 'go' ? '✅ Recommended for Conversion' :
               building.recommendation === 'caution' ? '⚠️ Proceed with Caution' : '❌ Not Recommended'}
            </p>
            <p className="text-sm text-slate-600">
              Based on spatial analysis, this property {building.recommendation === 'go' ? 'demonstrates strong' : 'shows moderate'} feasibility 
              for adaptive reuse conversion. The overall Spatial Feasibility Score of {building.spatialScore} indicates 
              {building.spatialScore >= 75 ? ' favorable' : ' acceptable'} conditions for residential conversion.
            </p>
          </div>
        </div>

        {/* Scores Table */}
        <div className="px-10 py-8 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Feasibility Scores</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 text-sm font-medium text-slate-500">Metric</th>
                <th className="text-center py-3 text-sm font-medium text-slate-500">Score</th>
                <th className="text-center py-3 text-sm font-medium text-slate-500">Rating</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Spatial Feasibility (Overall)', score: building.spatialScore },
                { label: 'Daylight Viability', score: building.daylightScore },
                { label: 'Efficiency Score', score: building.efficiencyScore },
                { label: 'Geometry Score', score: building.geometryScore },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 text-sm">{row.label}</td>
                  <td className="py-3 text-center">
                    <span className={`font-bold ${
                      row.score >= 75 ? 'text-emerald-600' : 
                      row.score >= 55 ? 'text-amber-600' : 'text-red-600'
                    }`}>{row.score}</span>
                  </td>
                  <td className="py-3 text-center text-sm text-slate-500">{getScoreLabel(row.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Building Info */}
        <div className="px-10 py-8 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Property Information</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Year Built</span>
              <span>{building.yearBuilt}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Number of Floors</span>
              <span>{building.floors}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Total Area</span>
              <span>{building.sqft.toLocaleString()} SF</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Typical Floor Plate</span>
              <span>{(building.floorPlate.width * building.floorPlate.depth).toLocaleString()} SF</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Floor Plate Depth</span>
              <span>{building.floorPlate.depth} ft</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Original Use</span>
              <span>{building.originalUse}</span>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="px-10 py-8 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Findings</h3>
          <div className="space-y-3">
            {building.findings.map((finding, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span>
                  {finding.type === 'positive' ? '✅' : finding.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <p className="text-slate-600">{finding.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50">
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>Disclaimer:</strong> This report is generated by Plenum's AI-powered spatial analysis system and is intended 
            for preliminary screening purposes only. Results should not be considered a substitute for professional architectural, 
            engineering, or legal review. Plenum makes no warranties regarding the accuracy or completeness of this analysis. 
            Users should conduct independent due diligence before making investment decisions.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Report ID: PLN-{building.id.toUpperCase()}-{Date.now().toString(36).toUpperCase()} • 
            Analysis Date: {building.analysisDate} • 
            © 2026 Plenum Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
