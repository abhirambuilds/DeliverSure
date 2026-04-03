from fastapi import APIRouter, Header
from app.db.supabase_client import supabase
from app.utils.helpers import verify_token

router = APIRouter()

@router.get('/me')
def get_profile(authorization: str = Header(None)):
    user_id = verify_token(authorization)
    result = supabase.table('profiles').select('*').eq('id', user_id).execute()
    return {'profile': result.data[0] if result.data else None}
