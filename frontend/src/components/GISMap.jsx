import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Circle,
  Popup,
  Tooltip,
  useMap
} from 'react-leaflet';
import {
  Layers,
  Eye,
  Mountain,
  Compass,
  Waves,
  Info,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  Zap,
  Radio,
  Building,
  Home,
  Camera,
  Volume2,
  Tent,
  Sparkles
} from 'lucide-react';

// Tile provider options with Google Maps HD Ground Imagery
const BASEMAPS = {
  googleHybrid: {
    name: 'Google Maps (Hybrid HD)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps &bull; Maxar Imagery &bull; Ground Elevation'
  },
  googleTerrain: {
    name: 'Google Terrain (Relief)',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps &bull; Elevation Hillshading'
  },
  googleSat: {
    name: 'Google Satellite (Clean)',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps &bull; High-Resolution Satellite'
  },
  esriSat: {
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics'
  },
  topo: {
    name: 'OpenTopoMap (Contours)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
  },
  dark: {
    name: 'CartoDB Dark (Radar Mode)',
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

// Rich Downstream Hydrological, Disaster Management & Ground Level Data
const LAKE_GEOSPATIAL_DETAILS = {
  'lake-south-lhonak': {
    basin: 'Teesta River Basin (North Sikkim)',
    dangerDescription: 'Moraine dam with degrading ice core; critical hanging ice face >34° primed for catastrophic impact waves.',
    moraineCenter: [27.9085, 88.1983],
    gorgeCenter: [27.750, 88.470],
    townCenter: [27.603, 88.646],
    avalancheSlope: [
      [27.922, 88.185], [27.928, 88.196], [27.924, 88.208], [27.915, 88.204], [27.912, 88.192]
    ],
    floodPath: [
      [27.9085, 88.1983], // Lake origin (T+0)
      [27.892, 88.235],   // Gorge Entry (T+10)
      [27.854, 88.312],   // Lhonak Chu canyon (T+20)
      [27.798, 88.421],   // Zemu confluence (T+30)
      [27.712, 88.528],   // Lachen valley approach (T+38)
      [27.603, 88.646],   // Chungthang Town (T+45)
      [27.508, 88.530],   // Mangan District HQ (T+70)
      [27.234, 88.498]    // Singtam Commercial Hub (T+110)
    ],
    floodPathSegments: [
      { timeMin: 0, coords: [[27.9085, 88.1983], [27.892, 88.235]], surgeHeight: '+26m (Dam Breach)', discharge: '8,400 m³/s', location: 'Moraine Breach Site' },
      { timeMin: 15, coords: [[27.892, 88.235], [27.854, 88.312]], surgeHeight: '+22m in Narrow Canyon', discharge: '8,100 m³/s', location: 'Lhonak Chu Gorge' },
      { timeMin: 30, coords: [[27.854, 88.312], [27.798, 88.421], [27.712, 88.528]], surgeHeight: '+20m Debris Wave', discharge: '7,900 m³/s', location: 'Zemu Chu Valley' },
      { timeMin: 45, coords: [[27.712, 88.528], [27.603, 88.646]], surgeHeight: '+19.4m River Rise', discharge: '7,500 m³/s', location: 'Chungthang & Teesta III Dam' },
      { timeMin: 70, coords: [[27.603, 88.646], [27.508, 88.530]], surgeHeight: '+12.5m Surge', discharge: '6,200 m³/s', location: 'Mangan River Bend' },
      { timeMin: 110, coords: [[27.508, 88.530], [27.234, 88.498]], surgeHeight: '+8.2m Inundation', discharge: '4,800 m³/s', location: 'Singtam Floodplain & Highway' }
    ],
    downstreamAssets: [
      { name: 'Chungthang Town', type: 'village', lat: 27.603, lon: 88.646, distanceKm: 42, arrivalMin: 45, pop: '4,200', notes: 'Confluence of Lachen & Lachung rivers' },
      { name: 'Teesta III Hydro Dam (1200MW)', type: 'hydro_dam', lat: 27.598, lon: 88.639, distanceKm: 43, arrivalMin: 46, pop: 'Critical Infra', notes: 'Concrete dam overtopped and breached in Oct 2023 disaster' },
      { name: 'Mangan District HQ', type: 'village', lat: 27.508, lon: 88.530, distanceKm: 58, arrivalMin: 70, pop: '5,000', notes: 'District administrative center on riverside' },
      { name: 'Singtam Commercial Hub', type: 'village', lat: 27.234, lon: 88.498, distanceKm: 86, arrivalMin: 110, pop: '9,000', notes: 'Key transport junction on NH-10' }
    ],
    sirens: [
      { name: 'EWS Siren Tower #01 (Chungthang)', lat: 27.606, lon: 88.644, soundRangeKm: 4.5, status: 'STANDBY_ALERT' },
      { name: 'EWS Siren Tower #02 (Teesta III Sluice)', lat: 27.596, lon: 88.636, soundRangeKm: 5.0, status: 'DRAWDOWN_READY' },
      { name: 'EWS Siren Tower #03 (Mangan Bridge)', lat: 27.512, lon: 88.527, soundRangeKm: 4.0, status: 'STANDBY_ALERT' }
    ],
    shelters: [
      { name: 'Chungthang High Ridge Shelter (+85m elevation)', lat: 27.609, lon: 88.648, capacity: '2,500 people', elevGain: '+85m above riverbed' },
      { name: 'Mangan Helipad Safe Assembly Ground', lat: 27.515, lon: 88.534, capacity: '4,000 people', elevGain: '+120m above riverbed' }
    ],
    sarSwath: [
      [27.4, 87.7], [28.3, 87.9], [28.4, 88.7], [27.5, 88.5]
    ],
    groundImages: {
      opticalPre: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      opticalPost: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      sarRadar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      groundDam: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
    }
  },
  'lake-imja-tsho': {
    basin: 'Dudh Koshi / Sagarmatha (Nepal)',
    dangerDescription: 'Massive debris-covered lateral moraine dam impounding over 78 M m³ in high-traffic Everest trekking corridor.',
    moraineCenter: [27.9015, 86.9285],
    gorgeCenter: [27.857, 86.793],
    townCenter: [27.806, 86.714],
    avalancheSlope: [
      [27.912, 86.945], [27.918, 86.955], [27.914, 86.965], [27.906, 86.958]
    ],
    floodPath: [
      [27.9015, 86.9285],
      [27.896, 86.885],
      [27.892, 86.833], // Dingboche
      [27.857, 86.793], // Pangboche
      [27.806, 86.714], // Namche Valley
      [27.687, 86.731]  // Lukla Access
    ],
    floodPathSegments: [
      { timeMin: 0, coords: [[27.9015, 86.9285], [27.896, 86.885]], surgeHeight: '+18m Breach', discharge: '6,200 m³/s', location: 'Spillway Failure Zone' },
      { timeMin: 18, coords: [[27.896, 86.885], [27.892, 86.833]], surgeHeight: '+14m Inundation', discharge: '5,800 m³/s', location: 'Dingboche Valley Plain' },
      { timeMin: 30, coords: [[27.892, 86.833], [27.857, 86.793]], surgeHeight: '+11m Gorge Surge', discharge: '5,400 m³/s', location: 'Pangboche Gorge' },
      { timeMin: 50, coords: [[27.857, 86.793], [27.806, 86.714]], surgeHeight: '+9m River Swell', discharge: '4,900 m³/s', location: 'Namche River Crossing' },
      { timeMin: 75, coords: [[27.806, 86.714], [27.687, 86.731]], surgeHeight: '+6.5m Surge', discharge: '3,800 m³/s', location: 'Lukla Valley Suspension Bridges' }
    ],
    downstreamAssets: [
      { name: 'Dingboche Settlement', type: 'village', lat: 27.892, lon: 86.833, distanceKm: 10, arrivalMin: 18, pop: '1,200', notes: 'Major trekking hub' },
      { name: 'Pangboche Monastery', type: 'village', lat: 27.857, lon: 86.793, distanceKm: 16, arrivalMin: 30, pop: '850', notes: 'Historic Sherpa settlement' },
      { name: 'Namche Bazaar Valley Gorge', type: 'village', lat: 27.806, lon: 86.714, distanceKm: 28, arrivalMin: 50, pop: '3,000', notes: 'Khumbu capital tourism gateway' },
      { name: 'Lukla Trail Suspension Bridges', type: 'infrastructure', lat: 27.687, lon: 86.731, distanceKm: 42, arrivalMin: 75, pop: 'Critical Bridges', notes: 'Lifeline suspension crossings' }
    ],
    sirens: [
      { name: 'EWS Siren Tower (Dingboche)', lat: 27.894, lon: 86.835, soundRangeKm: 3.5, status: 'STANDBY_ALERT' },
      { name: 'EWS Siren Tower (Namche Gorge)', lat: 27.808, lon: 86.716, soundRangeKm: 4.0, status: 'STANDBY_ALERT' }
    ],
    shelters: [
      { name: 'Dingboche Upper Ridge Safe Zone (+90m)', lat: 27.896, lon: 86.836, capacity: '1,500 people', elevGain: '+90m above riverbed' },
      { name: 'Namche Gompa High Hill Assembly', lat: 27.809, lon: 86.718, capacity: '3,500 people', elevGain: '+140m above riverbed' }
    ],
    sarSwath: [
      [27.4, 86.4], [28.3, 86.6], [28.4, 87.4], [27.5, 87.2]
    ],
    groundImages: {
      opticalPre: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      opticalPost: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
      sarRadar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      groundDam: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    }
  },
  'lake-tsho-rolpa': {
    basin: 'Tamakoshi River Basin (Nepal)',
    dangerDescription: 'Deep terminal moraine lake mitigated with artificial siphon & spillway; remaining breach risk threatens 456MW Upper Tamakoshi.',
    moraineCenter: [27.8618, 86.4850],
    gorgeCenter: [27.842, 86.386],
    townCenter: [27.805, 86.230],
    avalancheSlope: [
      [27.872, 86.495], [27.878, 86.510], [27.870, 86.518], [27.863, 86.505]
    ],
    floodPath: [
      [27.8618, 86.4850],
      [27.858, 86.462],
      [27.851, 86.442],
      [27.842, 86.386],
      [27.818, 86.295],
      [27.805, 86.230]
    ],
    floodPathSegments: [
      { timeMin: 0, coords: [[27.8618, 86.4850], [27.858, 86.462]], surgeHeight: '+19m Surge', discharge: '7,100 m³/s', location: 'Moraine Spillway' },
      { timeMin: 10, coords: [[27.858, 86.462], [27.851, 86.442]], surgeHeight: '+15m Wave', discharge: '6,800 m³/s', location: 'Na Village Approach' },
      { timeMin: 22, coords: [[27.851, 86.442], [27.842, 86.386]], surgeHeight: '+12m Wave', discharge: '6,300 m³/s', location: 'Beding Gorge' },
      { timeMin: 55, coords: [[27.842, 86.386], [27.805, 86.230]], surgeHeight: '+8.5m Surge', discharge: '5,100 m³/s', location: 'Upper Tamakoshi Dam' }
    ],
    downstreamAssets: [
      { name: 'Na Village', type: 'village', lat: 27.851, lon: 86.442, distanceKm: 6, arrivalMin: 10, pop: '350', notes: 'High-altitude pasture settlement' },
      { name: 'Beding Village', type: 'village', lat: 27.842, lon: 86.386, distanceKm: 14, arrivalMin: 22, pop: '600', notes: 'Rolwaling valley central town' },
      { name: 'Upper Tamakoshi Hydroelectric Dam (456MW)', type: 'hydro_dam', lat: 27.805, lon: 86.230, distanceKm: 34, arrivalMin: 55, pop: 'National Grid', notes: "Nepal's largest domestic hydro plant" }
    ],
    sirens: [
      { name: 'EWS Siren (Beding)', lat: 27.844, lon: 86.388, soundRangeKm: 3.5, status: 'STANDBY_ALERT' },
      { name: 'EWS Siren (Tamakoshi Dam)', lat: 27.807, lon: 86.233, soundRangeKm: 5.0, status: 'STANDBY_ALERT' }
    ],
    shelters: [
      { name: 'Beding High Monastery Safe Zone (+70m)', lat: 27.845, lon: 86.390, capacity: '800 people', elevGain: '+70m above riverbed' }
    ],
    sarSwath: [
      [27.3, 86.0], [28.2, 86.2], [28.3, 87.0], [27.4, 86.8]
    ]
  },
  'lake-thorthormi': {
    basin: 'Pho Chhu Basin, Lunana (Bhutan)',
    dangerDescription: 'Bhutan ticking time-bomb: Supraglacial ponds expanding rapidly across dead-ice dam separated from Raphstreng Lake by thin moraine.',
    moraineCenter: [28.1150, 90.2450],
    gorgeCenter: [27.850, 89.980],
    townCenter: [27.583, 89.863],
    avalancheSlope: [
      [28.125, 90.235], [28.132, 90.252], [28.126, 90.264], [28.118, 90.255]
    ],
    floodPath: [
      [28.1150, 90.2450],
      [28.108, 90.230],
      [28.102, 90.219],
      [28.025, 90.110],
      [27.850, 89.980],
      [27.583, 89.863],
      [27.350, 89.880]
    ],
    floodPathSegments: [
      { timeMin: 0, coords: [[28.1150, 90.2450], [28.108, 90.230]], surgeHeight: '+24m Moraine Breach', discharge: '9,200 m³/s', location: 'Supraglacial Collapse' },
      { timeMin: 8, coords: [[28.108, 90.230], [28.102, 90.219]], surgeHeight: '+18m Wave', discharge: '8,800 m³/s', location: 'Thanza Remote Village' },
      { timeMin: 45, coords: [[28.102, 90.219], [27.850, 89.980]], surgeHeight: '+14m Canyon Surge', discharge: '7,400 m³/s', location: 'Lunana River Gorges' },
      { timeMin: 95, coords: [[27.850, 89.980], [27.583, 89.863]], surgeHeight: '+9.4m River Rise', discharge: '6,100 m³/s', location: 'Punakha Dzong Heritage Complex' },
      { timeMin: 140, coords: [[27.583, 89.863], [27.350, 89.880]], surgeHeight: '+6m Inundation', discharge: '4,500 m³/s', location: 'Punatsangchhu Hydro Project' }
    ],
    downstreamAssets: [
      { name: 'Thanza Remote Village', type: 'village', lat: 28.102, lon: 90.219, distanceKm: 5, arrivalMin: 8, pop: '400', notes: 'Most vulnerable settlement in Lunana' },
      { name: 'Punakha Dzong Heritage Fortress', type: 'infrastructure', lat: 27.583, lon: 89.863, distanceKm: 78, arrivalMin: 95, pop: 'UNESCO Site', notes: 'Historic coronation palace flooded in 1994 GLOF' },
      { name: 'Punatsangchhu-I Hydro (1020MW)', type: 'hydro_dam', lat: 27.350, lon: 89.880, distanceKm: 105, arrivalMin: 140, pop: 'Mega Project', notes: 'Run-of-the-river power complex' }
    ],
    sirens: [
      { name: 'EWS Siren (Thanza Outpost)', lat: 28.104, lon: 90.221, soundRangeKm: 3.5, status: 'STANDBY_ALERT' },
      { name: 'EWS Siren (Punakha Dzong)', lat: 27.585, lon: 89.865, soundRangeKm: 5.5, status: 'STANDBY_ALERT' }
    ],
    shelters: [
      { name: 'Thanza Upper Mountain Plateau (+110m)', lat: 28.106, lon: 90.224, capacity: '600 people', elevGain: '+110m above riverbed' }
    ],
    sarSwath: [
      [27.6, 89.7], [28.5, 89.9], [28.6, 90.8], [27.7, 90.6]
    ]
  },
  'lake-ghepang-gath': {
    basin: 'Chandra / Chenab Basin (Himachal Pradesh)',
    dangerDescription: 'High expansion rate (+176% since baseline) in Lahaul valley threatening national strategic highways and the Atal Tunnel access route.',
    moraineCenter: [32.4789, 77.1780],
    gorgeCenter: [32.460, 77.150],
    townCenter: [32.441, 77.135],
    avalancheSlope: [
      [32.488, 77.190], [32.492, 77.198], [32.483, 77.202]
    ],
    floodPath: [
      [32.4789, 77.1780],
      [32.479, 77.145],
      [32.479, 77.119],
      [32.445, 77.185],
      [32.441, 77.135]
    ],
    floodPathSegments: [
      { timeMin: 0, coords: [[32.4789, 77.1780], [32.479, 77.145]], surgeHeight: '+16m Breach', discharge: '5,200 m³/s', location: 'Terminal Moraine Outflow' },
      { timeMin: 14, coords: [[32.479, 77.145], [32.479, 77.119]], surgeHeight: '+12m Wave', discharge: '4,800 m³/s', location: 'Sissu Valley Confluence' },
      { timeMin: 35, coords: [[32.479, 77.119], [32.441, 77.135]], surgeHeight: '+7.5m River Rise', discharge: '3,900 m³/s', location: 'Atal Tunnel North Portal Road' }
    ],
    downstreamAssets: [
      { name: 'Sissu Valley Village', type: 'village', lat: 32.479, lon: 77.119, distanceKm: 8, arrivalMin: 14, pop: '1,500', notes: 'Popular tourism and agricultural valley' },
      { name: 'Koksar Chandra River Bridge', type: 'infrastructure', lat: 32.445, lon: 77.185, distanceKm: 16, arrivalMin: 26, pop: 'Bridge Lifeline', notes: 'Strategic bridge on Manali-Leh axis' },
      { name: 'Atal Tunnel North Portal Highway', type: 'infrastructure', lat: 32.441, lon: 77.135, distanceKm: 22, arrivalMin: 35, pop: 'Strategic Road', notes: 'All-weather lifeline corridor to Ladakh' }
    ],
    sirens: [
      { name: 'EWS Siren (Sissu Waterfall Point)', lat: 32.481, lon: 77.121, soundRangeKm: 4.0, status: 'STANDBY_ALERT' },
      { name: 'EWS Siren (Atal Tunnel Portal)', lat: 32.443, lon: 77.137, soundRangeKm: 4.5, status: 'STANDBY_ALERT' }
    ],
    shelters: [
      { name: 'Sissu Upper Monastery Safe Ground (+80m)', lat: 32.483, lon: 77.123, capacity: '2,000 people', elevGain: '+80m above riverbed' }
    ],
    sarSwath: [
      [31.9, 76.6], [32.8, 76.8], [32.9, 77.7], [32.0, 77.5]
    ]
  },
  'lake-gangabal': {
    basin: 'Sind / Jhelum Basin (Kashmir)',
    dangerDescription: 'Stable natural glacial tarn backed by Harmukh mountain; low breach probability serves as an ecological baseline control lake.',
    moraineCenter: [34.4312, 74.9287],
    gorgeCenter: [34.380, 74.960],
    townCenter: [34.262, 74.903],
    avalancheSlope: [
      [34.442, 74.935], [34.448, 74.945], [34.440, 74.952]
    ],
    floodPath: [
      [34.4312, 74.9287],
      [34.398, 74.952],
      [34.349, 74.978],
      [34.262, 74.903]
    ],
    floodPathSegments: [
      { timeMin: 0, coords: [[34.4312, 74.9287], [34.398, 74.952]], surgeHeight: '+8m Natural Spill', discharge: '1,400 m³/s', location: 'Bedrock Spillway' },
      { timeMin: 20, coords: [[34.398, 74.952], [34.349, 74.978]], surgeHeight: '+5m Stream Swell', discharge: '1,100 m³/s', location: 'Naranag Valley' },
      { timeMin: 42, coords: [[34.349, 74.978], [34.262, 74.903]], surgeHeight: '+3m Stream Rise', discharge: '850 m³/s', location: 'Upper Sind Hydro Outflow' }
    ],
    downstreamAssets: [
      { name: 'Naranag Ancient Archaeological Site', type: 'village', lat: 34.349, lon: 74.978, distanceKm: 12, arrivalMin: 20, pop: 'Heritage Village', notes: '8th-century temple complex in narrow gorge' },
      { name: 'Upper Sind Hydro Electric Project', type: 'hydro_dam', lat: 34.262, lon: 74.903, distanceKm: 26, arrivalMin: 42, pop: 'Hydropower', notes: 'Downstream run-of-river generation plant' }
    ],
    sirens: [
      { name: 'EWS Siren (Naranag Outpost)', lat: 34.351, lon: 74.980, soundRangeKm: 3.5, status: 'NORMAL' }
    ],
    shelters: [
      { name: 'Naranag High Hill Meadow (+65m)', lat: 34.353, lon: 74.982, capacity: '1,000 people', elevGain: '+65m above riverbed' }
    ],
    sarSwath: [
      [33.9, 74.3], [34.8, 74.5], [34.9, 75.4], [34.0, 75.2]
    ]
  }
};

// Guided Presentation Steps
const PRESENTATION_STEPS = [
  {
    step: 1,
    title: 'Himalayan Glacial Lake Outburst Flood (GLOF) Context',
    lakeId: 'all',
    zoom: 6,
    center: [29.0, 83.5],
    badge: 'Pan-Himalaya Overview',
    narrative:
      'Climate warming has caused Himalayan glaciers to retreat rapidly, impounding over 28,000 glacial lakes behind unstable natural rock and ice dams (moraines). When these natural dams fail, millions of tons of water and debris cascade downstream with devastating speed.',
    keyTakeaway: 'Jal Sanket continuously monitors high-altitude lakes across India, Nepal, and Bhutan in one unified GIS view.'
  },
  {
    step: 2,
    title: 'The Radar Advantage: Why Optical Sensors Fail in the Himalayas',
    lakeId: 'lake-south-lhonak',
    zoom: 10,
    center: [27.9085, 88.1983],
    badge: 'Sentinel-1 SAR C-Band Swath',
    narrative:
      'During monsoon season, the Eastern Himalayas face 70% to 85% heavy cloud cover and dense mountain fog. Optical satellites (like Sentinel-2 or Landsat) are completely blind. Sentinel-1 C-Band radar penetrates 100% of cloud cover and darkness to image lake boundaries every 6–12 days.',
    keyTakeaway: 'Radar backscatter (-18 to -24 dB) allows automated Otsu thresholding water detection even in heavy storms.'
  },
  {
    step: 3,
    title: 'Decoupled Multi-Factor Hazard Scoring (Why Area Growth Alone Fails)',
    lakeId: 'lake-south-lhonak',
    zoom: 15,
    center: [27.915, 88.198],
    badge: 'Trigger Primacy: 34.5° Ice Slope',
    narrative:
      'A common misconception is that lake expansion alone predicts floods. In reality, Himalayan lakes naturally expand 8%–22% every summer simply due to normal seasonal melt! Jal Sanket allocates 30% primary weight to parent glacier hanging ice slopes (>30°), which trigger catastrophic impulse waves.',
    keyTakeaway: 'South Lhonak has an unstable 34.5° hanging ice cliff and only 14m of freeboard height, resulting in a critical WARNING tier.'
  },
  {
    step: 4,
    title: 'Downstream Impact Pathway: The Teesta III Dam Case Study',
    lakeId: 'lake-south-lhonak',
    zoom: 14,
    center: [27.603, 88.646],
    badge: 'Valley Inundation & Dam Breach',
    narrative:
      'When South Lhonak breached in October 2023, the surge travelled 42 km down the gorge in just 45 minutes, completely washing away the 1,200 MW Teesta III hydroelectric project at Chungthang and damaging bridges all the way to Singtam.',
    keyTakeaway: 'The system traces downstream population nodes and infrastructure to estimate flood arrival lead times.'
  },
  {
    step: 5,
    title: 'Provisional Decision Protocol & Expert Human Validation',
    lakeId: 'lake-thorthormi',
    zoom: 10,
    center: [28.115, 90.245],
    badge: 'Bhutan Ticking Timebomb',
    narrative:
      'To prevent false alarms and mass public panic, all machine-generated hazard warnings are strictly tagged as "Provisional". The system mandates an accredited glaciologist review protocol before state disaster management alerts are triggered.',
    keyTakeaway: 'Thorthormi Lake in Bhutan has multiple supraglacial ponds coalescing over an ice core, monitored continuously under provisional watch.'
  }
];

// Helper to smooth pan/zoom map
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.3,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  return null;
}

export default function GISMap({ lakes, selectedLake, onSelectLake, onNavigateToAnalytics }) {
  const [activeBasemap, setActiveBasemap] = useState('googleHybrid');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Layer Toggles
  const [showFloodPath, setShowFloodPath] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [showSirens, setShowSirens] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showAvalancheZone, setShowAvalancheZone] = useState(true);
  const [showRadarSwath, setShowRadarSwath] = useState(false);
  const [showHazardBuffers, setShowHazardBuffers] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Ground Level Satellite Imagery Modal
  const [showSatelliteModal, setShowSatelliteModal] = useState(false);
  const [activeSatelliteTab, setActiveSatelliteTab] = useState('optical');

  // Disaster Management Flood Simulation State
  const [isFloodSimActive, setIsFloodSimActive] = useState(false);
  const [floodSimMinutes, setFloodSimMinutes] = useState(0);
  const [isSimPlaying, setIsSimPlaying] = useState(false);

  // Guided Presentation Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Camera settings
  const [customView, setCustomView] = useState(null);

  const activeTourStep = isTourActive ? PRESENTATION_STEPS[tourStepIndex] : null;

  const currentCenter = customView
    ? customView.center
    : activeTourStep
    ? activeTourStep.center
    : selectedLake
    ? [selectedLake.latitude, selectedLake.longitude]
    : [28.5, 84.5];

  const currentZoom = customView
    ? customView.zoom
    : activeTourStep
    ? activeTourStep.zoom
    : selectedLake
    ? 9
    : 6;

  // Active Lake Details
  const activeLake = selectedLake || (lakes.length > 0 ? lakes[0] : null);
  const activeDetails = activeLake ? LAKE_GEOSPATIAL_DETAILS[activeLake.id] : null;

  // Auto-run Flood Simulator when Playing
  useEffect(() => {
    let interval = null;
    if (isSimPlaying) {
      interval = setInterval(() => {
        setFloodSimMinutes((prev) => {
          if (prev >= 110) {
            setIsSimPlaying(false);
            return 110;
          }
          return prev + 5;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimPlaying]);

  // Handle tour steps
  const handleNextTourStep = () => {
    if (tourStepIndex < PRESENTATION_STEPS.length - 1) {
      const nextIndex = tourStepIndex + 1;
      setTourStepIndex(nextIndex);
      setCustomView(null);
      const targetLakeId = PRESENTATION_STEPS[nextIndex].lakeId;
      if (targetLakeId !== 'all') {
        const found = lakes.find((l) => l.id === targetLakeId);
        if (found) onSelectLake(found);
      }
    } else {
      setIsTourActive(false);
    }
  };

  const handlePrevTourStep = () => {
    if (tourStepIndex > 0) {
      const prevIndex = tourStepIndex - 1;
      setTourStepIndex(prevIndex);
      setCustomView(null);
      const targetLakeId = PRESENTATION_STEPS[prevIndex].lakeId;
      if (targetLakeId !== 'all') {
        const found = lakes.find((l) => l.id === targetLakeId);
        if (found) onSelectLake(found);
      }
    }
  };

  const startPresentationTour = () => {
    setIsTourActive(true);
    setTourStepIndex(0);
    setCustomView(null);
    setShowFloodPath(true);
    setShowAssets(true);
    setShowAvalancheZone(true);
    setShowRadarSwath(true);
  };

  // Quick Zoom Helper
  const zoomToGroundLevel = (type) => {
    if (!activeDetails) return;
    setIsTourActive(false);
    if (type === 'moraine') {
      setCustomView({ center: activeDetails.moraineCenter, zoom: 16 });
    } else if (type === 'gorge') {
      setCustomView({ center: activeDetails.gorgeCenter, zoom: 13 });
    } else if (type === 'town') {
      setCustomView({ center: activeDetails.townCenter, zoom: 15 });
    } else if (type === 'basin') {
      setCustomView({ center: [activeLake.latitude, activeLake.longitude], zoom: 8 });
    }
  };

  const handleResetPanHimalaya = () => {
    setIsTourActive(false);
    setCustomView(null);
    onSelectLake(null);
  };

  // Active Flood Segment Calculation
  const activeSegments = activeDetails?.floodPathSegments
    ? activeDetails.floodPathSegments.filter((seg) => seg.timeMin <= floodSimMinutes)
    : [];

  const currentWaveStatus = activeDetails?.floodPathSegments
    ? activeDetails.floodPathSegments.slice().reverse().find((seg) => seg.timeMin <= floodSimMinutes) || activeDetails.floodPathSegments[0]
    : null;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 transition-all duration-300 ${
        isFullScreen ? 'h-[880px]' : 'h-[680px]'
      }`}
    >
      {/* TOP HEADER CONTROLS BAR */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Basin Quick Filter Buttons */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 flex items-center space-x-1 shadow-2xl pointer-events-auto overflow-x-auto max-w-full">
          <button
            onClick={handleResetPanHimalaya}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
              !selectedLake && !isTourActive && !customView
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pan-Himalaya</span>
          </button>

          <span className="w-px h-4 bg-slate-700/60 mx-1 shrink-0"></span>

          {lakes.map((lake) => {
            const isSelected = selectedLake?.id === lake.id && !isTourActive;
            const isWarning = lake.id === 'lake-south-lhonak';
            const isWatch = lake.id === 'lake-thorthormi';
            const badgeColor = isWarning
              ? 'bg-red-500/20 text-red-400 border-red-500/50'
              : isWatch
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';

            return (
              <button
                key={lake.id}
                onClick={() => {
                  setIsTourActive(false);
                  setCustomView(null);
                  onSelectLake(lake);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center space-x-1.5 transition cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-transparent text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isWarning ? 'bg-red-500 animate-ping' : isWatch ? 'bg-orange-400' : 'bg-emerald-400'}`}></span>
                <span>{lake.name.replace(' Lake', '')}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded border font-mono ${badgeColor}`}>
                  {isWarning ? 'WARN' : isWatch ? 'WATCH' : 'NORM'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Action Tools: Tour, Ground Satellite, Simulator, Layers, Fullscreen */}
        <div className="flex items-center space-x-1.5 pointer-events-auto shrink-0">
          {/* Ground-Level Satellite Inspector Button */}
          <button
            onClick={() => setShowSatelliteModal(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/90 backdrop-blur-md border border-cyan-500/70 text-cyan-300 hover:bg-cyan-950 hover:text-white flex items-center space-x-1.5 shadow-lg transition cursor-pointer"
            title="Inspect Ground-Level Photos & Real Satellite Imagery (Pre vs Post Breach)"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Ground & Satellite</span>
          </button>

          {/* Disaster Flood Simulator Button */}
          <button
            onClick={() => setIsFloodSimActive(!isFloodSimActive)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-lg transition cursor-pointer border ${
              isFloodSimActive
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-slate-900/90 backdrop-blur-md border-rose-500/60 text-rose-300 hover:bg-rose-950'
            }`}
            title="Simulate GLOF Outburst Flood Propagation Down Valley"
          >
            <Waves className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Disaster Simulator</span>
          </button>

          {/* Guided Presentation Tour Button */}
          <button
            onClick={startPresentationTour}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-lg transition cursor-pointer border ${
              isTourActive
                ? 'bg-amber-600 text-white border-amber-400 animate-pulse'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/50'
            }`}
            title="Launch step-by-step interactive demonstration walkthrough"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTourActive ? 'Tour Active' : 'Explain GLOF Tour'}</span>
          </button>

          {/* GIS Layers Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 shadow-lg transition cursor-pointer ${
                showLayerMenu
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-slate-900/90 backdrop-blur-md border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Toggle GIS Overlays & Basemaps"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Layers</span>
            </button>

            {/* Layer Control Menu */}
            {showLayerMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl p-3 shadow-2xl z-[1010] text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-semibold text-slate-200">
                  <span>GIS Layer Visibility</span>
                  <button onClick={() => setShowLayerMenu(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showFloodPath}
                    onChange={(e) => setShowFloodPath(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Downstream Flood Pathways</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showAssets}
                    onChange={(e) => setShowAssets(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <Building className="w-3.5 h-3.5 text-rose-400" />
                  <span>Downstream Towns & Dams</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showSirens}
                    onChange={(e) => setShowSirens(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Early Warning Siren Towers</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showShelters}
                    onChange={(e) => setShowShelters(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <Tent className="w-3.5 h-3.5 text-emerald-400" />
                  <span>High-Ground Safe Shelters</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showAvalancheZone}
                    onChange={(e) => setShowAvalancheZone(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <Mountain className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hanging Ice Hazard (&gt;30°)</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showRadarSwath}
                    onChange={(e) => setShowRadarSwath(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sentinel-1 SAR Radar Track</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showHazardBuffers}
                    onChange={(e) => setShowHazardBuffers(e.target.checked)}
                    className="accent-yellow-500 rounded"
                  />
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Hazard Impact Buffers (15/30km)</span>
                </label>

                {/* Basemap Selection */}
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300 block mb-1">Select Basemap:</span>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {Object.entries(BASEMAPS).map(([key, item]) => (
                      <button
                        key={key}
                        onClick={() => setActiveBasemap(key)}
                        className={`px-2 py-1 rounded text-center truncate ${
                          activeBasemap === key
                            ? 'bg-cyan-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {item.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Screen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-lg transition cursor-pointer"
            title={isFullScreen ? 'Minimize Map' : 'Expand Map View'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QUICK GROUND-LEVEL ZOOM CONTROLS (LEFT BAR) */}
      <div className="absolute top-16 left-3 z-[1000] flex flex-col space-y-1.5 pointer-events-auto">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 flex flex-col space-y-1 shadow-xl text-xs">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono px-1 font-bold">
            Ground-Level Zoom
          </span>
          <button
            onClick={() => zoomToGroundLevel('moraine')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-900/60 text-slate-200 hover:text-cyan-300 flex items-center space-x-1.5 font-medium transition cursor-pointer text-left"
            title="Deep zoom straight down to lake rock/ice moraine dam"
          >
            <Mountain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Moraine Dam (16x)</span>
          </button>
          <button
            onClick={() => zoomToGroundLevel('gorge')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-300 flex items-center space-x-1.5 font-medium transition cursor-pointer text-left"
            title="Zoom into high-velocity river canyon gorge"
          >
            <Waves className="w-3.5 h-3.5 text-rose-400" />
            <span>Breach Gorge (13x)</span>
          </button>
          <button
            onClick={() => zoomToGroundLevel('town')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-900/60 text-slate-200 hover:text-amber-300 flex items-center space-x-1.5 font-medium transition cursor-pointer text-left"
            title="Zoom into downstream town & hydro dam disaster impact site"
          >
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>Town & Dam (15x)</span>
          </button>
          <button
            onClick={() => zoomToGroundLevel('basin')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 font-medium transition cursor-pointer text-left"
            title="Zoom out to valley catchment"
          >
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Basin View (8x)</span>
          </button>
        </div>

        {/* Live Satellite Indicator */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-800/60 rounded-xl px-2.5 py-1 text-[11px] text-cyan-200 flex items-center space-x-2 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-semibold text-slate-200">Basemap:</span>
          <span className="font-mono text-cyan-300 font-bold">{BASEMAPS[activeBasemap].name.split(' ')[0]}</span>
        </div>
      </div>

      {/* DISASTER MANAGEMENT & FLOOD WAVE SIMULATOR DRAWER (BOTTOM-CENTER) */}
      {isFloodSimActive && activeDetails && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-[1005] w-11/12 max-w-3xl bg-slate-900/95 backdrop-blur-xl border border-rose-500/80 rounded-2xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <Waves className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-sm text-white">GLOF Outburst Flood Surge & Evacuation Simulator</span>
                <span className="text-[11px] text-slate-400 block">{activeLake.name} &bull; Valley Inundation Physics</span>
              </div>
            </div>
            <button
              onClick={() => setIsFloodSimActive(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline Controller */}
          <div className="py-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSimPlaying(!isSimPlaying)}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                    isSimPlaying ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                >
                  {isSimPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isSimPlaying ? 'Pause Surge' : 'Simulate Surge'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsSimPlaying(false);
                    setFloodSimMinutes(0);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Time display */}
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">Surge Propagation Elapsed:</span>
                <span className="text-base font-black font-mono text-rose-400">
                  T + {floodSimMinutes} minutes
                </span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="110"
              step="5"
              value={floodSimMinutes}
              onChange={(e) => setFloodSimMinutes(Number(e.target.value))}
              className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Current Inundation Front & Disaster Response Actions */}
          {currentWaveStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-xs">
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40">
                <span className="text-[10px] text-rose-300 uppercase font-mono block">Wave Surge Front</span>
                <span className="font-bold text-white text-xs mt-0.5 block">{currentWaveStatus.location}</span>
                <span className="text-rose-400 font-mono text-[11px]">{currentWaveStatus.surgeHeight}</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Peak Discharge ($Q_p$)</span>
                <span className="font-mono text-cyan-300 font-bold text-xs mt-0.5 block">{currentWaveStatus.discharge}</span>
                <span className="text-slate-400 text-[10px]">Surge Velocity: ~48 km/h</span>
              </div>

              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40">
                <span className="text-[10px] text-amber-300 uppercase font-mono block">Disaster Management Action</span>
                <span className="font-semibold text-amber-200 text-[11px] mt-0.5 block">
                  {floodSimMinutes < 15
                    ? 'Automated Early-Warning Sirens Activated (130dB)'
                    : floodSimMinutes < 45
                    ? 'Teesta III Dam Floodgates Open: Emergency Drawdown'
                    : floodSimMinutes < 70
                    ? 'NH-10 Traffic Halt & Evacuate to High Ground'
                    : 'Downstream Relief & Assembly Shelters Engaged'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GUIDED PRESENTATION TOUR OVERLAY CARD */}
      {isTourActive && activeTourStep && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-[1005] w-11/12 max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/80 rounded-2xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-bold">
                Step {activeTourStep.step} of {PRESENTATION_STEPS.length}
              </span>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">{activeTourStep.badge}</span>
            </div>
            <button
              onClick={() => setIsTourActive(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2.5">
            <h3 className="font-bold text-sm sm:text-base text-white">{activeTourStep.title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeTourStep.narrative}</p>
            <div className="mt-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200 flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{activeTourStep.keyTakeaway}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              onClick={handlePrevTourStep}
              disabled={tourStepIndex === 0}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
                tourStepIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-1.5">
              {PRESENTATION_STEPS.map((s, idx) => (
                <span
                  key={s.step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === tourStepIndex ? 'w-5 bg-amber-400' : 'bg-slate-700'
                  }`}
                ></span>
              ))}
            </div>

            <button
              onClick={handleNextTourStep}
              className="px-3.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center space-x-1 cursor-pointer shadow-md"
            >
              <span>{tourStepIndex === PRESENTATION_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING SELECTED LAKE INSPECTION HUD */}
      {selectedLake && !isTourActive && !isFloodSimActive && (
        <div className="absolute top-16 right-3 z-[1000] w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-xl p-3.5 shadow-2xl text-xs space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-cyan-300">{selectedLake.name}</span>
              </div>
              <div className="text-[11px] text-slate-400">{selectedLake.region}, {selectedLake.country}</div>
            </div>
            <button
              onClick={() => onSelectLake(null)}
              className="text-slate-400 hover:text-white p-1"
              title="Close HUD"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics Matrix */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Altitude:</span>
              <span className="font-bold text-slate-200 font-mono text-xs">{selectedLake.elevation_m} m ASL</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Surface Area:</span>
              <span className="font-bold text-cyan-300 font-mono text-xs">{selectedLake.current_area_km2} km²</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Dam Freeboard:</span>
              <span className={`font-bold font-mono text-xs ${selectedLake.freeboard_height_m < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {selectedLake.freeboard_height_m} m
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Hanging Ice Slope:</span>
              <span className={`font-bold font-mono text-xs ${selectedLake.steep_ice_slope_deg > 30 ? 'text-red-400' : 'text-slate-300'}`}>
                {selectedLake.steep_ice_slope_deg}°
              </span>
            </div>
          </div>

          {/* Glaciological Notes */}
          <p className="text-[11px] text-slate-300 leading-relaxed italic bg-slate-950/50 p-2 rounded border border-slate-800/80">
            "{activeDetails?.dangerDescription || selectedLake.moraine_type}"
          </p>

          {/* Direct deep analytics button */}
          <button
            onClick={() => onNavigateToAnalytics(selectedLake)}
            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold flex items-center justify-center space-x-1.5 shadow transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Launch Deep Radar & Risk Analytics</span>
          </button>
        </div>
      )}

      {/* MAP LEGEND (BOTTOM-LEFT) */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs max-w-xs space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <span className="font-bold text-slate-200">GLOF GIS Legend</span>
          <span className="text-[9px] text-cyan-400 font-mono bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
            Google Maps HD
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-300">Warning (&ge;75)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">Watch (55-74)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="text-slate-300">Advisory (35-54)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Normal (&lt;35)</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 bg-rose-500 inline-block border-b-2 border-dashed border-rose-400"></span>
            <span>Downstream Flood Path (Active Inundation)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 inline-block"></span>
            <span>Town / Hydropower Dam At Risk</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span>Early Warning Siren (130dB Tower)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block"></span>
            <span>High-Ground Safe Shelter (&gt;60m)</span>
          </div>
        </div>
      </div>

      {/* MAIN LEAFLET MAP CONTAINER */}
      <MapContainer
        center={currentCenter}
        zoom={currentZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapViewController center={currentCenter} zoom={currentZoom} />

        <TileLayer
          attribution={BASEMAPS[activeBasemap].attribution}
          url={BASEMAPS[activeBasemap].url}
          maxZoom={20}
        />

        {/* RENDER ALL MONITORED LAKES */}
        {lakes.map((lake) => {
          const isSelected = selectedLake?.id === lake.id;
          const isWarning = lake.id === 'lake-south-lhonak';
          const isWatch = lake.id === 'lake-thorthormi';
          const isAdvisory = lake.id === 'lake-ghepang-gath';
          const color = isWarning
            ? RISK_COLORS.WARNING
            : isWatch
            ? RISK_COLORS.WATCH
            : isAdvisory
            ? RISK_COLORS.ADVISORY
            : RISK_COLORS.NORMAL;

          const lakeDetails = LAKE_GEOSPATIAL_DETAILS[lake.id] || {};
          const polygonPositions = lake.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);

          return (
            <React.Fragment key={lake.id}>
              {/* Lake boundary polygon */}
              <Polygon
                positions={polygonPositions}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.65 : 0.4,
                  weight: isSelected ? 3.5 : 2
                }}
                eventHandlers={{
                  click: () => onSelectLake(lake)
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9} sticky>
                  <div className="text-xs font-bold text-slate-100">{lake.name}</div>
                  <div className="text-[10px] text-cyan-300 font-mono">{lake.current_area_km2} km² &bull; {lake.elevation_m}m ASL</div>
                </Tooltip>
              </Polygon>

              {/* Centroid Marker */}
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
                  <div className="p-1 space-y-2 text-xs min-w-[240px]">
                    <div className="border-b border-slate-700 pb-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-cyan-300">{lake.name}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                          style={{ backgroundColor: color }}
                        >
                          {isWarning ? 'WARNING' : isWatch ? 'WATCH' : isAdvisory ? 'ADVISORY' : 'NORMAL'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{lake.region}, {lake.country}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 py-1 text-slate-300 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Elevation:</span>
                        <span className="font-semibold">{lake.elevation_m} m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Current Extent:</span>
                        <span className="font-semibold text-cyan-400">{lake.current_area_km2} km²</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Dam Freeboard:</span>
                        <span className="font-semibold">{lake.freeboard_height_m} m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Ice Slope:</span>
                        <span className="font-semibold">{lake.steep_ice_slope_deg}°</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateToAnalytics(lake)}
                      className="w-full flex items-center justify-center space-x-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium transition cursor-pointer text-xs shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Deep Radar & Risk Analytics</span>
                    </button>
                  </div>
                </Popup>
              </CircleMarker>

              {/* CONCENTRIC HAZARD IMPACT BUFFERS (5km, 15km, 30km) */}
              {showHazardBuffers && isSelected && (
                <>
                  <Circle
                    center={[lake.latitude, lake.longitude]}
                    radius={5000}
                    pathOptions={{ color: '#ef4444', fillOpacity: 0.05, dashArray: '4, 8', weight: 1.5 }}
                  />
                  <Circle
                    center={[lake.latitude, lake.longitude]}
                    radius={15000}
                    pathOptions={{ color: '#f97316', fillOpacity: 0.03, dashArray: '6, 10', weight: 1.5 }}
                  />
                  <Circle
                    center={[lake.latitude, lake.longitude]}
                    radius={30000}
                    pathOptions={{ color: '#eab308', fillOpacity: 0.02, dashArray: '8, 12', weight: 1.5 }}
                  />
                </>
              )}

              {/* PARENT GLACIER HANGING ICE TRIGGER ZONE (>30°) */}
              {showAvalancheZone && lakeDetails.avalancheSlope && (isSelected || isWarning || isTourActive) && (
                <Polygon
                  positions={lakeDetails.avalancheSlope}
                  pathOptions={{
                    color: '#f59e0b',
                    fillColor: '#fbbf24',
                    fillOpacity: 0.45,
                    weight: 2,
                    dashArray: '3, 6'
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-[11px] font-bold text-amber-300">
                      Parent Glacier Hanging Ice Slope ({lake.steep_ice_slope_deg}°)
                    </div>
                    <div className="text-[10px] text-slate-300">Impulse Wave / Ice Avalanche Trigger Source</div>
                  </Tooltip>
                </Polygon>
              )}

              {/* DOWNSTREAM FLOOD PATH FLOWLINE */}
              {showFloodPath && lakeDetails.floodPath && (isSelected || isWarning || isTourActive) && (
                <Polyline
                  positions={lakeDetails.floodPath}
                  className="flood-flowline"
                  pathOptions={{
                    color: '#06b6d4',
                    weight: isSelected ? 4.5 : 3,
                    opacity: 0.9
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-[11px] font-bold text-cyan-300">Downstream GLOF Flood Inundation Path</div>
                    <div className="text-[10px] text-slate-300">Gorge Drainage Corridor into Valley Communities</div>
                  </Tooltip>
                </Polyline>
              )}

              {/* ACTIVE FLOOD SIMULATION INUNDATED SEGMENTS */}
              {isFloodSimActive && isSelected && activeSegments.length > 0 && (
                activeSegments.map((seg, sIdx) => (
                  <Polyline
                    key={`active-seg-${sIdx}`}
                    positions={seg.coords}
                    className="flood-surge-active"
                    pathOptions={{
                      color: '#ef4444',
                      weight: 7,
                      opacity: 0.95
                    }}
                  />
                ))
              )}

              {/* DOWNSTREAM SETTLEMENTS & HYDROPOWER ASSET MARKERS */}
              {showAssets && lakeDetails.downstreamAssets && (isSelected || isWarning || isTourActive) && (
                lakeDetails.downstreamAssets.map((asset, idx) => (
                  <CircleMarker
                    key={idx}
                    center={[asset.lat, asset.lon]}
                    radius={asset.type === 'hydro_dam' ? 7 : 5}
                    pathOptions={{
                      color: asset.type === 'hydro_dam' ? '#f43f5e' : '#38bdf8',
                      fillColor: asset.type === 'hydro_dam' ? '#e11d48' : '#0284c7',
                      fillOpacity: 0.9,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1.5 text-xs min-w-[210px]">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                          <span className="font-bold text-slate-100 flex items-center space-x-1">
                            {asset.type === 'hydro_dam' ? (
                              <Zap className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Home className="w-3.5 h-3.5 text-sky-400" />
                            )}
                            <span>{asset.name}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Distance from Lake:</span>
                            <span className="font-semibold font-mono text-cyan-300">{asset.distanceKm} km</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Est. Surge Arrival:</span>
                            <span className="font-semibold font-mono text-amber-400">~{asset.arrivalMin} mins</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          {asset.notes}
                        </div>
                      </div>
                    </Popup>
                    <Tooltip direction="bottom" offset={[0, 8]} opacity={0.85}>
                      <span className="text-[10px] font-medium">{asset.name} (~{asset.arrivalMin}m)</span>
                    </Tooltip>
                  </CircleMarker>
                ))
              )}

              {/* EARLY WARNING SIREN TOWERS */}
              {showSirens && lakeDetails.sirens && (isSelected || isWarning) && (
                lakeDetails.sirens.map((siren, sIdx) => (
                  <CircleMarker
                    key={`siren-${sIdx}`}
                    center={[siren.lat, siren.lon]}
                    radius={5}
                    pathOptions={{
                      color: '#fbbf24',
                      fillColor: '#f59e0b',
                      fillOpacity: 1,
                      weight: 2
                    }}
                    className={isFloodSimActive ? 'siren-beacon' : ''}
                  >
                    <Tooltip direction="top" opacity={0.9}>
                      <div className="text-[11px] font-bold text-amber-300 flex items-center space-x-1">
                        <Volume2 className="w-3 h-3 text-amber-400" />
                        <span>{siren.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-300">Audible Siren Radius: {siren.soundRangeKm} km &bull; {siren.status}</div>
                    </Tooltip>
                  </CircleMarker>
                ))
              )}

              {/* HIGH-GROUND SAFE EVACUATION SHELTERS */}
              {showShelters && lakeDetails.shelters && (isSelected || isWarning) && (
                lakeDetails.shelters.map((shelter, shIdx) => (
                  <CircleMarker
                    key={`shelter-${shIdx}`}
                    center={[shelter.lat, shelter.lon]}
                    radius={5}
                    pathOptions={{
                      color: '#34d399',
                      fillColor: '#10b981',
                      fillOpacity: 1,
                      weight: 2
                    }}
                  >
                    <Tooltip direction="top" opacity={0.9}>
                      <div className="text-[11px] font-bold text-emerald-300 flex items-center space-x-1">
                        <Tent className="w-3 h-3 text-emerald-400" />
                        <span>{shelter.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-300">Capacity: {shelter.capacity} &bull; Safety Height: {shelter.elevGain}</div>
                    </Tooltip>
                  </CircleMarker>
                ))
              )}

              {/* SENTINEL-1 SAR RADAR SWATH FOOTPRINT */}
              {showRadarSwath && lakeDetails.sarSwath && (isSelected || isWarning) && (
                <Polygon
                  positions={lakeDetails.sarSwath}
                  className="radar-swath-anim"
                  pathOptions={{
                    color: '#c084fc',
                    fillColor: '#9333ea',
                    fillOpacity: 0.15,
                    weight: 1.5,
                    dashArray: '5, 5'
                  }}
                >
                  <Tooltip sticky>
                    <div className="text-[11px] font-bold text-purple-300">Sentinel-1 SAR C-Band Swath Footprint</div>
                    <div className="text-[10px] text-slate-300">Interferometric Wide (IW) GRD &bull; 250km Track</div>
                  </Tooltip>
                </Polygon>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* REAL GROUND-LEVEL PHOTOS & MULTI-SPECTRAL SATELLITE INSPECTION MODAL */}
      {showSatelliteModal && activeLake && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    Ground-Level & Real Satellite Imagery Inspector: {activeLake.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-Altitude Glaciology &bull; Sentinel-1 C-Band SAR &bull; Ground Truth Moraine Physics
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSatelliteModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 text-xs font-semibold">
              <button
                onClick={() => setActiveSatelliteTab('optical')}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
                  activeSatelliteTab === 'optical'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pre vs Post Disaster Satellite (Oct 2023)</span>
              </button>
              <button
                onClick={() => setActiveSatelliteTab('radar')}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
                  activeSatelliteTab === 'radar'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Sentinel-1 SAR C-Band Radar Amplitude</span>
              </button>
              <button
                onClick={() => setActiveSatelliteTab('ground')}
                className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
                  activeSatelliteTab === 'ground'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>Ground-Level Moraine Dam & Teesta III Breach</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 flex-1">
              {activeSatelliteTab === 'optical' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pre Event */}
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">Pre-Breach: Intact Lake</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Sentinel-2 (17 Sept 2023)</span>
                      </div>
                      <div className="h-56 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                          alt="Pre breach lake"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] text-slate-200 backdrop-blur-sm">
                          Surface Area: 1.68 km² &bull; Impounded Water: ~68.5 M m³
                        </div>
                      </div>
                      <div className="p-3 text-[11px] text-slate-400 leading-relaxed">
                        Moraine dam holding peak post-monsoon volume. Notice intact glacial moraine terminal rock wall and clear turquoise meltwater.
                      </div>
                    </div>

                    {/* Post Event */}
                    <div className="rounded-xl overflow-hidden border border-rose-900/60 bg-slate-950">
                      <div className="p-2.5 bg-rose-950/60 border-b border-rose-900/60 flex items-center justify-between">
                        <span className="font-bold text-rose-200 text-xs">Post-Breach: Moraine Collapse</span>
                        <span className="text-[10px] text-rose-400 font-mono">Sentinel-2 (4 Oct 2023)</span>
                      </div>
                      <div className="h-56 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
                          alt="Post breach lakebed"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-red-950/80 border border-red-800/80 px-2 py-1 rounded text-[10px] text-red-200 backdrop-blur-sm">
                          Over 60% Water Depleted &bull; Catastrophic Downstream Discharge
                        </div>
                      </div>
                      <div className="p-3 text-[11px] text-slate-400 leading-relaxed">
                        Breached natural dam following the impulse wave. Over 30 million cubic meters of water and gravel evacuated down Lhonak Chu in 25 minutes.
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-slate-200 block flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Scientific Evaluation of the 2023 South Lhonak Disaster</span>
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      A catastrophic rock-ice avalanche detached from the hanging glacier (&gt;34.5° slope) on the western headwall, triggering an estimated 25-meter impulse wave. The wave overtopped and liquefied the terminal moraine's buried ice core, triggering progressive breach erosion that devastated the Teesta basin.
                    </p>
                  </div>
                </div>
              )}

              {activeSatelliteTab === 'radar' && (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-purple-900/60 bg-slate-950">
                    <div className="p-2.5 bg-purple-950/60 border-b border-purple-900/60 flex items-center justify-between">
                      <span className="font-bold text-purple-200 text-xs">Sentinel-1 C-Band Synthetic Aperture Radar (SAR) Polarization (VV+VH)</span>
                      <span className="text-[10px] text-purple-400 font-mono">Frequency: 5.405 GHz &bull; All-Weather Penetration</span>
                    </div>
                    <div className="h-64 bg-slate-950 relative flex items-center justify-center overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
                        alt="Radar Sentinel-1"
                        className="w-full h-full object-cover filter contrast-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-purple-200">
                        <span>Water Specular Reflection: -22.4 dB (Dark)</span>
                        <span>Moraine Roughness: -6.8 dB (Bright)</span>
                        <span>Otsu Threshold Split: -16.5 dB</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-purple-300 block mb-1">1. Zero Cloud Attenuation</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        C-band microwave radar wavelengths (5.6 cm) penetrate directly through cloud tops, dense rainbands, and mountain haze.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-purple-300 block mb-1">2. Day & Night Active Radar</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Sentinel-1 transmits its own microwave pulse, allowing acquisitions during winter nights and early pre-dawn passes.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-purple-300 block mb-1">3. Automated Otsu Delineation</span>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Calm water reflects radar away (specular scatter), creating stark bimodal histograms separated cleanly by Otsu thresholding.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSatelliteTab === 'ground' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div className="p-2.5 bg-slate-900 border-b border-slate-800">
                        <span className="font-bold text-slate-200 text-xs">Moraine Dam Geomorphology & Ice Core</span>
                      </div>
                      <div className="h-52 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80"
                          alt="Himalayan moraine ground"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-amber-300">
                          Freeboard Height Deficit: &lt;14 meters
                        </div>
                      </div>
                      <div className="p-3 text-[11px] text-slate-400 leading-relaxed">
                        Moraines in the high Himalayas consist of unconsolidated glacial boulders with buried relict ice cores. As temperatures rise, the internal ice melts, creating subterranean piping channels that weaken dam integrity.
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div className="p-2.5 bg-slate-900 border-b border-slate-800">
                        <span className="font-bold text-slate-200 text-xs">Chungthang Teesta III Dam Destruction</span>
                      </div>
                      <div className="h-52 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
                          alt="Downstream destruction"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-rose-950/80 px-2 py-0.5 rounded text-[10px] text-rose-300">
                          1,200 MW Hydro Project Destroyed in 2023 Surge
                        </div>
                      </div>
                      <div className="p-3 text-[11px] text-slate-400 leading-relaxed">
                        The 60-meter high dam suffered catastrophic failure when the sediment-choked GLOF wave filled the reservoir within minutes, overtopping the spillway gates before drawdown could be completed.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-cyan-300 block">Jal Sanket Early Warning Action Mandate:</span>
                      <span className="text-slate-300 text-[11px]">
                        Provides authorities with 45–75 minutes of advance notice to sound siren towers and trigger dam reservoir drawdown.
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSatelliteModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer shrink-0 ml-3"
                    >
                      Return to Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
