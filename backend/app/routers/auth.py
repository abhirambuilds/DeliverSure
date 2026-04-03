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
    try:
        # Step 1: Create user in Supabase Auth
        # Using sign_up as per user example
        auth_response = supabase.auth.sign_up({
            'email': req.email,
            'password': req.password,
        })
        
        if not auth_response.user:
            print("REGISTER ERROR: Auth creation failed - no user returned")
            raise HTTPException(status_code=400, detail="Auth creation failed")
            
        user_id = auth_response.user.id
        
        # Step 2: Insert into profiles table
        # Explicitly setting role to 'agent' as required
        profile_data = {
            'id': user_id,
            'full_name': req.full_name,
            'phone_number': req.phone_number,
            'city': req.city,
            'zone': req.zone,
            'vehicle_type': req.vehicle_type,
            'work_platform': req.work_platform,
            'role': 'agent'
        }
        
        profile_result = supabase.table('profiles').insert(profile_data).execute()
        
        # We can check profile_result for data/errors if needed, but the instruction is to fix stability
        
        return {
            "message": "User registered successfully",
            "user_id": user_id
        }
        
    except Exception as e:
        print("REGISTER ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

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
