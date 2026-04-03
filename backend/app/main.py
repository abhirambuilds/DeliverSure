from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, profiles, policies, claims, disruptions, admin
from app.services.disruption_service import scan_and_create_claims
from apscheduler.schedulers.background import BackgroundScheduler
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="DeliverSure API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])
app.include_router(claims.router, prefix="/claims", tags=["Claims"])
app.include_router(disruptions.router, prefix="/disruptions", tags=["Disruptions"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

def scheduled_scan():
    try:
        claims_created = scan_and_create_claims()
        logger.info(f"Scheduled scan complete. Claims created: {claims_created}")
    except Exception as e:
        logger.error(f"Scheduled scan failed: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_scan, "interval", minutes=30)
scheduler.start()

@app.get("/health")
def health():
    return {"status": "ok", "service": "DeliverSure API v2", "scheduler": "running"}

@app.on_event("shutdown")
def shutdown():
    scheduler.shutdown()
