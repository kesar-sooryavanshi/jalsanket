# JAL SANKET (जल संकेत) 2.0
### Himalayan Glacial Lake Outburst Flood (GLOF) Early-Warning Decision Support System

An end-to-end, software-only decision support application powered by **Copernicus Sentinel-1 C-Band Synthetic Aperture Radar (SAR)** observations, multi-criteria hazard evaluation, and interactive GIS analytics for high-risk Himalayan glacial lakes.

---

## 🏔 Project Overview & Architecture

```
                                  JAL SANKET
+-----------------------------------------------------------------------------------+
|               Frontend (/frontend): React 19 + Tailwind v4 + Leaflet GIS          |
|  - Interactive Himalayan GIS Map (Satellite / Topo / Dark Basemap Toggles)        |
|  - Multi-Temporal Area & Backscatter Time-Series Visualizations (Recharts)        |
|  - Multi-Criteria Analytical Hierarchy Process (AHP) Risk Breakdown               |
|  - Provisional Alert Center with Expert Glaciologist Sign-Off Protocol            |
|  - On-Demand Sentinel-1 SAR Acquisition Ingestion Dispatcher                      |
+------------------------------------------+----------------------------------------+
                                           | REST API (JSON / GeoJSON)
+------------------------------------------v----------------------------------------+
|                Backend (/backend): Python 3.14 + FastAPI + Pydantic               |
|  - /api/lakes: Lake catalogue & GeoJSON polygons for critical Himalayan lakes    |
|  - /api/observations: Multi-temporal SAR VV/VH & Optical acquisitions             |
|  - /api/analysis: Decoupled Multi-Factor GLOF Risk Evaluation Engine              |
|  - /api/alerts: Provisional hazard triage, acknowledgements & audit log           |
|  - /api/jobs: Asynchronous satellite processing & Otsu thresholding pipeline      |
|  - /api/system: Data mode indicators (Live vs Synthetic Fallback) & health        |
+-----------------------------------------------------------------------------------+
```

---

## 🔬 Scientific & Safety Principles (Page 1 & 2 Adherence)
1. **Area Expansion Decoupling:** Lake-area change alone is **never** presented as a reliable GLOF prediction method. High-altitude glacial lakes naturally expand by 8% to 22% during seasonal summer melt.
2. **Dynamic Trigger Primacy:** Primary weight (30%) is allocated to parent glacier hanging ice slope hazards (>30°), which induce catastrophic impulse waves (as occurred in the South Lhonak disaster, October 2023).
3. **Mandatory Provisional Status:** All automated metrics are tagged with `is_provisional = True`. No emergency alarms are broadcast directly to the public without accredited glaciological validation.

---

## 📂 Deliverables Structure

```
orbitron-2.0/
├── Jal_Sanket_Research/            # Phase 1: Research & Literature Review
│   ├── LITERATURE_REVIEW.md       # Comprehensive scientific literature review
│   ├── LITERATURE_REVIEW.pdf      # Formatted publication-ready PDF
│   ├── LITERATURE_REVIEW.docx     # Formatted Word Document
│   ├── paper_inventory.csv        # Verified paper inventory with DOIs
│   ├── References.bib             # BibTeX reference collection
│   ├── research_gap_matrix.md     # Gap analysis across existing systems
│   ├── comparison_of_methods.md   # Optical vs SAR vs in-situ comparisons
│   └── recommended_architecture.md# Technical specification & formula
├── backend/                       # Phase 2: FastAPI REST API Engine
│   ├── main.py                    # Server entrypoint & CORS configuration
│   ├── models.py                  # Pydantic schemas (Lakes, Obs, Alerts, Risk)
│   ├── database.py                # Pre-seeded database with Himalayan lakes
│   ├── sar_engine.py              # SAR backscatter & Otsu thresholding engine
│   ├── risk_engine.py             # Multi-factor scientific GLOF risk scorer
│   ├── test_backend.py            # Automated test suite (100% passing)
│   ├── requirements.txt           # Python dependencies
│   └── routes/                    # Modular REST endpoints
└── frontend/                      # Phase 2: React + Leaflet GIS Dashboard
    ├── src/
    │   ├── App.jsx                # Main single-page application
    │   ├── api.js                 # Backend REST client
    │   └── components/            # UI Components (GISMap, Charts, Alerts, etc.)
    ├── vite.config.js             # Vite 8 config with Tailwind v4 & proxy
    └── package.json               # Frontend dependencies
```

---

## 🚀 Quickstart & Run Instructions

You can run everything directly from the project root or inside the individual folders:

### Option A: From Project Root (Recommended)

1. **Install dependencies:**
```bash
npm install
npm install --prefix frontend
python -m pip install -r backend/requirements.txt
```

2. **Run Backend & Frontend concurrently:**
```bash
npm run dev:all
```
Or run individually from root:
- Frontend: `npm run dev` (available at [http://127.0.0.1:5173/](http://127.0.0.1:5173/))
- Backend API: `npm run backend` (docs at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs))
- Backend Tests: `npm run test:backend`

---

### Option B: From Subdirectories

#### 1. Backend API
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --host 127.0.0.1 --reload
```
* Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Run Backend Tests: `python test_backend.py`

#### 2. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
* Open in browser: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
