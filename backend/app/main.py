from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, profiles, policies, claims, disruptions, admin, weather, premium, delivery
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="DeliverSure API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])
app.include_router(claims.router, prefix="/claims", tags=["Claims"])
app.include_router(disruptions.router, prefix="/disruptions", tags=["Disruptions"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(premium.router, prefix="/premium", tags=["Premium"])
app.include_router(delivery.router, prefix="/delivery", tags=["Delivery"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "DeliverSure API v3"}
