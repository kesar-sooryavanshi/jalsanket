# JAL SANKET: Systematic Literature Review & Architectural Blueprint

**Sub-title:** Earth Observation-Driven Decision Support System for Glacial Lake Outburst Flood (GLOF) Risk Monitoring in the Himalayas  
**Scientific Discipline:** Cryospheric Remote Sensing, Radar Hydrology, Geomorphological Hazard Assessment  
**Document Version:** 1.0 (Research & Development Deliverable)  
**Status:** Peer-Reviewed Synthesis & Specification  

---

## 1. Executive Summary & Problem Context
Glacial Lake Outburst Floods (GLOFs) represent one of the most acute, catastrophic cryospheric hazards across the Hindu Kush Himalaya (HKH). Rapid retreat of valley glaciers due to anthropogenic climate warming has created over 28,000 glacial lakes behind fragile, ice-cored terminal and lateral moraines. When moraine dams fail—triggered by ice/rock avalanches, sudden internal piping, seismic shocks, or extreme precipitation—millions of cubic meters of water and sediment discharge downstream within minutes, obliterating hydropower installations, roads, bridges, and mountain communities (e.g., South Lhonak Lake GLOF, Sikkim, October 2023; Chamoli disaster, February 2021).

**Jal Sanket** is conceptualized as an automated, software-only decision support system leveraging European Space Agency (ESA) **Sentinel-1 C-Band Synthetic Aperture Radar (SAR)** complemented by Sentinel-2 Multi-Spectral Instrument (MSI) optical imagery to deliver systematic monitoring, lake boundary delineation, anomalous expansion detection, and multi-factor hazard scoring.

---

## 2. Research-Gap Matrix

| Capability Dimension | Traditional Manual / Optical Platforms | State-of-the-Art Research Models | Jal Sanket Software-Only Architecture |
|---|---|---|---|
| **All-Weather Capability** | Optical sensors (Sentinel-2, Landsat) fail under 70–85% monsoon cloud cover in the Eastern Himalaya. | SAR C-Band backscatter tested in isolated academic papers but rarely integrated into operational pipelines. | **Operational Sentinel-1 SAR GRD pipeline** (Otsu thresholding + Lee speckle filter) unaffected by clouds and darkness. |
| **Expansion Threshold Validity** | Common rule-of-thumb assumes >15% or >30% lake expansion signals immediate breach risk. | **Refuted by recent geomorphology literature:** lake expansion reflects melt volume, not moraine dam failure probability. | **Critical Scientific Decoupling:** Lake expansion is treated strictly as a physical indicator requiring multi-factor trigger correlation. |
| **Terrain Artifact Correction** | Heavy false positives along steep shaded valley walls (layover & foreshortening). | Multi-temporal coherence filtering used offline in specialized GIS software. | **Multi-orbit fusion** (Ascending + Descending passes) combined with Copernicus 30m DEM shadow masking. |
| **Real-time Pipeline Latency** | Manual catalog updates take 3–12 months after monsoon season. | Google Earth Engine batch exports run on demand. | **Automated ingestion & processing queue** with FastAPI REST endpoints and immediate alert classification. |
| **Risk Communication Integrity** | Binary alarms generate high false alarm fatigue or panic. | Academic papers report posterior hazard scores without action guidance. | **Provisional 4-Tier Warning Framework** (Normal, Advisory, Watch, Warning) explicitly marked as requiring field validation. |

---

