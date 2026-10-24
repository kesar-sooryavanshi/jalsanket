from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from database import db
from models import LakeBase

router = APIRouter(prefix="/api/lakes", tags=["Lakes"])

@router.get("", response_model=List[LakeBase])
def get_all_lakes():
    """Retrieve all monitored Himalayan glacial lakes."""
    return list(db.lakes.values())

@router.get("/geojson")
def get_lakes_geojson():
    """Returns all lakes formatted as standard GeoJSON FeatureCollection for GIS map rendering."""
    features = []
    for lake in db.lakes.values():
        features.append({
            "type": "Feature",
            "id": lake.id,
            "geometry": {
                "type": lake.geometry.type,
                "coordinates": lake.geometry.coordinates
            },
            "properties": {
                "id": lake.id,
                "name": lake.name,
                "region": lake.region,
                "country": lake.country,
                "elevation_m": lake.elevation_m,
                "current_area_km2": lake.current_area_km2,
                "volume_est_million_m3": lake.volume_est_million_m3,
                "freeboard_height_m": lake.freeboard_height_m,
                "steep_ice_slope_deg": lake.steep_ice_slope_deg,
                "parent_glacier": lake.parent_glacier,
                "latitude": lake.latitude,
                "longitude": lake.longitude
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/{lake_id}", response_model=LakeBase)
def get_lake(lake_id: str):
    """Retrieve a single lake record by ID."""
    if lake_id not in db.lakes:
        raise HTTPException(status_code=404, detail="Lake not found")
    return db.lakes[lake_id]
