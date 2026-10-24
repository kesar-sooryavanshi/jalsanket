from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from database import db
from models import Observation

router = APIRouter(prefix="/api/observations", tags=["Observations"])

@router.get("", response_model=List[Observation])
def get_all_observations(lake_id: Optional[str] = None):
    """Retrieve observation time-series records, optionally filtered by lake_id."""
    if lake_id:
        if lake_id not in db.observations:
            raise HTTPException(status_code=404, detail="No observations found for this lake")
        return db.observations[lake_id]
    
    # Return all flattened observations
    all_obs = []
    for obs_list in db.observations.values():
        all_obs.extend(obs_list)
    # Sort descending by timestamp
    all_obs.sort(key=lambda x: x.timestamp, reverse=True)
    return all_obs

@router.get("/{lake_id}/latest", response_model=Observation)
def get_latest_observation(lake_id: str):
    """Get the most recent satellite observation for a given lake."""
    if lake_id not in db.observations or not db.observations[lake_id]:
        raise HTTPException(status_code=404, detail="No observations for this lake")
    # Return last observation
    return db.observations[lake_id][-1]
