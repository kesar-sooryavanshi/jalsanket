import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"
    print("[PASS] Root endpoint passed")

def test_lakes():
    response = client.get("/api/lakes")
    assert response.status_code == 200
    lakes = response.json()
    assert len(lakes) >= 6
    print(f"[PASS] Lakes endpoint passed: {len(lakes)} lakes loaded")

def test_lakes_geojson():
    response = client.get("/api/lakes/geojson")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 6
    print("[PASS] GeoJSON endpoint passed")

def test_observations():
    response = client.get("/api/observations?lake_id=lake-south-lhonak")
    assert response.status_code == 200
    obs = response.json()
    assert len(obs) > 0
    print(f"[PASS] Observations endpoint passed: {len(obs)} records")

def test_analysis():
    response = client.get("/api/analysis/lake/lake-south-lhonak")
    assert response.status_code == 200
    res = response.json()
    assert "composite_hazard_score" in res
    assert res["is_provisional"] is True
    print(f"[PASS] Analysis endpoint passed: score={res['composite_hazard_score']}, level={res['risk_level']}")

def test_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 1
    print(f"[PASS] Alerts endpoint passed: {len(alerts)} alerts found")

def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    status = response.json()
    assert status["status"] == "OPERATIONAL"
    print("[PASS] System status endpoint passed")

if __name__ == "__main__":
    print("Running Jal Sanket backend test suite...")
    test_root()
    test_lakes()
    test_lakes_geojson()
    test_observations()
    test_analysis()
    test_alerts()
    test_system_status()
    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

