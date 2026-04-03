from fastapi import APIRouter, Header
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get('/')
def list_disruptions(authorization: str = Header(None)):
    verify_token(authorization)
    result = supabase.table('disruption_events').select('*').order('event_time', desc=True).limit(20).execute()
    return {'disruptions': result.data}

@router.post('/scan')
def trigger_scan(authorization: str = Header(None)):
    verify_token(authorization)
    # Deprecated in API v3 in favor of /delivery/start workflow
    return {'message': 'Scan logic deprecated. Use /delivery/start'}
