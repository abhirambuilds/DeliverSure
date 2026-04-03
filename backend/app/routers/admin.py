from fastapi import APIRouter, Header
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token

router = APIRouter()

@router.get('/dashboard')
def admin_dashboard(authorization: str = Header(None)):
    verify_token(authorization)
    total_users = len(supabase.table('profiles').select('id').execute().data)
    total_policies = len(supabase.table('coverage_policies').select('id').execute().data)
    active_policies = len(supabase.table('coverage_policies').select('id').eq('policy_status', 'active').execute().data)
    total_claims = len(supabase.table('claims').select('id').execute().data)
    pending_claims = len(supabase.table('claims').select('id').eq('claim_status', 'pending').execute().data)
    approved_claims = len(supabase.table('claims').select('id').eq('claim_status', 'approved').execute().data)
    total_disruptions = len(supabase.table('disruption_events').select('id').execute().data)
    return {
        'total_users': total_users,
        'total_policies': total_policies,
        'active_policies': active_policies,
        'total_claims': total_claims,
        'pending_claims': pending_claims,
        'approved_claims': approved_claims,
        'total_disruptions': total_disruptions,
    }

@router.get('/claims')
def admin_list_claims(authorization: str = Header(None)):
    verify_token(authorization)
    result = supabase.table('claims').select('*').order('created_at', desc=True).execute()
    return {'claims': result.data}

@router.post('/claims/approve/{claim_id}')
def admin_approve_claim(claim_id: str, authorization: str = Header(None)):
    verify_token(authorization)
    supabase.table('claims').update({'claim_status': 'approved'}).eq('id', claim_id).execute()
    return {'message': 'Claim approved'}

@router.post('/claims/reject/{claim_id}')
def admin_reject_claim(claim_id: str, authorization: str = Header(None)):
    verify_token(authorization)
    supabase.table('claims').update({'claim_status': 'rejected'}).eq('id', claim_id).execute()
    return {'message': 'Claim rejected'}

@router.get('/users')
def admin_list_users(authorization: str = Header(None)):
    verify_token(authorization)
    result = supabase.table('profiles').select('*').order('created_at', desc=True).execute()
    return {'users': result.data}

@router.get('/disruptions')
def admin_list_disruptions(authorization: str = Header(None)):
    verify_token(authorization)
    result = supabase.table('disruption_events').select('*').order('event_time', desc=True).execute()
    return {'disruptions': result.data}

@router.get('/logs')
def admin_logs(authorization: str = Header(None)):
    verify_token(authorization)
    result = supabase.table('activity_logs').select('*').order('created_at', desc=True).limit(50).execute()
    return {'logs': result.data}
