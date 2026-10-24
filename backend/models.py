from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    NORMAL = "NORMAL"
    ADVISORY = "ADVISORY"
    WATCH = "WATCH"
    WARNING = "WARNING"

class DataSourceType(str, Enum):
    LIVE_SENTINEL_1 = "LIVE_SENTINEL_1"
    HISTORICAL = "HISTORICAL"
    SYNTHETIC_FALLBACK = "SYNTHETIC_FALLBACK"

class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class LakeBase(BaseModel):
    id: str
    name: str
    region: str
    country: str
    latitude: float
    longitude: float
    elevation_m: float
    parent_glacier: str
    moraine_type: str
    geometry: GeoJSONGeometry
    initial_area_km2: float
    current_area_km2: float
    volume_est_million_m3: float
    freeboard_height_m: float
    steep_ice_slope_deg: float
    downstream_settlements: List[str]
    critical_infrastructure: List[str]

class Observation(BaseModel):
    id: str
    lake_id: str
    timestamp: str
    sensor: str  # Sentinel-1 SAR (IW GRD) or Sentinel-2 MSI
    orbit_direction: str  # Ascending or Descending
    polarization: str  # VV+VH
    area_km2: float
    expansion_percentage_from_baseline: float
    mean_backscatter_vv_db: float
    coherence_index: float  # 0.0 to 1.0
    speckle_noise_sigma: float
    cloud_cover_percent: float  # 0% for SAR, >0% for Optical
    qa_flag: str  # PASS, TERRAIN_SHADOW_CAUTION, WET_SNOW_SUSPECT
    data_source: DataSourceType

class MultiFactorRiskResult(BaseModel):
    lake_id: str
    lake_name: str
    timestamp: str
    composite_hazard_score: float  # 0 to 100
    risk_level: RiskLevel
    is_provisional: bool = True
    area_expansion_score: float  # 0 to 100
    steep_slope_score: float
    freeboard_score: float
    sar_coherence_drop_score: float
    downstream_vulnerability_score: float
    trigger_summary: str
    scientific_notes: str
    recommended_action: str

class Alert(BaseModel):
    id: str
    lake_id: str
    lake_name: str
    created_at: str
    level: RiskLevel
    title: str
    description: str
    composite_score: float
    is_provisional: bool = True
    acknowledged: bool = False
    expert_reviewer: Optional[str] = None
    validation_status: str = "PENDING_GLACIOLOGIST_CONFIRMATION"

class ProcessingJob(BaseModel):
    id: str
    lake_id: str
    job_type: str  # "SENTINEL1_SAR_INGESTION" | "EXPANSION_CHANGE_DETECTION"
    status: str  # "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED"
    progress_percent: int
    started_at: str
    completed_at: Optional[str] = None
    output_summary: Optional[str] = None

class SystemHealth(BaseModel):
    status: str
    sentinel_1_pipeline: str
    sentinel_2_pipeline: str
    gee_connector: str
    data_mode: DataSourceType
    monitored_lakes_count: int
    active_alerts_count: int
    last_satellite_ingest: str
    scientific_disclaimer: str
