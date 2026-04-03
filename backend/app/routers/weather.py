from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

class WeatherCheckRequest(BaseModel):
    latitude: float
    longitude: float

@router.post('/check')
def check_weather(req: WeatherCheckRequest):
    # Simulate Weather Backend
    # Randomize rain_status for realistic testing demonstration
    rain = random.choice([True, False])
    return {
        "rain_status": rain,
        "rainfall_level": "heavy" if rain else "none",
        "zone": "Current Zone"
    }
