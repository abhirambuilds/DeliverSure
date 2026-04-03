from fastapi import HTTPException
from app.db.supabase_client import supabase

def verify_token(authorization: str) -> str:
    try:
        token = authorization.replace('Bearer ', '')
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail='Invalid token')
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail='Token verification failed')
