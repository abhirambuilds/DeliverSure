from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.db.supabase_client import supabase

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str
    city: str
    zone: str
    vehicle_type: str
    work_platform: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post('/register')
def register(req: RegisterRequest):
    try:
        # Step 0: Check if user already exists in Profiles
        # (This is Step 3 from instructions to prevent duplicate signups)
        check_res = supabase.table('profiles').select('*').eq('email', req.email).execute()
        if check_res.data:
            raise HTTPException(status_code=400, detail="User already exists with this email")

        # Step 1: Create user in Supabase Auth
        # (Using sign_up as per user example and requirements)
        auth_response = supabase.auth.sign_up({
            'email': req.email,
            'password': req.password,
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed. Check credentials or email availability.")
            
        user_id = auth_response.user.id
        
        # Step 2: Insert into profiles table (Step 1 + Step 3 logic)
        profile_data = {
            'id': user_id,
            'email': req.email,
            'full_name': req.full_name,
            'phone_number': req.phone_number,
            'city': req.city,
            'zone': req.zone,
            'vehicle_type': req.vehicle_type,
            'work_platform': req.work_platform,
            'role': 'agent'
        }
        
        supabase.table('profiles').insert(profile_data).execute()
        
        return {
            "message": "User registered successfully",
            "user_id": user_id
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        error_str = str(e).lower()
        if "rate limit" in error_str:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
        print("REGISTER ERROR:", str(e))
        raise HTTPException(status_code=400, detail=str(e))

@router.post('/login')
def login(req: LoginRequest):
    try:
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
    except Exception as e:
        print("LOGIN ERROR:", str(e))
        raise HTTPException(status_code=401, detail="Invalid email or password")
