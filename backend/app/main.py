from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import PROJECT_NAME, API_V1_PREFIX
from app.db.audit_store import init_audit_db
from app.db.decision_store import init_decision_db
from app.routers.ingestion import router as ingestion_router
from app.routers.audit import router as audit_router
from app.routers.auth import router as auth_router
from app.routers.triage import router as triage_router, decision_router
from app.routers.drilldown import router as drilldown_router
from app.routers.detection import router as detection_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize append-only SQLite audit and human decision databases
    init_audit_db()
    init_decision_db()
    yield


app = FastAPI(
    title=f"{PROJECT_NAME} - Forensic Audit Platform",
    description="Offline, explainable forensic-audit platform for exam integrity.",
    version="1.0.0",
    lifespan=lifespan
)

# Air-gapped on-premise CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ingestion_router, prefix=API_V1_PREFIX)
app.include_router(audit_router, prefix=API_V1_PREFIX)
app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(triage_router, prefix=API_V1_PREFIX)
app.include_router(decision_router, prefix=API_V1_PREFIX)
app.include_router(drilldown_router, prefix=API_V1_PREFIX)
app.include_router(detection_router, prefix=API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "platform": PROJECT_NAME,
        "mode": "Air-Gapped / Offline",
        "version": "1.0.0",
        "status": "OPERATIONAL"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "terra-trace-backend",
        "database": "audit.db & decisions_audit initialized"
    }
