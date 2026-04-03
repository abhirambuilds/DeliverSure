from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token
from app.utils.logger import log_event
from datetime import date, timedelta
import traceback

router = APIRouter()

class ActivatePolicyRequest(BaseModel):
    weekly_premium: float
    coverage_amount: float
    risk_zone: str

@router.post('/activate')
def activate_policy(req: ActivatePolicyRequest, authorization: str = Header(...)):
    try:
        user_id = verify_token(authorization)
        existing = supabase.table('coverage_policies').select('*').eq('user_id', user_id).eq('policy_status', 'active').execute()
        if existing.data:
            raise HTTPException(status_code=400, detail='Active policy already exists')
        start = date.today()
        end = start + timedelta(days=7)
        policy = supabase.table('coverage_policies').insert({
            'user_id': user_id,
            'weekly_premium': req.weekly_premium,
            'coverage_amount': req.coverage_amount,
            'start_date': str(start),
            'end_date': str(end),
            'risk_zone': req.risk_zone,
            'policy_status': 'active'
        }).execute()
        log_event(user_id, 'policy_activated', 'mobile_app', {'policy_id': policy.data[0]['id'], 'risk_zone': req.risk_zone})
        return {'message': 'Policy activated', 'policy': policy.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/active')
def get_active_policy(authorization: str = Header(...)):
    user_id = verify_token(authorization)
    result = supabase.table('coverage_policies').select('*').eq('user_id', user_id).eq('policy_status', 'active').execute()
    return {'policy': result.data[0] if result.data else None}

@router.post('/cancel/{policy_id}')
def cancel_policy(policy_id: str, authorization: str = Header(...)):
    user_id = verify_token(authorization)
    supabase.table('coverage_policies').update({'policy_status': 'cancelled'}).eq('id', policy_id).eq('user_id', user_id).execute()
    log_event(user_id, 'policy_cancelled', 'mobile_app', {'policy_id': policy_id})
    return {'message': 'Policy cancelled'}
