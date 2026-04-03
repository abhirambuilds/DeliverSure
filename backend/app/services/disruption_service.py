from app.db.supabase_client import supabase
from datetime import datetime

def scan_and_create_claims():
    disruption = supabase.table('disruption_events').insert({
        'event_type': 'aqi',
        'zone': 'South Bangalore',
        'severity': 'high',
        'source': 'mock_scan',
        'threshold_value': 200,
        'observed_value': 275,
        'event_status': 'active',
        'event_time': datetime.utcnow().isoformat()
    }).execute().data[0]

    policies = supabase.table('coverage_policies').select('*').eq('risk_zone', disruption['zone']).eq('policy_status', 'active').execute().data

    claims_created = 0
    for policy in policies:
        supabase.table('claims').insert({
            'user_id': policy['user_id'],
            'policy_id': policy['id'],
            'trigger_event_id': disruption['id'],
            'claim_type': 'auto',
            'claim_status': 'pending',
            'payout_amount': policy['coverage_amount'] * 0.5,
            'reason': f"Auto-claim: AQI exceeded threshold in {disruption['zone']}"
        }).execute()
        claims_created += 1

    return claims_created
