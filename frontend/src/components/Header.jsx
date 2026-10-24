import React from 'react';
import { Waves, Satellite, AlertTriangle, Activity, RefreshCw } from 'lucide-react';

export default function Header({ systemStatus, activeTab, setActiveTab, onOpenScanModal, alertsCount }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      {/* Top Banner Disclaimer */}
      <div className="bg-amber-950/70 border-b border-amber-900/60 px-4 py-1 text-xs text-amber-300/90 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>RESEARCH & DECISION SUPPORT PROTOCOL:</strong> All GLOF hazard indicators are automated provisional remote sensing metrics. Lake-area change alone is unvalidated for civil warning without glaciological ground-truth.
          </span>
        </div>
        <span className="hidden md:inline bg-amber-900/50 text-amber-200 px-2 py-0.5 rounded text-[10px] font-mono border border-amber-700/50">
          PROVISIONAL / NOT A CIVIL BROADCAST
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo and Titles */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-md shadow-cyan-900/40">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                JAL SANKET
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold font-mono">
                v2.0 SAR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Himalayan Glacial Lake Outburst Flood (GLOF) Early-Warning Decision Support
            </p>
          </div>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Data Mode Indicator */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">SAR Mode:</span>
            <span className="font-medium text-emerald-400">
              {systemStatus?.data_mode === 'LIVE_SENTINEL_1' ? 'Live Sentinel-1' : 'Synthetic Fallback'}
            </span>
          </div>

          {/* Active Alerts Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Active Alerts:</span>
            <span className="font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800/50">
              {alertsCount ?? 3}
            </span>
          </div>

          {/* Trigger Scan Button */}
          <button
            onClick={onOpenScanModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition shadow-sm hover:shadow-cyan-900/50 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
            <span>Trigger SAR Scan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 border-t border-slate-800/60 text-xs overflow-x-auto">
        {[
          { id: 'map', label: 'GIS Explorer & Map' },
          { id: 'analytics', label: 'Deep Lake Analytics' },
          { id: 'alerts', label: 'Alert Center & Safety' },
          { id: 'pipeline', label: 'Satellite Ingestion Jobs' },
          { id: 'research', label: 'Research & Literature Review' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
