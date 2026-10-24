import React, { useState } from 'react';
import { Satellite, CheckCircle, AlertTriangle, Download } from 'lucide-react';

export default function ObservationsTable({ observations, lakeName }) {
  const [filterSensor, setFilterSensor] = useState('ALL');

  if (!observations || observations.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 text-sm">
        No satellite observation passes recorded for this lake yet.
      </div>
    );
  }

  const filtered = observations.filter((obs) => {
    if (filterSensor === 'SAR') return obs.sensor.includes('Sentinel-1');
    if (filterSensor === 'OPTICAL') return obs.sensor.includes('Sentinel-2');
    return true;
  });

  const getQABadge = (flag) => {
    if (flag === 'PASS') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
          <CheckCircle className="w-3 h-3" />
          <span>PASS</span>
        </span>
      );
    }
    if (flag === 'TERRAIN_SHADOW_CAUTION') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/50">
          <AlertTriangle className="w-3 h-3" />
          <span>SHADOW CAUTION</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-950/80 text-purple-300 border border-purple-800/50">
        <AlertTriangle className="w-3 h-3" />
        <span>WET SNOW SUSPECT</span>
      </span>
    );
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Sensor', 'Orbit', 'Area_km2', 'Expansion_pct', 'VV_Backscatter_dB', 'Coherence', 'QA_Flag'];
    const rows = filtered.map(o => [
      o.timestamp,
      `"${o.sensor}"`,
      o.orbit_direction,
      o.area_km2,
      o.expansion_percentage_from_baseline,
      o.mean_backscatter_vv_db,
      o.coherence_index,
      o.qa_flag
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${lakeName}_observations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
      {/* Table Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
        <div>
          <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span>Satellite Observation History: {lakeName}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {filtered.length} multi-temporal acquisitions
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {/* Sensor Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterSensor('ALL')}
              className={`px-2 py-0.5 rounded cursor-pointer ${filterSensor === 'ALL' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400'}`}
            >
              All Sensors
            </button>
            <button
              onClick={() => setFilterSensor('SAR')}
              className={`px-2 py-0.5 rounded cursor-pointer ${filterSensor === 'SAR' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400'}`}
            >
              Sentinel-1 SAR
            </button>
            <button
              onClick={() => setFilterSensor('OPTICAL')}
              className={`px-2 py-0.5 rounded cursor-pointer ${filterSensor === 'OPTICAL' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400'}`}
            >
              Sentinel-2 MSI
            </button>
          </div>

          {/* Export button */}
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Acquisition Date</th>
              <th className="py-2.5 px-3">Sensor & Orbit</th>
              <th className="py-2.5 px-3 text-right">Extracted Area</th>
              <th className="py-2.5 px-3 text-right">Expansion %</th>
              <th className="py-2.5 px-3 text-right">VV Backscatter</th>
              <th className="py-2.5 px-3 text-right">Coherence</th>
              <th className="py-2.5 px-3 text-center">Quality Flag</th>
              <th className="py-2.5 px-3 text-center">Source Tag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((obs) => (
              <tr key={obs.id} className="hover:bg-slate-800/40 transition">
                <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">
                  {obs.timestamp.replace('T', ' ').replace('Z', '')}
                </td>
                <td className="py-2.5 px-3 font-sans">
                  <span className="text-cyan-300">{obs.sensor.split(' ')[0]}</span>
                  <span className="text-slate-500 text-[11px] block">{obs.orbit_direction} ({obs.polarization})</span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                  {obs.area_km2} km²
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className={obs.expansion_percentage_from_baseline > 20 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    +{obs.expansion_percentage_from_baseline}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-slate-300">
                  {obs.mean_backscatter_vv_db > -900 ? `${obs.mean_backscatter_vv_db} dB` : <span className="text-slate-600 font-sans">Optical</span>}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-400">
                  {obs.coherence_index.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-center font-sans">
                  {getQABadge(obs.qa_flag)}
                </td>
                <td className="py-2.5 px-3 text-center font-sans">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {obs.data_source === 'LIVE_SENTINEL_1' ? 'LIVE' : 'SYNTH/HIST'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
