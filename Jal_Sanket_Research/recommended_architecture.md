# Jal Sanket: Recommended Architecture & MVP Scope

```
+-------------------------------------------------------------+
|                      Jal Sanket Web UI                      |
| (React + Vite + Leaflet GIS + Recharts + Tailwind CSS)     |
+------------------------------+------------------------------+
                               | REST API (JSON / GeoJSON)
+------------------------------v------------------------------+
|                     FastAPI Backend Engine                  |
|  - Lake Management Service    - SAR Backscatter Processor   |
|  - Observation Pipeline       - Multi-Factor Hazard Engine  |
|  - Alert Dispatcher           - Background Processing Jobs  |
+------------------------------+------------------------------+
                               | In-Memory / SQLite ORM
+------------------------------v------------------------------+
|                    Geospatial Storage                       |
|  - Himalayan Lake Catalog     - Temporal SAR Time Series    |
|  - Multi-Orbit Observations   - Alert Log & Audit Trail     |
+-------------------------------------------------------------+
```
