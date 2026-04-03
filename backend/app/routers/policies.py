from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token
from app.utils.logger import log_event
from datetime import date, timedelta
import traceback

router = APIRouter()

class ActivatePolicyRequest(BaseModel):
    user_id: str
    zone: str
    premium: float
    coverage_amount: float

@router.post('/activate')
def activate_policy(req: ActivatePolicyRequest, authorization: str = Header(None)):
    try:
        user_id = verify_token(authorization)
        start = date.today()
        end = start + timedelta(days=7)
        
        # Enforce check for already active policy per rules
        existing = supabase.table('coverage_policies').select('*').eq('user_id', user_id).eq('policy_status', 'active').execute()
        if existing.data:
            raise HTTPException(status_code=400, detail='Policy already active')
        
        policy_data = {
            'user_id': user_id,
            'weekly_premium': req.premium,
            'coverage_amount': req.coverage_amount,
            'policy_status': 'active',
            'start_date': str(start),
            'end_date': str(end),
            'risk_zone': req.zone
        }
        
        policy = supabase.table('coverage_policies').insert(policy_data).execute()
        
        return {
            "status": "active",
            "policy_id": policy.data[0]['id'],
            "end_date": str(end),
            "premium": req.premium
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/active')
def get_active_policy(authorization: str = Header(None)):
    user_id = verify_token(authorization)
    result = supabase.table('coverage_policies').select('*').eq('user_id', user_id).eq('policy_status', 'active').execute()
    return {'policy': result.data[0] if result.data else None}

@router.post('/cancel/{policy_id}')
def cancel_policy(policy_id: str, authorization: str = Header(None)):
    user_id = verify_token(authorization)
    supabase.table('coverage_policies').update({'policy_status': 'cancelled'}).eq('id', policy_id).eq('user_id', user_id).execute()
    log_event(user_id, 'policy_cancelled', 'mobile_app', {'policy_id': policy_id})
    return {'message': 'Policy cancelled'}
