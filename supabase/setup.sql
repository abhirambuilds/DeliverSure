-- ==========================================
-- SCRIPT 2 — FULL DATABASE SETUP
-- ==========================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    city TEXT,
    zone TEXT,
    vehicle_type TEXT,
    work_platform TEXT,
    role TEXT DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
    trust_score NUMERIC DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Coverage Policies
CREATE TABLE coverage_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    weekly_premium NUMERIC NOT NULL,
    coverage_amount NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    policy_status TEXT DEFAULT 'active' CHECK (policy_status IN ('active', 'expired', 'canceled')),
    risk_zone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create Disruption Events (Parametric Triggers)
CREATE TABLE disruption_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,                     -- e.g. "rain", "smoke", "heat"
    zone TEXT NOT NULL,
    severity TEXT,                                -- e.g. "high", "critical", "medium"
    source TEXT DEFAULT 'WeatherAPI',
    threshold_value NUMERIC,
    observed_value NUMERIC,
    event_status TEXT DEFAULT 'active',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create Claims
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES coverage_policies(id) ON DELETE SET NULL,
    trigger_event_id UUID REFERENCES disruption_events(id) ON DELETE SET NULL,
    claim_type TEXT NOT NULL,
    claim_status TEXT DEFAULT 'pending' CHECK (claim_status IN ('pending', 'approved', 'paid', 'rejected')),
    payout_amount NUMERIC,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create Activity Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_source TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create Admin Actions (Audit Trail)
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    target_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Add Performance Indexes
CREATE INDEX idx_policies_user_status ON coverage_policies(user_id, policy_status);
CREATE INDEX idx_claims_user ON claims(user_id);
CREATE INDEX idx_events_zone_type ON disruption_events(zone, event_type);

-- 8. Enable Row Level Security (RLS) - Recommended for Supabase
-- Users can read their own profile/policies/claims
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE disruption_events ENABLE ROW LEVEL SECURITY; -- Public for monitoring
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- 9. Admin Setup 
-- IMPORTANT: To run this, you need an existing user in the 'auth.users' table
-- Replace the UUID below with your own admin's auth.users ID
-- INSERT INTO profiles (id, full_name, role)
-- VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Admin Manager', 'admin');

-- 10. Dashboard Logic (Summary for App Integration)
-- IF role == 'admin' -> query admin_actions and all claims
-- ELSE -> query personal policy and claims
