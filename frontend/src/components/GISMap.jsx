import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Layers, Eye } from 'lucide-react';

// Tile provider options
const BASEMAPS = {
  satellite: {
    name: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  topo: {
    name: 'Terrain / Topo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
  },
  dark: {
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  }
};

const RISK_COLORS = {
  WARNING: '#ef4444', // Red
  WATCH: '#f97316',   // Orange
  ADVISORY: '#eab308',// Yellow
  NORMAL: '#10b981'   // Green
};

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function GISMap({ lakes, selectedLake, onSelectLake, onNavigateToAnalytics }) {
  const [activeBasemap, setActiveBasemap] = useState('satellite');

  // Center on Central/Eastern Himalayas
  const mapCenter = selectedLake
    ? [selectedLake.latitude, selectedLake.longitude]
    : [28.5, 84.5];
  const zoom = selectedLake ? 9 : 6;

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Basemap Switcher Toolbar */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1.5 flex items-center space-x-1 shadow-lg text-xs">
        <Layers className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-1" />
        {Object.entries(BASEMAPS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setActiveBasemap(key)}
            className={`px-2.5 py-1 rounded cursor-pointer transition font-medium ${
              activeBasemap === key
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 shadow-lg text-xs max-w-xs">
        <h4 className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
          <span>GLOF Hazard Tiers (Provisional)</span>
          <span className="text-[10px] text-slate-400 font-mono">SAR Multi-Factor</span>
        </h4>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
            <span className="text-slate-300">Warning (Score &ge; 75) &mdash; Critical Overtopping</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>
            <span className="text-slate-300">Watch (55 &ndash; 74) &mdash; Avalanche / Coherence Drop</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></span>
            <span className="text-slate-300">Advisory (35 &ndash; 54) &mdash; Moderate Expansion</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-slate-300">Normal (&lt; 35) &mdash; Stable Repeat-Pass</span>
          </div>
        </div>
        <p className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 italic">
          *Sentinel-1 C-Band SAR GRD observations. Decoupled from sole lake expansion.
        </p>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ChangeMapView center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution={BASEMAPS[activeBasemap].attribution}
          url={BASEMAPS[activeBasemap].url}
        />

        {/* Render Lakes */}
        {lakes.map((lake) => {
          // Determine mock/risk color
          const isSelected = selectedLake?.id === lake.id;
          const isWarning = lake.id === 'lake-south-lhonak';
          const isWatch = lake.id === 'lake-thorthormi';
          const isAdvisory = lake.id === 'lake-ghepang-gath';
          const color = isWarning ? RISK_COLORS.WARNING : (isWatch ? RISK_COLORS.WATCH : (isAdvisory ? RISK_COLORS.ADVISORY : RISK_COLORS.NORMAL));

          // Invert coordinates for Leaflet [lat, lon]
          const polygonPositions = lake.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);

          return (
            <React.Fragment key={lake.id}>
              {/* Lake boundary polygon */}
              <Polygon
                positions={polygonPositions}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.6 : 0.35,
                  weight: isSelected ? 3 : 1.5
                }}
                eventHandlers={{
                  click: () => onSelectLake(lake)
                }}
              />

              {/* Marker centroid with pulse */}
              <CircleMarker
                center={[lake.latitude, lake.longitude]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: color,
                  fillOpacity: 1,
                  weight: 2
                }}
                eventHandlers={{
                  click: () => onSelectLake(lake)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 space-y-2 text-xs min-w-[220px]">
                    <div className="border-b border-slate-700 pb-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-cyan-300">{lake.name}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                          style={{ backgroundColor: color }}
                        >
                          {isWarning ? 'WARNING' : (isWatch ? 'WATCH' : (isAdvisory ? 'ADVISORY' : 'NORMAL'))}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{lake.region}, {lake.country}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 py-1 text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Elevation:</span>
                        <span className="font-semibold">{lake.elevation_m} m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Current Area:</span>
                        <span className="font-semibold text-cyan-400">{lake.current_area_km2} km²</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Freeboard:</span>
                        <span className="font-semibold">{lake.freeboard_height_m} m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Ice Slope:</span>
                        <span className="font-semibold">{lake.steep_ice_slope_deg}°</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateToAnalytics(lake)}
                      className="w-full flex items-center justify-center space-x-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium transition cursor-pointer text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Deep Analytics & Radar</span>
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
