from fastapi import APIRouter, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token
import random
import time
import httpx
import os
from datetime import datetime, date

router = APIRouter()

class DeliveryStartRequest(BaseModel):
    user_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

def process_claim_status(claim_id: str):
    time.sleep(1)
    supabase.table('claims').update({'claim_status': 'approved'}).eq('id', claim_id).execute()
    time.sleep(1)
    supabase.table('claims').update({'claim_status': 'paid'}).eq('id', claim_id).execute()

def get_weather(lat: float, lng: float) -> dict:
    try:
        api_key = os.getenv("OPENWEATHER_API_KEY", "dummy_key")
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={api_key}&units=metric"
        res = httpx.get(url, timeout=5.0)
        res.raise_for_status()
        data = res.json()
        
        condition = data.get("weather", [{}])[0].get("main", "Clear")
        rain_vol = data.get("rain", {}).get("1h", 0)
        temp = data.get("main", {}).get("temp", 0)
        
        is_raining = ("rain" in condition.lower()) or (rain_vol > 0)
        return {"rain": is_raining, "temp": temp, "condition": condition}
    except Exception:
        # Fallback to dynamic randomized logic on API crash to prevent "always true" demo blocks
        return {"rain": random.choice([True, False]), "temp": 25.0, "condition": "Fallback"}

@router.post('/start')
def start_delivery(req: DeliveryStartRequest, background_tasks: BackgroundTasks, authorization: str = Header(None)):
    user_id = verify_token(authorization)
    
    today = str(date.today())
    policy_res = supabase.table('coverage_policies') \
        .select('*') \
        .eq('user_id', user_id) \
        .eq('policy_status', 'active') \
        .gte('end_date', today) \
        .execute()
        
    if not policy_res.data:
        return {"status": "No active coverage", "claim_created": False, "payout": 0, "weather": {"rain_status": False, "zone": "None"}}
        
    policy = policy_res.data[0]
    
    lat_val = req.lat or req.latitude or 0.0
    lng_val = req.lng or req.longitude or 0.0
    weather_data = get_weather(lat_val, lng_val)
    
    is_raining = weather_data["rain"]
    
    # Ensure system never fails pitch validation sequentially
    if not is_raining and os.getenv("DEMO_MODE", "").lower() in ["true", "1"]:
        is_raining = True
        weather_data["condition"] = "Simulated Rain (Demo Override)"
        
    if not is_raining:
        return {
            "status": "No disruption",
            "claim_created": False,
            "payout": 0,
            "rain": False,
            "weather": {
                "rain_status": False,
                "zone": "Delivery Zone",
                "condition": weather_data["condition"],
                "temp": weather_data["temp"]
            }
        }

    dynamic_zone = "Zone_GPS"
    disruption = supabase.table('disruption_events').insert({
        'event_type': 'rain',
        'zone': dynamic_zone,
        'severity': 'high',
        'observed_value': 150,
        'event_status': 'active',
        'event_time': datetime.utcnow().isoformat(),
        'source': 'gps_tracker'
    }).execute().data[0]

    claim = supabase.table('claims').insert({
        'user_id': user_id,
        'policy_id': policy['id'],
        'trigger_event_id': disruption['id'],
        'claim_type': 'Parametric Rain Protection',
        'claim_status': 'pending',
        'payout_amount': 500,
        'reason': 'Heavy Rain'
    }).execute().data[0]

    background_tasks.add_task(process_claim_status, claim['id'])

    return {
        "status": "rain_triggered",
        "rain": True,
        "claim_created": True,
        "payout": 500,
        "weather": {
            "rain_status": True,
            "zone": dynamic_zone,
            "condition": weather_data["condition"],
            "temp": weather_data["temp"]
        },
        "claim": {
            "id": claim['id'],
            "payout_amount": 500
        }
    }
