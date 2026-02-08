import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockBuildings } from '../data/mockBuildings';
import { useAnalysis } from '../hooks/useAnalysis';
import { Button, LoadingSpinner } from '../components/common';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 16, { duration: 0.5 });
  }, [center, map]);
  return null;
}

export default function NewAnalysis() {
  const [selected, setSelected] = useState(null);
  const [targetUse, setTargetUse] = useState('residential');
  const [riskPosture, setRiskPosture] = useState('moderate');
  const { isAnalyzing, stage, stageText, stagesTotal, runAnalysis } = useAnalysis();

  const building = selected ? mockBuildings.find(b => b.id === selected) : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          center={[40.7080, -74.0060]}
          zoom={14}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <MapController center={building?.coordinates} />
          {mockBuildings.map(b => (
            <Marker
              key={b.id}
              position={b.coordinates}
              eventHandlers={{ click: () => setSelected(b.id) }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-slate-500">{b.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Side panel */}
      <div className="w-96 flex flex-col">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">New Analysis</h2>

          {/* Building selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Building
            </label>
            <select
              value={selected || ''}
              onChange={e => setSelected(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Click map or select...</option>
              {mockBuildings.map(b => (
                <option key={b.id} value={b.id}>{b.address}</option>
              ))}
            </select>
          </div>

          <AnimatePresence mode="wait">
            {building && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Building info */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-slate-800">{building.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">{building.neighborhood}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-400">Built:</span> {building.yearBuilt}</div>
                    <div><span className="text-slate-400">Floors:</span> {building.floors}</div>
                    <div><span className="text-slate-400">Size:</span> {(building.sqft / 1000).toFixed(0)}K SF</div>
                    <div><span className="text-slate-400">Use:</span> {building.originalUse.split(' ')[0]}</div>
                  </div>
                </div>

                {/* Target use */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Use
                  </label>
                  <select
                    value={targetUse}
                    onChange={e => setTargetUse(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="residential">Residential</option>
                    <option value="senior">Senior Living</option>
                    <option value="hotel">Hotel</option>
                    <option value="student">Student Housing</option>
                  </select>
                </div>

                {/* Risk posture */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Risk Posture
                  </label>
                  <div className="flex gap-2">
                    {['conservative', 'moderate', 'aggressive'].map(p => (
                      <button
                        key={p}
                        onClick={() => setRiskPosture(p)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          riskPosture === p
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analyze button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => runAnalysis(building.id)}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Run Spatial Analysis'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!building && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-2">📍</p>
              <p>Select a building on the map to begin analysis</p>
            </div>
          )}
        </div>

        {/* Analysis progress */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium text-slate-700">{stageText}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stage / stagesTotal) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
