-- ==========================================
-- SCRIPT 1 — FULL CLEAN RESET
-- ==========================================

-- 1. Disable constraints temporarily to safely clean DB
SET session_replication_role = 'replica';

-- 2. Delete data from all tables (respecting foreign key order)
DELETE FROM claims;
DELETE FROM admin_actions;
DELETE FROM activity_logs;
DELETE FROM disruption_events;
DELETE FROM coverage_policies;
DELETE FROM profiles;

-- 3. Drop tables (in correct order: child first)
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS admin_actions;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS disruption_events;
DROP TABLE IF EXISTS coverage_policies;
DROP TABLE IF EXISTS profiles;

-- 4. Restore constraints
SET session_replication_role = 'origin';

-- Result: Complete clean slate
