import React from 'react';
import { PlayCircle, CheckCircle, RefreshCw, Satellite } from 'lucide-react';

export default function JobsPipeline({ jobs, onTriggerNewJob }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span>Sentinel-1 SAR Satellite Processing Queue</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated synthetic aperture radar calibration, Lee speckle filtering, and lake boundary extraction jobs
          </p>
        </div>

        <button
          onClick={onTriggerNewJob}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition cursor-pointer text-xs"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Dispatch Ingestion Job</span>
        </button>
      </div>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No active or completed jobs.</div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-cyan-400 font-semibold">{job.id}</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-200 font-medium">{job.job_type}</span>
                  <span className="text-slate-500 font-mono text-[11px]">({job.lake_id})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Started: {job.started_at.split('T')[1]?.replace('Z', '') || job.started_at}
                  </span>
                  {job.status === 'COMPLETED' ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3" />
                      <span>COMPLETED</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-[10px] font-bold animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>RUNNING</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    job.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${job.progress_percent}%` }}
                ></div>
              </div>

              {job.output_summary && (
                <p className="text-[11px] text-slate-300 font-mono bg-slate-900/60 p-2 rounded border border-slate-800/80">
                  {job.output_summary}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
