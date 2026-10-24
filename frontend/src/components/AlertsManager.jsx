import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import { acknowledgeAlert } from '../api';

export default function AlertsManager({ alerts, onAlertUpdated }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewerName, setReviewerName] = useState('');
  const [validationStatus, setValidationStatus] = useState('CONFIRMED_BY_GLACIOLOGIST');
  const [submitting, setSubmitting] = useState(false);

  const handleAcknowledge = async (e) => {
    e.preventDefault();
    if (!selectedAlert || !reviewerName) return;
    setSubmitting(true);
    try {
      await acknowledgeAlert(selectedAlert.id, reviewerName, validationStatus);
      setSelectedAlert(null);
      setReviewerName('');
      if (onAlertUpdated) onAlertUpdated();
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
      alert('Failed to update alert acknowledgement');
    } finally {
      setSubmitting(false);
    }
  };

  const getAlertStyle = (level) => {
    switch (level) {
      case 'WARNING':
        return {
          border: 'border-red-900/60 bg-red-950/20',
          badge: 'bg-red-950 text-red-300 border-red-700/60',
          icon: <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
        };
      case 'WATCH':
        return {
          border: 'border-orange-900/60 bg-orange-950/20',
          badge: 'bg-orange-950 text-orange-300 border-orange-700/60',
          icon: <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
        };
      default:
        return {
          border: 'border-yellow-900/60 bg-yellow-950/20',
          badge: 'bg-yellow-950 text-yellow-300 border-yellow-700/60',
          icon: <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Safety Protocol Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-900/40 shadow-xl flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-amber-300">Mandatory Scientific Safety & Verification Protocol</h4>
          <p className="text-slate-300 leading-relaxed">
            All hazard levels in Jal Sanket are <strong>automated provisional remote sensing indicators</strong>.
            Satellite revisit cycles (6–12 days), radar layover shadows, and wet-snow speckle can produce false anomalies.
            Per project safety standards, <strong>no public evacuation or emergency warnings may be broadcast</strong> without
            human-in-the-loop validation by an accredited glaciologist or the National Disaster Management Authority.
          </p>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const style = getAlertStyle(alert.level);
          return (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 transition shadow-lg ${style.border} ${
                alert.acknowledged ? 'opacity-80' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800/80 gap-2">
                <div className="flex items-center space-x-2.5">
                  {style.icon}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100 text-sm">{alert.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${style.badge}`}>
                        {alert.level}
                      </span>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold">{alert.lake_name}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {alert.created_at.replace('T', ' ').replace('Z', '')}
                  </span>
                  {alert.acknowledged ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>ACKNOWLEDGED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition cursor-pointer text-[11px]"
                    >
                      Acknowledge & Validate
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {alert.description}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center space-x-3">
                  <span>Composite Hazard: <strong className="text-cyan-400 font-mono">{alert.composite_score}/100</strong></span>
                  <span>Validation: <strong className="text-slate-200 font-mono">{alert.validation_status}</strong></span>
                </div>
                {alert.expert_reviewer && (
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <UserCheck className="w-3 h-3" />
                    <span>Reviewer: {alert.expert_reviewer}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Acknowledge Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Expert Reviewer Sign-Off</span>
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAcknowledge} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Alert:</label>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-200 font-medium">
                  {selectedAlert.title} ({selectedAlert.lake_name})
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reviewing Scientist / Glaciologist Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Anil Kulkarni (IISc) / DGM Officer"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Validation Determination:</label>
                <select
                  value={validationStatus}
                  onChange={(e) => setValidationStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="CONFIRMED_BY_GLACIOLOGIST">CONFIRMED_BY_GLACIOLOGIST (Elevate to State Control Room)</option>
                  <option value="FIELD_EXPEDITION_REQUIRED">FIELD_EXPEDITION_REQUIRED (Drone / In-Situ Inspection)</option>
                  <option value="FALSE_POSITIVE_WET_SNOW">FALSE_POSITIVE_WET_SNOW (Demote alert)</option>
                  <option value="FALSE_POSITIVE_TERRAIN_SHADOW">FALSE_POSITIVE_TERRAIN_SHADOW (Re-evaluate next pass)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Submit Sign-Off'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
