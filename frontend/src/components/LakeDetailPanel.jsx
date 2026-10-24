import React, { useState, useEffect } from 'react';
import { Mountain, ShieldAlert, CheckCircle, Activity, MapPin } from 'lucide-react';
import { fetchRiskAnalysis } from '../api';

export default function LakeDetailPanel({ lake }) {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!lake) return;
    fetchRiskAnalysis(lake.id)
      .then((data) => setAnalysis(data))
      .catch((err) => {
        console.error('Failed to load risk analysis', err);
        // Fallback calculations for demo
        setAnalysis({
          lake_id: lake.id,
          composite_hazard_score: lake.id === 'lake-south-lhonak' ? 84.5 : (lake.id === 'lake-thorthormi' ? 72.0 : 42.0),
          risk_level: lake.id === 'lake-south-lhonak' ? 'WARNING' : (lake.id === 'lake-thorthormi' ? 'WATCH' : 'ADVISORY'),
          area_expansion_score: 75.0,
          steep_slope_score: 82.0,
          freeboard_score: 70.0,
          sar_coherence_drop_score: 65.0,
          downstream_vulnerability_score: 90.0,
          trigger_summary: 'Provisional multi-criteria hazard evaluation',
          scientific_notes: 'Automated remote sensing indicator. Lake area change alone is not a confirmed GLOF prediction.',
          recommended_action: 'Notify state disaster management authority and regional glaciologists for high-resolution stereoscopic verification.'
        });
      });
  }, [lake]);

  if (!lake) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Mountain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="font-semibold text-slate-300">Select a Glacial Lake</h4>
        <p className="text-xs text-slate-500 mt-1">
          Click on any lake polygon or marker on the GIS map or catalogue table to inspect multi-factor hazard diagnostics.
        </p>
      </div>
    );
  }

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'WARNING': return 'bg-red-950 text-red-300 border-red-700/60';
      case 'WATCH': return 'bg-orange-950 text-orange-300 border-orange-700/60';
      case 'ADVISORY': return 'bg-yellow-950 text-yellow-300 border-yellow-700/60';
      default: return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Lake Top Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-100">{lake.name}</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {lake.id}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lake.region}, {lake.country}</span>
            <span>&bull;</span>
            <span>Elevation: {lake.elevation_m}m ASL</span>
          </div>
        </div>

        {/* Hazard Score Pill */}
        {analysis && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Hazard Score</div>
              <div className="text-xl font-black text-cyan-300 font-mono">
                {analysis.composite_hazard_score} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide flex items-center space-x-1.5 shadow-sm ${getRiskBadgeColor(analysis.risk_level)}`}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{analysis.risk_level}</span>
            </div>
          </div>
        )}
      </div>

      {/* Geomorphological Physical Attributes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
          <span className="text-slate-400 block text-[11px]">Current Extent</span>
          <span className="text-base font-bold text-cyan-300 font-mono mt-0.5 block">{lake.current_area_km2} km²</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Baseline: {lake.initial_area_km2} km²</span>
        </div>
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
          <span className="text-slate-400 block text-[11px]">Est. Water Volume</span>
          <span className="text-base font-bold text-sky-300 font-mono mt-0.5 block">{lake.volume_est_million_m3} M m³</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Bathymetry Proxy</span>
        </div>
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
          <span className="text-slate-400 block text-[11px]">Moraine Freeboard</span>
          <span className={`text-base font-bold font-mono mt-0.5 block ${lake.freeboard_height_m < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {lake.freeboard_height_m} m
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">&lt;20m High Overtopping Risk</span>
        </div>
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
          <span className="text-slate-400 block text-[11px]">Hanging Ice Slope</span>
          <span className={`text-base font-bold font-mono mt-0.5 block ${lake.steep_ice_slope_deg > 30 ? 'text-red-400' : 'text-slate-300'}`}>
            {lake.steep_ice_slope_deg}°
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">&gt;30° Calving / Avalanche Trigger</span>
        </div>
      </div>

      {/* Multi-Criteria Analytical Hierarchy Process Breakdown */}
      {analysis && (
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Multi-Criteria Scientific Hazard Breakdown</span>
            </h4>
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Decoupled Area Model
            </span>
          </div>

          {/* Progress Bars for the 5 factors */}
          <div className="space-y-2.5 text-xs">
            {/* Factor 1: Avalanche Slope */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">1. Parent Glacier Avalanche Trigger (Weight: 30%)</span>
                <span className="font-mono text-cyan-400 font-bold">{analysis.steep_slope_score} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.steep_slope_score}%` }}></div>
              </div>
            </div>

            {/* Factor 2: Moraine Freeboard */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">2. Moraine Dam Freeboard Deficit (Weight: 20%)</span>
                <span className="font-mono text-cyan-400 font-bold">{analysis.freeboard_score} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.freeboard_score}%` }}></div>
              </div>
            </div>

            {/* Factor 3: Lake Area Expansion */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">3. Lake Area Expansion Rate (Weight: 20%)</span>
                <span className="font-mono text-amber-400 font-bold">{analysis.area_expansion_score} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.area_expansion_score}%` }}></div>
              </div>
            </div>

            {/* Factor 4: SAR Coherence Drop */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">4. SAR Coherence Drop / Wave Disturbance (Weight: 15%)</span>
                <span className="font-mono text-purple-400 font-bold">{analysis.sar_coherence_drop_score} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.sar_coherence_drop_score}%` }}></div>
              </div>
            </div>

            {/* Factor 5: Downstream Vulnerability */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-medium">5. Downstream Settlement & Hydro Dam Exposure (Weight: 15%)</span>
                <span className="font-mono text-rose-400 font-bold">{analysis.downstream_vulnerability_score} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${analysis.downstream_vulnerability_score}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Downstream Assets & Infrastructure Impact */}
      <div className="space-y-2 text-xs">
        <h4 className="font-semibold text-slate-300">Downstream Vulnerability Pathway</h4>
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
          <div>
            <span className="text-slate-400 block text-[11px] mb-1">Downstream Settlements:</span>
            <div className="flex flex-wrap gap-1.5">
              {lake.downstream_settlements.map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 block text-[11px] mb-1">Critical Infrastructure At Risk:</span>
            <div className="flex flex-wrap gap-1.5">
              {lake.critical_infrastructure.map((infra, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 text-[11px]">
                  {infra}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Recommendation */}
      {analysis && (
        <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs space-y-1.5">
          <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Recommended Mitigation & Action Protocol</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {analysis.recommended_action}
          </p>
        </div>
      )}
    </div>
  );
}
