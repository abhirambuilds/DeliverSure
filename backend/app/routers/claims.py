from fastapi import APIRouter, Header
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token

router = APIRouter()

@router.get('/')
def list_claims(authorization: str = Header(...)):
    user_id = verify_token(authorization)
    result = supabase.table('claims').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
    return {'claims': result.data}

@router.post('/approve/{claim_id}')
def approve_claim(claim_id: str, authorization: str = Header(...)):
    verify_token(authorization)
    supabase.table('claims').update({'claim_status': 'approved'}).eq('id', claim_id).execute()
    return {'message': 'Claim approved'}
