from datetime import datetime
from models import LakeBase, MultiFactorRiskResult, RiskLevel, Observation

class GLOFRiskEngine:
    """
    Multi-Criteria GLOF Risk Evaluation Engine.
    Adheres strictly to scientific literature (Allen et al. 2019; Sattar et al. 2021; Veh et al. 2018):
    1. Area Expansion alone DOES NOT equal GLOF risk.
    2. Primary triggers are parent ice avalanche proximity (slope > 30 deg), moraine freeboard deficit,
       and SAR coherence drop (signaling surface displacement/surge).
    3. All scores are explicitly tagged as PROVISIONAL pending field glaciological verification.
    """
    
    # Weight factors totaling 1.0
    W_EXPANSION = 0.20
    W_SLOPE = 0.30
    W_FREEBOARD = 0.20
    W_SAR_COHERENCE = 0.15
    W_VULNERABILITY = 0.15

    @classmethod
    def evaluate(cls, lake: LakeBase, latest_obs: Observation) -> MultiFactorRiskResult:
        # 1. Area expansion score (0-100)
        # 0% expansion -> 10, 15% expansion -> 50, >30% expansion -> 90
        exp_pct = max(0.0, latest_obs.expansion_percentage_from_baseline)
        if exp_pct < 10.0:
            s_exp = exp_pct * 3.0
        elif exp_pct < 25.0:
            s_exp = 30.0 + (exp_pct - 10.0) * 2.5
        else:
            s_exp = min(100.0, 67.5 + (exp_pct - 25.0) * 1.5)

        # 2. Steep ice avalanche hazard score (0-100)
        # Ice slopes > 30 degrees have high calving/avalanche potential into the lake
        slope = lake.steep_ice_slope_deg
        if slope < 20.0:
            s_slope = 15.0
        elif slope < 30.0:
            s_slope = 15.0 + (slope - 20.0) * 4.0
        else:
            s_slope = min(100.0, 55.0 + (slope - 30.0) * 7.5)

        # 3. Moraine freeboard deficit score (0-100)
        # Low freeboard (< 15m) means high susceptibility to wave overtopping
        fb = lake.freeboard_height_m
        if fb >= 40.0:
            s_fb = 10.0
        elif fb >= 25.0:
            s_fb = 10.0 + (40.0 - fb) * 2.0
        elif fb >= 15.0:
            s_fb = 40.0 + (25.0 - fb) * 3.0
        else:
            s_fb = min(100.0, 70.0 + (15.0 - fb) * 3.0)

        # 4. SAR coherence drop / water disturbance score (0-100)
        # Rapid changes or water turbulence drop coherence below 0.3
        coh = latest_obs.coherence_index
        if coh > 0.6:
            s_coh = 10.0
        elif coh > 0.4:
            s_coh = 35.0
        elif coh > 0.25:
            s_coh = 70.0
        else:
            s_coh = 95.0

        # 5. Downstream vulnerability score (0-100)
        # Based on downstream settlements count and hydro dams
        downstream_count = len(lake.downstream_settlements)
        infra_count = len(lake.critical_infrastructure)
        s_vuln = min(100.0, (downstream_count * 15.0) + (infra_count * 20.0))

        # Composite Hazard Score
        composite = (
            cls.W_EXPANSION * s_exp +
            cls.W_SLOPE * s_slope +
            cls.W_FREEBOARD * s_fb +
            cls.W_SAR_COHERENCE * s_coh +
            cls.W_VULNERABILITY * s_vuln
        )
        composite = round(composite, 1)

        # Classify risk level
        if composite < 35.0:
            level = RiskLevel.NORMAL
            rec = "Routine repeat-pass satellite monitoring every 12 days. No intervention needed."
        elif composite < 55.0:
            level = RiskLevel.ADVISORY
            rec = "Heightened multi-orbit SAR tracking. Cross-verify with optical Sentinel-2 cloud-free passes."
        elif composite < 75.0:
            level = RiskLevel.WATCH
            rec = "Provisional Watch status. Notify regional glaciologists for high-resolution stereoscopic DEM and run-up wave modeling."
        else:
            level = RiskLevel.WARNING
            rec = "High-priority Provisional Warning. Dispatch field glaciological team; alert NDMA/district emergency control rooms for pre-warning readiness."

        summary = (
            f"Composite Hazard: {composite}/100 ({level.value}). "
            f"Area expansion: {exp_pct:.1f}% (Weight 20%), "
            f"Avalanche Slope: {slope:.1f}° (Weight 30%), "
            f"Freeboard: {fb:.1f}m (Weight 20%)."
        )

        scientific_notes = (
            "SCIENTIFIC SAFETY NOTE: This assessment is an automated provisional remote sensing indicator. "
            "Lake area expansion alone is statistically insufficient to confirm imminent GLOF breach. "
            "Expert validation and geotechnical moraine assessment required before civil warning dissemination."
        )

        now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

        return MultiFactorRiskResult(
            lake_id=lake.id,
            lake_name=lake.name,
            timestamp=now_str,
            composite_hazard_score=composite,
            risk_level=level,
            is_provisional=True,
            area_expansion_score=round(s_exp, 1),
            steep_slope_score=round(s_slope, 1),
            freeboard_score=round(s_fb, 1),
            sar_coherence_drop_score=round(s_coh, 1),
            downstream_vulnerability_score=round(s_vuln, 1),
            trigger_summary=summary,
            scientific_notes=scientific_notes,
            recommended_action=rec
        )
