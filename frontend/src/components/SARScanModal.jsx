import React, { useState } from 'react';
import { Satellite, Play, X, RefreshCw } from 'lucide-react';
import { triggerSARJob } from '../api';

export default function SARScanModal({ isOpen, onClose, lakes, onJobTriggered }) {
  const [selectedLakeId, setSelectedLakeId] = useState(lakes[0]?.id || 'lake-south-lhonak');
  const [orbit, setOrbit] = useState('Ascending');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await triggerSARJob(selectedLakeId, orbit);
      if (onJobTriggered) onJobTriggered();
      onClose();
    } catch (err) {
      console.error('Failed to trigger scan', err);
      alert('Failed to trigger SAR scan job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span>Dispatch Sentinel-1 SAR Acquisition Job</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Target Glacial Lake:</label>
            <select
              value={selectedLakeId}
              onChange={(e) => setSelectedLakeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {lakes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.region}) &mdash; {l.elevation_m}m ASL
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Satellite Orbit Direction:</label>
            <select
              value={orbit}
              onChange={(e) => setOrbit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Ascending">Ascending (Dusk Pass ~18:00 UTC)</option>
              <option value="Descending">Descending (Dawn Pass ~06:00 UTC)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Multi-orbit fusion mitigates radar foreshortening and terrain shadow along steep north-facing Himalayan ridges.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-cyan-400 font-semibold block">Processing Workflow:</span>
            <span>1. C-Band GRD Amplitude & Intensity calibration</span><br/>
            <span>2. 5x5 Refined Lee Speckle Filtering</span><br/>
            <span>3. Otsu Adaptive Water Backscatter Thresholding (&lt; -17.5 dB)</span><br/>
            <span>4. Coherence and Lake Delineation Update</span>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Scan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
