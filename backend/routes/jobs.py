from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from pydantic import BaseModel
import uuid
from datetime import datetime
from database import db
from models import ProcessingJob
from sar_engine import sar_service

router = APIRouter(prefix="/api/jobs", tags=["Processing Jobs"])

class TriggerSARJobRequest(BaseModel):
    lake_id: str
    orbit_direction: str = "Ascending"

def run_sar_pipeline_simulation(job_id: str, lake_id: str, orbit: str):
    """Executes SAR ingestion and appends new observation to database."""
    # Find job
    job = next((j for j in db.jobs if j.id == job_id), None)
    if not job or lake_id not in db.lakes:
        return
    
    lake = db.lakes[lake_id]
    # Perform SAR processing
    new_obs = sar_service.process_sentinel1_acquisition(lake, orbit=orbit)
    
    # Update lake area
    lake.current_area_km2 = new_obs.area_km2
    db.observations[lake_id].append(new_obs)
    
    # Mark job complete
    job.status = "COMPLETED"
    job.progress_percent = 100
    job.completed_at = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    job.output_summary = (
        f"Successfully ingested Sentinel-1 SAR pass ({orbit}). "
        f"Delineated lake area: {new_obs.area_km2} km2. "
        f"Mean VV Backscatter: {new_obs.mean_backscatter_vv_db} dB. QA Flag: {new_obs.qa_flag}."
    )

@router.get("", response_model=List[ProcessingJob])
def get_all_jobs():
    """List recent satellite processing jobs."""
    # Return latest jobs first
    return sorted(db.jobs, key=lambda j: j.started_at, reverse=True)

@router.post("/trigger", response_model=ProcessingJob)
def trigger_sar_processing_job(payload: TriggerSARJobRequest, background_tasks: BackgroundTasks):
    """Trigger a new Sentinel-1 SAR acquisition processing job for a lake."""
    if payload.lake_id not in db.lakes:
        raise HTTPException(status_code=404, detail="Lake not found")

    job_id = f"job-{uuid.uuid4().hex[:8]}"
    new_job = ProcessingJob(
        id=job_id,
        lake_id=payload.lake_id,
        job_type="SENTINEL1_SAR_INGESTION",
        status="RUNNING",
        progress_percent=45,
        started_at=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        output_summary="Downloading Sentinel-1 C-Band SLC/GRD granule and applying Lee speckle filtering..."
    )
    db.jobs.append(new_job)

    # Run in background
    background_tasks.add_task(run_sar_pipeline_simulation, job_id, payload.lake_id, payload.orbit_direction)
    return new_job
