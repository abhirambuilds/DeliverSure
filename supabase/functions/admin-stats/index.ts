import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [usersRes, policiesRes, claimsRes, disruptionsRes, pendingClaimsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("coverage_policies").select("id", { count: "exact", head: true }).eq("policy_status", "active"),
      supabase.from("claims").select("id", { count: "exact", head: true }),
      supabase.from("disruption_events").select("id", { count: "exact", head: true }),
      supabase.from("claims").select("id", { count: "exact", head: true }).eq("claim_status", "pending")
    ]);

    return new Response(JSON.stringify({
      total_users: usersRes.count || 0,
      active_policies: policiesRes.count || 0,
      total_claims: claimsRes.count || 0,
      total_disruptions: disruptionsRes.count || 0,
      pending_claims: pendingClaimsRes.count || 0
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
