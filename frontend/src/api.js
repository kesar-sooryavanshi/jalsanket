// Centralized API client for Jal Sanket backend

const BASE_URL = '/api';

export async function fetchSystemStatus() {
  const res = await fetch(`${BASE_URL}/system/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchLakes() {
  const res = await fetch(`${BASE_URL}/lakes`);
  if (!res.ok) throw new Error('Failed to fetch lakes');
  return res.json();
}

export async function fetchLakesGeoJSON() {
  const res = await fetch(`${BASE_URL}/lakes/geojson`);
  if (!res.ok) throw new Error('Failed to fetch geojson');
  return res.json();
}

export async function fetchLakeObservations(lakeId) {
  const res = await fetch(`${BASE_URL}/observations?lake_id=${lakeId}`);
  if (!res.ok) throw new Error('Failed to fetch observations');
  return res.json();
}

export async function fetchRiskAnalysis(lakeId) {
  const res = await fetch(`${BASE_URL}/analysis/lake/${lakeId}`);
  if (!res.ok) throw new Error('Failed to fetch risk analysis');
  return res.json();
}

export async function fetchRiskSummary() {
  const res = await fetch(`${BASE_URL}/analysis/summary`);
  if (!res.ok) throw new Error('Failed to fetch risk summary');
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${BASE_URL}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function acknowledgeAlert(alertId, reviewerName, validationStatus) {
  const res = await fetch(`${BASE_URL}/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewer_name: reviewerName, validation_status: validationStatus })
  });
  if (!res.ok) throw new Error('Failed to acknowledge alert');
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${BASE_URL}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function triggerSARJob(lakeId, orbitDirection = 'Ascending') {
  const res = await fetch(`${BASE_URL}/jobs/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lake_id: lakeId, orbit_direction: orbitDirection })
  });
  if (!res.ok) throw new Error('Failed to trigger SAR job');
  return res.json();
}
