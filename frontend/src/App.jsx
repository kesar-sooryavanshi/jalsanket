import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GISMap from './components/GISMap';
import LakeDetailPanel from './components/LakeDetailPanel';
import LakeAreaChart from './components/LakeAreaChart';
import ObservationsTable from './components/ObservationsTable';
import AlertsManager from './components/AlertsManager';
import JobsPipeline from './components/JobsPipeline';
import ResearchViewer from './components/ResearchViewer';
import SARScanModal from './components/SARScanModal';
import {
  fetchLakes,
  fetchSystemStatus,
  fetchLakeObservations,
  fetchAlerts,
  fetchJobs
} from './api';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [lakes, setLakes] = useState([]);
  const [selectedLake, setSelectedLake] = useState(null);
  const [observations, setObservations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Load dataset
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lakesData, statusData, alertsData, jobsData] = await Promise.all([
        fetchLakes(),
        fetchSystemStatus(),
        fetchAlerts(),
        fetchJobs()
      ]);

      setLakes(lakesData);
      setSystemStatus(statusData);
      setAlerts(alertsData);
      setJobs(jobsData);

      // Default select South Lhonak or first lake
      const initialLake = lakesData.find(l => l.id === 'lake-south-lhonak') || lakesData[0];
      setSelectedLake(initialLake);

      if (initialLake) {
        const obsData = await fetchLakeObservations(initialLake.id);
        setObservations(obsData);
      }
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Unable to connect to Jal Sanket backend API. Ensure FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const [lakesData, statusData, alertsData, jobsData] = await Promise.all([
          fetchLakes(),
          fetchSystemStatus(),
          fetchAlerts(),
          fetchJobs()
        ]);
        if (ignore) return;
        setLakes(lakesData);
        setSystemStatus(statusData);
        setAlerts(alertsData);
        setJobs(jobsData);

        const initialLake = lakesData.find(l => l.id === 'lake-south-lhonak') || lakesData[0];
        setSelectedLake(initialLake);

        if (initialLake) {
          const obsData = await fetchLakeObservations(initialLake.id);
          if (!ignore) setObservations(obsData);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Initialization error:', err);
          setError('Unable to connect to Jal Sanket backend API. Ensure FastAPI server is running on port 8000.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // When selected lake changes, fetch its observations
  const handleSelectLake = async (lake) => {
    setSelectedLake(lake);
    try {
      const obs = await fetchLakeObservations(lake.id);
      setObservations(obs);
    } catch (err) {
      console.error('Failed to load observations for lake', err);
    }
  };

  const handleNavigateToAnalytics = (lake) => {
    handleSelectLake(lake);
    setActiveTab('analytics');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        systemStatus={systemStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        alertsCount={alerts.filter(a => !a.acknowledged).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">
              Connecting to Sentinel-1 SAR telemetry and Himalayan lake databases...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-medium cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* TAB 1: GIS Map & Overview */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                {/* Basin-wide Key Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-[11px] text-slate-400 uppercase font-mono block">Monitored Lakes</span>
                    <span className="text-2xl font-black text-cyan-300 font-mono mt-1 block">{lakes.length}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Sikkim, Nepal, Bhutan, HP, Kashmir</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-[11px] text-slate-400 uppercase font-mono block">Sensor Primary</span>
                    <span className="text-base font-bold text-slate-200 font-mono mt-1 block">Sentinel-1 SAR C-Band</span>
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">100% Cloud Penetration</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-[11px] text-slate-400 uppercase font-mono block">Active Hazard Warnings</span>
                    <span className="text-2xl font-black text-red-400 font-mono mt-1 block">1</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">South Lhonak Moraine Anomaly</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg">
                    <span className="text-[11px] text-slate-400 uppercase font-mono block">Observation Cadence</span>
                    <span className="text-base font-bold text-slate-200 font-mono mt-1 block">6 - 12 Days</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Ascending + Descending Passes</span>
                  </div>
                </div>

                {/* Main Interactive Leaflet GIS Map */}
                <GISMap
                  lakes={lakes}
                  selectedLake={selectedLake}
                  onSelectLake={handleSelectLake}
                  onNavigateToAnalytics={handleNavigateToAnalytics}
                />

                {/* Lake Quick Select Catalogue */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Himalayan Glacial Lake Registry (Click to Select)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {lakes.map((lake) => {
                      const isSelected = selectedLake?.id === lake.id;
                      return (
                        <div
                          key={lake.id}
                          onClick={() => handleSelectLake(lake)}
                          className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-100">{lake.name}</div>
                            <div className="text-[11px] text-slate-400">{lake.region}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-cyan-400 text-xs block">{lake.current_area_km2} km²</span>
                            <span className="text-[10px] text-slate-500">{lake.elevation_m}m</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Lake Overview & Chart */}
                {selectedLake && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <LakeDetailPanel lake={selectedLake} onOpenScanModal={() => setIsScanModalOpen(true)} />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                      <LakeAreaChart observations={observations} lakeName={selectedLake.name} />
                      <ObservationsTable observations={observations} lakeName={selectedLake.name} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Deep Lake Analytics */}
            {activeTab === 'analytics' && selectedLake && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400">Currently Analyzing:</span>
                    <strong className="text-cyan-300 text-sm">{selectedLake.name}</strong>
                    <span className="text-slate-500 font-mono text-xs">({selectedLake.region})</span>
                  </div>
                  <button
                    onClick={() => setIsScanModalOpen(true)}
                    className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs cursor-pointer shadow"
                  >
                    Ingest New SAR Acquisition
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <LakeDetailPanel lake={selectedLake} onOpenScanModal={() => setIsScanModalOpen(true)} />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <LakeAreaChart observations={observations} lakeName={selectedLake.name} />
                    <ObservationsTable observations={observations} lakeName={selectedLake.name} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Alert Center & Safety */}
            {activeTab === 'alerts' && (
              <AlertsManager alerts={alerts} onAlertUpdated={loadData} />
            )}

            {/* TAB 4: Satellite Pipeline & Jobs */}
            {activeTab === 'pipeline' && (
              <JobsPipeline jobs={jobs} onTriggerNewJob={() => setIsScanModalOpen(true)} />
            )}

            {/* TAB 5: Research & Literature Review */}
            {activeTab === 'research' && (
              <ResearchViewer />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Jal Sanket Early-Warning Support System &bull; Sentinel-1 C-Band SAR Hydrological Decision Support &bull;
          Designed for Hindu Kush Himalaya (HKH) Disaster Risk Reduction
        </p>
      </footer>

      {/* Modal for dispatching SAR job */}
      <SARScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        lakes={lakes}
        onJobTriggered={loadData}
      />
    </div>
  );
}
