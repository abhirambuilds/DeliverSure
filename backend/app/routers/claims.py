from fastapi import APIRouter, Header
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token

router = APIRouter()

@router.get('/')
def list_claims(authorization: str = Header(None)):
    user_id = verify_token(authorization)
    result = supabase.table('claims').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
    return {'claims': result.data}

@router.post('/approve/{claim_id}')
def approve_claim(claim_id: str, authorization: str = Header(None)):
    verify_token(authorization)
    supabase.table('claims').update({'claim_status': 'approved'}).eq('id', claim_id).execute()
    return {'message': 'Claim approved'}

@router.post('/auto-create')
def auto_create_claim(authorization: str = Header(None)):
    user_id = verify_token(authorization)
    policy_res = supabase.table('coverage_policies').select('*').eq('user_id', user_id).eq('policy_status', 'active').execute()
    if not policy_res.data:
        return {'message': 'No active policy'}
    
    policy = policy_res.data[0]
    claim = supabase.table('claims').insert({
        'user_id': user_id,
        'policy_id': policy['id'],
        'claim_type': 'Heavy Rain Protection',
        'claim_status': 'pending',
        'payout_amount': policy.get('coverage_amount', 1000) * 0.5,
        'reason': 'Auto-claim triggered by parametric weather data'
    }).execute()
    
    return {'message': 'Auto-claim created', 'claim': claim.data[0]}

@router.post('/process/{claim_id}')
def process_claim(claim_id: str, authorization: str = Header(None)):
    verify_token(authorization)
    supabase.table('claims').update({'claim_status': 'paid'}).eq('id', claim_id).execute()
    return {'message': 'Claim processed to Paid'}
@router.post('/create')
def create_claim(data: dict, authorization: str = Header(None)):
    user_id = verify_token(authorization)
    policy_res = supabase.table('coverage_policies').select('*').eq('user_id', user_id).eq('policy_status', 'active').execute()
    if not policy_res.data:
        return {'message': 'No active policy found to claim against'}
    
    policy = policy_res.data[0]
    result = supabase.table('claims').insert({
        'user_id': user_id,
        'policy_id': policy['id'],
        'claim_type': data.get('title', 'Manual Claim'),
        'claim_status': 'pending',
        'payout_amount': float(data.get('amount', 500)),
        'reason': data.get('reason', 'User reported issue')
    }).execute()
    return {'message': 'Claim submitted successfully', 'claim': result.data[0]}
