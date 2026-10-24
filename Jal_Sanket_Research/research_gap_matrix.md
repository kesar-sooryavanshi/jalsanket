# Jal Sanket: Research Gap Matrix

| Area | Current Research State | Gaps Identified | Jal Sanket Contribution |
|---|---|---|---|
| **Data Ingestion** | Mostly manual optical imagery downloads (USGS EarthExplorer) | Delayed updates, blind during monsoon cloud periods | Automated Sentinel-1 SAR GRD ingestion with fallback |
| **Lake Boundary Delineation** | NDWI/MNDWI optical indices | Fails during cloud cover and shadow | Otsu adaptive radar thresholding on C-band VV polarization |
| **Hazard Metric** | Static lake area expansion (>15%, >30%) | Ignores moraine geotechnical status and avalanche triggers | Multi-factor risk engine incorporating glacier slope & freeboard |
| **System Delivery** | Static academic journal papers and shapefiles | No actionable dashboard for hydrologists or disaster officers | Modern responsive full-stack GIS dashboard with REST API |
