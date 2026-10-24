import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from models import LakeBase, Observation, MultiFactorRiskResult, Alert, ProcessingJob, RiskLevel, DataSourceType, GeoJSONGeometry

# In-Memory & File backed database store for Jal Sanket
class InMemoryDB:
    def __init__(self):
        self.lakes: Dict[str, LakeBase] = {}
        self.observations: Dict[str, List[Observation]] = {}
        self.alerts: List[Alert] = []
        self.jobs: List[ProcessingJob] = []
        self._seed_data()

    def _seed_data(self):
        # 1. South Lhonak Lake (Sikkim)
        lhonak_geom = GeoJSONGeometry(
            coordinates=[[
                [88.188, 27.915], [88.204, 27.918], [88.212, 27.909],
                [88.205, 27.898], [88.192, 27.902], [88.188, 27.915]
            ]]
        )
        lhonak = LakeBase(
            id="lake-south-lhonak",
            name="South Lhonak Lake",
            region="North Sikkim (Teesta Basin)",
            country="India",
            latitude=27.9085,
            longitude=88.1983,
            elevation_m=5200.0,
            parent_glacier="South Lhonak Glacier",
            moraine_type="End moraine with degrading ice-core",
            geometry=lhonak_geom,
            initial_area_km2=0.85,
            current_area_km2=1.38,
            volume_est_million_m3=68.5,
            freeboard_height_m=14.0,
            steep_ice_slope_deg=34.5,
            downstream_settlements=["Chungthang", "Mangan", "Singtam", "Rangpo"],
            critical_infrastructure=["Teesta III Hydroelectric Dam (1200MW)", "Indo-Tibetan Border Road"]
        )
        self.lakes[lhonak.id] = lhonak

        # 2. Imja Tsho (Everest Region)
        imja_geom = GeoJSONGeometry(
            coordinates=[[
                [86.918, 27.905], [86.938, 27.907], [86.942, 27.898],
                [86.924, 27.895], [86.918, 27.905]
            ]]
        )
        imja = LakeBase(
            id="lake-imja-tsho",
            name="Imja Tsho",
            region="Khumbu, Sagarmatha",
            country="Nepal",
            latitude=27.9015,
            longitude=86.9285,
            elevation_m=5010.0,
            parent_glacier="Imja / Lhotse Shar Glacier",
            moraine_type="Massive debris-covered lateral-terminal moraine",
            geometry=imja_geom,
            initial_area_km2=0.48,
            current_area_km2=1.35,
            volume_est_million_m3=78.2,
            freeboard_height_m=32.0,
            steep_ice_slope_deg=28.0,
            downstream_settlements=["Dingboche", "Pangboche", "Namche Bazaar", "Lukla"],
            critical_infrastructure=["Lukla Tenzing-Hillary Airport Valley Access", "Trekking Suspension Bridges"]
        )
        self.lakes[imja.id] = imja

        # 3. Tsho Rolpa (Rolwaling)
        tsho_geom = GeoJSONGeometry(
            coordinates=[[
                [86.468, 27.865], [86.502, 27.868], [86.505, 27.859],
                [86.471, 27.856], [86.468, 27.865]
            ]]
        )
        tsho = LakeBase(
            id="lake-tsho-rolpa",
            name="Tsho Rolpa",
            region="Dolakha (Rolwaling Valley)",
            country="Nepal",
            latitude=27.8618,
            longitude=86.4850,
            elevation_m=4580.0,
            parent_glacier="Trakarding Glacier",
            moraine_type="High-hazard moraine dam with artificial spillway",
            geometry=tsho_geom,
            initial_area_km2=0.72,
            current_area_km2=1.54,
            volume_est_million_m3=85.0,
            freeboard_height_m=18.0,
            steep_ice_slope_deg=31.2,
            downstream_settlements=["Na", "Beding", "Simigaon", "Tamakoshi valley"],
            critical_infrastructure=["Upper Tamakoshi Hydropower Project (456MW)", "Khimti Power Transmission"]
        )
        self.lakes[tsho.id] = tsho

        # 4. Thorthormi Lake (Bhutan)
        thor_geom = GeoJSONGeometry(
            coordinates=[[
                [90.231, 28.118], [90.252, 28.121], [90.258, 28.112],
                [90.236, 28.109], [90.231, 28.118]
            ]]
        )
        thor = LakeBase(
            id="lake-thorthormi",
            name="Thorthormi Lake",
            region="Lunana (Pho Chhu Basin)",
            country="Bhutan",
            latitude=28.1150,
            longitude=90.2450,
            elevation_m=4428.0,
            parent_glacier="Thorthormi Glacier",
            moraine_type="Unstable supraglacial ponds coalescing across ice core",
            geometry=thor_geom,
            initial_area_km2=1.12,
            current_area_km2=3.42,
            volume_est_million_m3=115.0,
            freeboard_height_m=12.0,
            steep_ice_slope_deg=37.0,
            downstream_settlements=["Thanza", "Punākha", "Wangdue Phodrang"],
            critical_infrastructure=["Punakha Dzong Heritage Complex", "Punatsangchhu-I Hydropower Plant"]
        )
        self.lakes[thor.id] = thor

        # 5. Ghepang Gath (Himachal Pradesh)
        ghep_geom = GeoJSONGeometry(
            coordinates=[[
                [77.165, 32.482], [77.185, 32.485], [77.191, 32.476],
                [77.170, 32.473], [77.165, 32.482]
            ]]
        )
        ghep = LakeBase(
            id="lake-ghepang-gath",
            name="Ghepang Gath Lake",
            region="Lahaul and Spiti (Chandra Basin)",
            country="India",
            latitude=32.4789,
            longitude=77.1780,
            elevation_m=4080.0,
            parent_glacier="Ghepang Gath Glacier",
            moraine_type="Terminal moraine with active seepage channels",
            geometry=ghep_geom,
            initial_area_km2=0.25,
            current_area_km2=0.69,
            volume_est_million_m3=24.1,
            freeboard_height_m=16.0,
            steep_ice_slope_deg=33.0,
            downstream_settlements=["Sissu", "Koksar", "Tandi"],
            critical_infrastructure=["Atal Tunnel North Portal Access Highway", "Chandra River Bridges"]
        )
        self.lakes[ghep.id] = ghep

        # 6. Gangabal Lake (Kashmir)
        gang_geom = GeoJSONGeometry(
            coordinates=[[
                [74.912, 34.435], [74.938, 34.439], [74.945, 34.428],
                [74.918, 34.424], [74.912, 34.435]
            ]]
        )
        gang = LakeBase(
            id="lake-gangabal",
            name="Gangabal Lake",
            region="Ganderbal (Sind Basin, Kashmir)",
            country="India",
            latitude=34.4312,
            longitude=74.9287,
            elevation_m=3570.0,
            parent_glacier="Harmukh Mountain Ice Apron",
            moraine_type="Stable bedrock-moraine natural bowl",
            geometry=gang_geom,
            initial_area_km2=1.45,
            current_area_km2=1.52,
            volume_est_million_m3=45.0,
            freeboard_height_m=48.0,
            steep_ice_slope_deg=18.5,
            downstream_settlements=["Naranag", "Kangan", "Wangath"],
            critical_infrastructure=["Upper Sind Hydro Electric Project", "National Highway NH-1D"]
        )
        self.lakes[gang.id] = gang

        # Seed realistic Sentinel-1 & Sentinel-2 observations over time
        for lake_id, lake in self.lakes.items():
            self.observations[lake_id] = self._generate_observations_for_lake(lake)

        # Seed sample active alerts
        self.alerts.append(
            Alert(
                id="alt-001",
                lake_id=lhonak.id,
                lake_name=lhonak.name,
                created_at="2026-10-18T06:14:22Z",
                level=RiskLevel.WARNING,
                title="Critical Moraine Disturbance & Rapid Expansion Advisory",
                description="Sentinel-1 SAR C-band pass detected -19.4 dB water backscatter anomaly with 18.2% seasonal area expansion and significant coherence drop along the northwestern hanging ice cliff.",
                composite_score=84.5,
                is_provisional=True,
                acknowledged=False,
                validation_status="UNDER_FIELD_INVESTIGATION"
            )
        )
        self.alerts.append(
            Alert(
                id="alt-002",
                lake_id=thor.id,
                lake_name=thor.name,
                created_at="2026-10-20T11:45:00Z",
                level=RiskLevel.WATCH,
                title="Supraglacial Pond Coalescence Watch",
                description="Multi-temporal SAR coherence drop across Lunana moraine bridge between Thorthormi and Raphstreng. Provisional alert.",
                composite_score=72.0,
                is_provisional=True,
                acknowledged=True,
                expert_reviewer="Dr. Tenzing Norbu (DGM Bhutan)",
                validation_status="CONFIRMED_AWAITING_EXPEDITION"
            )
        )
        self.alerts.append(
            Alert(
                id="alt-003",
                lake_id=ghep.id,
                lake_name=ghep.name,
                created_at="2026-10-22T08:30:15Z",
                level=RiskLevel.ADVISORY,
                title="Moderate Post-Monsoon Melt Swell",
                description="Lake area increased by 11.4% following elevated autumn temperatures. Moraine freeboard remains 16m. Re-evaluate on next pass.",
                composite_score=53.2,
                is_provisional=True,
                acknowledged=False,
                validation_status="ROUTINE_MONITORING"
            )
        )

        # Seed initial job history
        self.jobs.append(
            ProcessingJob(
                id="job-init-s1-01",
                lake_id=lhonak.id,
                job_type="SENTINEL1_SAR_INGESTION",
                status="COMPLETED",
                progress_percent=100,
                started_at="2026-10-22T04:00:00Z",
                completed_at="2026-10-22T04:04:12Z",
                output_summary="Processed Copernicus Sentinel-1 GRD IW ascending pass 121. Delineated 1.38 km2 water surface."
            )
        )

    def _generate_observations_for_lake(self, lake: LakeBase) -> List[Observation]:
        obs_list = []
        # Generate 8 time-series points over the last 12 months
        base_date = datetime(2026, 1, 15)
        area_step = (lake.current_area_km2 - lake.initial_area_km2) / 8.0
        
        for i in range(9):
            obs_date = base_date + timedelta(days=i * 40)
            area = round(lake.initial_area_km2 + (area_step * i), 3)
            exp_pct = round(((area - lake.initial_area_km2) / lake.initial_area_km2) * 100, 2)
            
            # SAR VV backscatter over deep glacial water is typically -18 to -23 dB
            # High coherence over bedrock, low over moving ice/water
            obs = Observation(
                id=f"obs-{lake.id}-{i+1}",
                lake_id=lake.id,
                timestamp=obs_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
                sensor="Sentinel-1 SAR C-Band (IW GRD)" if i % 2 == 0 else "Sentinel-2 MSI L2A",
                orbit_direction="Ascending" if i % 2 == 0 else "Descending",
                polarization="VV+VH" if i % 2 == 0 else "Optical RGB+NIR",
                area_km2=area,
                expansion_percentage_from_baseline=exp_pct,
                mean_backscatter_vv_db=round(-18.5 - (0.5 * (i % 3)), 1) if i % 2 == 0 else -999.0,
                coherence_index=round(0.35 + (0.05 * (i % 4)), 2),
                speckle_noise_sigma=0.18,
                cloud_cover_percent=0.0 if i % 2 == 0 else float(15 * (i % 4)),
                qa_flag="PASS" if i < 7 else ("WET_SNOW_SUSPECT" if i == 7 else "PASS"),
                data_source=DataSourceType.HISTORICAL if i < 8 else DataSourceType.LIVE_SENTINEL_1
            )
            obs_list.append(obs)
        return obs_list

db = InMemoryDB()
