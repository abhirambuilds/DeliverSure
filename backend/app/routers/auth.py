from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.supabase_client import supabase

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone_number: str
    city: str
    zone: str
    vehicle_type: str
    work_platform: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post('/register')
def register(req: RegisterRequest):
    result = supabase.auth.admin.create_user({
        'email': req.email,
        'password': req.password,
        'email_confirm': True
    })
    if not result.user:
        raise HTTPException(status_code=400, detail='Registration failed')
    user_id = result.user.id
    supabase.table('profiles').insert({
        'id': user_id,
        'full_name': req.full_name,
        'phone_number': req.phone_number,
        'city': req.city,
        'zone': req.zone,
        'vehicle_type': req.vehicle_type,
        'work_platform': req.work_platform,
    }).execute()
    return {'message': 'User registered successfully', 'user_id': user_id}

@router.post('/login')
def login(req: LoginRequest):
    result = supabase.auth.sign_in_with_password({
        'email': req.email,
        'password': req.password
    })
    if not result.user:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    return {
        'access_token': result.session.access_token,
        'refresh_token': result.session.refresh_token,
        'user_id': result.user.id
    }
