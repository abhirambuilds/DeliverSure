import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rewvcdogpewqhzytenet.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld3ZjZG9ncGV3cWh6eXRlbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNTE3MjQsImV4cCI6MjA5MDcyNzcyNH0.uFikOFYtR4lHg6zzPGKac48L4IhWwCmUewPUbeOmleI';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