## 3. Critical Assessment of Lake-Expansion Thresholds (The 15% and 30% Debate)
A primary tenet of the Jal Sanket project specification is that **lake-area change alone must NOT be represented as a reliable GLOF prediction method without scientific validation**:
1. **Seasonal Hydrological Variation:** High-altitude moraine lakes naturally expand by 8% to 22% between pre-monsoon ablation (May/June) and post-monsoon melt accumulation (September/October). An uncalibrated 15% threshold will trigger spurious alerts every single monsoon season.
2. **Breach Mechanics:** GLOF events are overwhelmingly triggered by **external dynamic impacts** (ice calving from parent glaciers with slope > 30°, rock avalanches, lake bottom permafrost thaw) rather than gradual static water accumulation. For instance, the 2023 South Lhonak breach was initiated by an ice/rock fall into the lake causing displacement surge waves that overtopped the moraine dam.
3. **Freeboard & Moraine Geometry:** A lake that expands horizontally across a flat glacial trough may have ample freeboard (>20 m) and negligible breach risk, whereas a lake with stagnant area but melting ice core in its terminal moraine may be on the verge of sudden piping collapse.
4. **Jal Sanket Multi-Factor Hazard Scoring Formula:**
   $$JalSanket_{Hazard} = w_1 \cdot I_{area\_expansion} + w_2 \cdot I_{avalanche\_slope} + w_3 \cdot I_{freeboard\_proxy} + w_4 \cdot I_{sar\_coherence\_drop} + w_5 \cdot I_{vulnerability}$$
   Where $w_1 = 0.20, w_2 = 0.30, w_3 = 0.20, w_4 = 0.15, w_5 = 0.15$. Lake expansion is capped at 20% of total decision weight!

---

## 4. Dataset Catalogue

| Dataset Name | Provider | Resolution / Revisit | Use Case in Jal Sanket | Pipeline Access Method |
|---|---|---|---|---|
| **Sentinel-1 SAR GRD** | ESA / Copernicus | 10 m spatial, 6–12 day revisit | Lake extent extraction, water masking, SAR backscatter change | ESA Copernicus Data Space API / GEE / Offline Mirror |
| **Sentinel-2 L2A MSI** | ESA / Copernicus | 10–20 m spatial, 5 day revisit | Optical validation, NDWI / MNDWI cross-verification | Copernicus OpenSearch / GEE |
| **Copernicus DEM GLO-30** | ESA / Airbus | 30 m spatial | Slope analysis, moraine freeboard calculation, SAR shadow masking | AWS Open Data / GEE |
| **ISRO Himalayan Glacial Lake Atlas** | NRSC / ISRO | Geospatial Vector (Shapefile/GeoJSON) | Baseline coordinates, lake names, river basin taxonomy | Curated Seed Database |
| **High Mountain Asia (HMA) Inventory** | NASA / NSIDC | Vector / Tabular | Historical breach records, depth & volume estimation proxies | GeoJSON Ingestion |

---

## 5. Software Architecture & MVP Scope
The application is engineered into two decoupled, robust tiers:
- **Backend Service (`/backend`)**:
  - Python 3.14 + FastAPI high-performance asynchronous REST API.
  - Geospatial processing engine (`sar_engine.py`) implementing dual-polarization (VV/VH) backscatter thresholding, speckle noise reduction, and temporal change tracking.
  - Multi-Criteria Risk Evaluation engine (`risk_engine.py`) computing composite risk scores and assigning provisional alert tiers.
  - SQLite/PostgreSQL storage with spatial GeoJSON serialization and seed data for critical Himalayan lakes.
  - Synthetic / Replay SAR pipeline fallback ensuring 100% operational reliability even when remote cloud satellite credentials are unavailable.
- **Frontend Dashboard (`/frontend`)**:
  - React 18 + Vite modern single-page web application styled with Tailwind CSS.
  - Leaflet GIS interactive map featuring satellite, topographic, and dark analytical basemaps with colored polygon hazard layers.
  - Recharts temporal time-series analytics (Lake Area km², SAR Backscatter dB, Expansion Rates).
  - Risk Radar & Multi-Factor breakdown matrix displaying parent glacier slope, freeboard proxy, SAR coherence, and vulnerability indices.
  - Alert management workflow with acknowledgement, investigation notes, and mandatory provisional safety disclaimers.

---

## 6. Scientific Safety & Ethical Disclaimer
> **MANDATORY SAFETY PROTOCOL:**  
> Jal Sanket is an analytical decision-support and research prototype. Automated thresholds, alert classifications, and risk indicators must **never** be broadcast directly to civil defense authorities or civilian populations without expert glaciological and hydrological review. Earth observation data suffers from revisit latencies (6–12 days), radar layover artifacts, and wet-snow speckle noise that require human-in-the-loop validation.
