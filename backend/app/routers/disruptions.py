from fastapi import APIRouter, Header
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token
from app.utils.logger import log_event
from app.services.disruption_service import scan_and_create_claims

router = APIRouter()

@router.get('/')
def list_disruptions(authorization: str = Header(...)):
    verify_token(authorization)
    result = supabase.table('disruption_events').select('*').order('event_time', desc=True).limit(20).execute()
    return {'disruptions': result.data}

@router.post('/scan')
def trigger_scan(authorization: str = Header(...)):
    user_id = verify_token(authorization)
    result = scan_and_create_claims()
    log_event(user_id, 'disruption_scan', 'mobile_app', {'claims_created': result})
    return {'message': 'Scan complete', 'claims_created': result}
