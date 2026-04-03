from app.db.supabase_client import supabase
from datetime import datetime

def log_event(user_id: str, event_type: str, event_source: str, payload: dict = {}):
    try:
        supabase.table('activity_logs').insert({
            'user_id': user_id,
            'event_type': event_type,
            'event_source': event_source,
            'payload': payload,
            'created_at': datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print('Log error:', e)
