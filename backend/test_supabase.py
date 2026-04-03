import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

try:
    supabase = create_client(url, key)
    # Test connection by trying to get auth users or a table
    response = supabase.table("profiles").select("*").limit(1).execute()
    print("SUCCESS: Connected to Supabase!")
    print(f"Data: {response.data}")
except Exception as e:
    print(f"FAILED: Could not connect to Supabase. Error: {e}")
