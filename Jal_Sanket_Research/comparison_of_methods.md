# Jal Sanket: Comparison of Methods and Existing Systems

## 1. Lake Delineation Approaches
- **Optical Index (NDWI / MNDWI):** Excellent contrast on clear days, but completely blinded by Himalayan monsoons and high mountain fog.
- **Radar Backscatter (SAR VV / VH):** Low backscatter (< -16 dB) over specular water surfaces allows all-weather, day-and-night observation. Challenge: wet snow and terrain shadows mimic water backscatter. Jal Sanket mitigates this via Copernicus DEM slope filtering.
- **Deep Learning / U-Net:** High accuracy but requires extensive ground truth and heavy GPU compute.

## 2. Existing Platforms
- **NASA HMA Cryosphere Portal:** High quality scientific repository, but lacks real-time automated alerts.
- **ICIMOD GLOF Early Warning Pilots:** Focuses on in-situ sensor networks (water level sensors, acoustic sirens) at high capital expense ($500k+ per lake).
- **Jal Sanket Advantage:** Software-only, zero-hardware cost, basin-scale coverage across India, Nepal, and Bhutan.
