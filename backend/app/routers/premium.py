from fastapi import APIRouter
from pydantic import BaseModel
from app.routers.delivery import get_weather

router = APIRouter()

class PremiumRequest(BaseModel):
    lat: float = 12.9716
    lng: float = 77.5946
    location: str = "Current Zone"

@router.post('/calculate')
def calculate_premium(req: PremiumRequest):
    weather_data = get_weather(req.lat, req.lng)
    
    # Convert rain to numeric probability
    rain_prob = 1.0 if weather_data.get("rain") else 0.1
    
    # Normalize temp map (e.g. 40 degrees = 1.0, 20 degrees = 0.5)
    temp = weather_data.get("temp", 25)
    temp_factor = min(max(temp / 40.0, 0.0), 1.0)
    
    # Calculate Risk Score
    risk_score = (rain_prob * 0.5) + (temp_factor * 0.5)
    
    # Dynamic Premium Logic
    raw_premium = 20 + (risk_score * 30)
    
    # Clamp Premium
    premium = max(20.0, min(50.0, raw_premium))
    
    return {
        "premium": round(premium),
        "risk_score": round(risk_score, 2),
        "location": req.location
    }
