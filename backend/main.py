import sys
from pathlib import Path

# Ensure backend directory is in sys.path so imports work regardless of CWD
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import lakes, observations, analysis, alerts, jobs, system

app = FastAPI(
    title="Jal Sanket REST API",
    description="Himalayan Glacial Lake Outburst Flood (GLOF) Early-Warning Decision Support System",
    version="2.0.0"
)

# Enable CORS for frontend Vite dev server (e.g. localhost:5173 / localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(lakes.router)
app.include_router(observations.router)
app.include_router(analysis.router)
app.include_router(alerts.router)
app.include_router(jobs.router)
app.include_router(system.router)

@app.get("/")
def root():
    return {
        "service": "Jal Sanket GLOF Early-Warning Decision Support Engine",
        "version": "2.0.0",
        "status": "ONLINE",
        "docs_url": "/docs",
        "health_check": "/api/system/status"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
