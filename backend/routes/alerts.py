from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from database import db
from models import Alert

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

class AlertAcknowledgeRequest(BaseModel):
    reviewer_name: str
    validation_status: str  # e.g., "CONFIRMED_BY_GLACIOLOGIST", "FALSE_POSITIVE_WET_SNOW", "FIELD_EXPEDITION_REQUIRED"

@router.get("", response_model=List[Alert])
def get_all_alerts(acknowledged: Optional[bool] = None):
    """Retrieve all GLOF hazard alerts, with optional filter by acknowledged status."""
    if acknowledged is not None:
        return [a for a in db.alerts if a.acknowledged == acknowledged]
    return db.alerts

@router.post("/{alert_id}/acknowledge", response_model=Alert)
def acknowledge_alert(alert_id: str, payload: AlertAcknowledgeRequest):
    """Acknowledge and assign an expert glaciologist reviewer to an alert."""
    for alert in db.alerts:
        if alert.id == alert_id:
            alert.acknowledged = True
            alert.expert_reviewer = payload.reviewer_name
            alert.validation_status = payload.validation_status
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")
