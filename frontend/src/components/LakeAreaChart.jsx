import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { TrendingUp, Info } from 'lucide-react';

export default function LakeAreaChart({ observations, lakeName }) {
  const [activeMetric, setActiveMetric] = useState('area'); // 'area', 'backscatter', 'expansion'

  if (!observations || observations.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-sm">
        No observation records available for time-series rendering.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = observations.map((obs) => ({
    date: obs.timestamp.split('T')[0],
    area_km2: obs.area_km2,
    expansion_pct: obs.expansion_percentage_from_baseline,
    backscatter_db: obs.mean_backscatter_vv_db > -900 ? obs.mean_backscatter_vv_db : null,
    coherence: obs.coherence_index,
    sensor: obs.sensor
  }));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl">
      {/* Header and Metric Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div>
          <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Multi-Temporal Satellite Observations: {lakeName}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sentinel-1 SAR C-Band IW GRD & Sentinel-2 MSI cross-series
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveMetric('area')}
            className={`px-2.5 py-1 rounded cursor-pointer transition ${
              activeMetric === 'area'
                ? 'bg-cyan-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Surface Area (km²)
          </button>
          <button
            onClick={() => setActiveMetric('expansion')}
            className={`px-2.5 py-1 rounded cursor-pointer transition ${
              activeMetric === 'expansion'
                ? 'bg-cyan-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expansion Rate (%)
          </button>
          <button
            onClick={() => setActiveMetric('backscatter')}
            className={`px-2.5 py-1 rounded cursor-pointer transition ${
              activeMetric === 'backscatter'
                ? 'bg-cyan-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SAR Backscatter (dB)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'area' && (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['dataMin - 0.1', 'dataMax + 0.1']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val) => [`${val} km²`, 'Surface Area']}
              />
              <Area type="monotone" dataKey="area_km2" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGradient)" name="Lake Extent (km²)" />
            </AreaChart>
          )}

          {activeMetric === 'expansion' && (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val) => [`+${val}%`, 'Expansion from Baseline']}
              />
              <Line type="monotone" dataKey="expansion_pct" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} name="Expansion %" />
            </LineChart>
          )}

          {activeMetric === 'backscatter' && (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[-24, -14]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                formatter={(val) => val ? [`${val} dB`, 'VV Polarized Backscatter'] : ['N/A (Optical Pass)', 'Sensor']}
              />
              <Line type="monotone" dataKey="backscatter_db" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} name="SAR VV Backscatter (dB)" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Scientific Caution */}
      <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Speculum water reflects radar pulses away from sensor, creating characteristically low backscatter (&lt; -17.5 dB).</span>
        </span>
        <span className="text-slate-500 font-mono">Temporal Revisit: 6-12 Days</span>
      </div>
    </div>
  );
}
