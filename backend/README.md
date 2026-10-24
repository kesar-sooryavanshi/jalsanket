# Jal Sanket Backend API

Python FastAPI REST API for the **Jal Sanket** Himalayan Glacial Lake Outburst Flood (GLOF) Early-Warning Decision Support System.

## Features
- **Lake Catalogue & GeoJSON Service:** Real geometry and geomorphological metrics for high-risk Himalayan lakes (South Lhonak, Imja Tsho, Tsho Rolpa, Thorthormi, Ghepang Gath, Gangabal).
- **Sentinel-1 SAR C-Band Engine:** Backscatter extraction (VV+VH), Otsu adaptive water thresholding, terrain shadow QA filtering, and speckle reduction.
- **Multi-Factor GLOF Risk Engine:** Incorporates lake area expansion, avalanche slope hazard (>30°), freeboard deficit, SAR coherence loss, and downstream vulnerability.
- **Alert Management:** Provisional hazard classification (Normal, Advisory, Watch, Warning) with expert reviewer acknowledgment.
- **Satellite Ingestion Jobs:** Asynchronous background jobs simulating repeat-pass satellite telemetry.
- **Safe Fallback Mode:** Operates fully without requiring third-party credentials or Earth Engine private keys, clearly marked as `SYNTHETIC_FALLBACK`.

## Running the Backend
```bash
# From the backend directory
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Interactive Swagger docs available at: `http://localhost:8000/docs`

## Automated Test Suite
```bash
python test_backend.py
```
