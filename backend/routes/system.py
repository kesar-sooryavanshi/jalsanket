from fastapi import APIRouter
from datetime import datetime
from database import db
from models import SystemHealth, DataSourceType
from sar_engine import sar_service

router = APIRouter(prefix="/api/system", tags=["System Status"])

@router.get("/status", response_model=SystemHealth)
def get_system_status():
    """Retrieve operational status, data source indicators, and scientific safety disclaimers."""
    active_alerts = len([a for a in db.alerts if not a.acknowledged])
    return SystemHealth(
        status="OPERATIONAL",
        sentinel_1_pipeline="ACTIVE (Sentinel-1 C-Band SAR GRD)",
        sentinel_2_pipeline="STANDBY (Optical Cloud-Free Complement)",
        gee_connector="FALLBACK_SIMULATION (Earth Engine credentials not provisioned; using high-fidelity offline Himalayan cryosphere telemetry)",
        data_mode=DataSourceType.SYNTHETIC_FALLBACK if sar_service.fallback_mode else DataSourceType.LIVE_SENTINEL_1,
        monitored_lakes_count=len(db.lakes),
        active_alerts_count=active_alerts,
        last_satellite_ingest=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        scientific_disclaimer=(
            "Jal Sanket is a scientific decision-support prototype. "
            "Lake area expansion thresholds (15%/30%) are provisional indicators and do NOT alone constitute confirmed GLOF warnings. "
            "All hazard levels require glaciological inspection before public issuance."
        )
    )
