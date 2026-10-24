from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from database import db
from models import MultiFactorRiskResult
from risk_engine import GLOFRiskEngine

router = APIRouter(prefix="/api/analysis", tags=["Risk Analysis"])

@router.get("/lake/{lake_id}", response_model=MultiFactorRiskResult)
def evaluate_lake_risk(lake_id: str):
    """
    Perform on-demand multi-criteria scientific GLOF risk evaluation for a specific lake.
    Evaluates lake expansion, hanging ice slope, freeboard, SAR coherence and downstream assets.
    """
    if lake_id not in db.lakes:
        raise HTTPException(status_code=404, detail="Lake not found")
    
    lake = db.lakes[lake_id]
    latest_obs = db.observations[lake_id][-1]
    
    return GLOFRiskEngine.evaluate(lake, latest_obs)

@router.get("/summary")
def get_basin_risk_summary():
    """Returns aggregated hazard breakdown across all monitored Himalayan lakes."""
    results = []
    level_counts = {"NORMAL": 0, "ADVISORY": 0, "WATCH": 0, "WARNING": 0}
    
    for lake_id, lake in db.lakes.items():
        latest_obs = db.observations[lake_id][-1]
        eval_res = GLOFRiskEngine.evaluate(lake, latest_obs)
        results.append(eval_res)
        level_counts[eval_res.risk_level.value] += 1
        
    return {
        "total_monitored_lakes": len(db.lakes),
        "level_breakdown": level_counts,
        "lake_evaluations": results,
        "policy_advisory": "All indicators are provisional decision-support metrics. Field and glaciological validation required before public notification."
    }
