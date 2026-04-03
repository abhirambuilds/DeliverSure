import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { lat, lng } = await req.json();

    // AI Risk Simulation: In a real app, this would query a historical weather API or risk map.
    // Here we generate a dynamic premium based on the "risk" of the zone.
    let riskFactor = 0;
    const isHighRisk = lat > 12.5; // Dummy logic for demo
    const isSafeZone = lng > 77.5; // Simulated predictive logic

    if (isHighRisk) {
      riskFactor = 45 + Math.floor(Math.random() * 15); // ₹45 - ₹60
    } else {
      riskFactor = 25 + Math.floor(Math.random() * 15); // ₹25 - ₹40
    }

    // AI Integration: Hyper-local discount for safe zones
    if (isSafeZone) {
      riskFactor = Math.max(10, riskFactor - 2);
    }

    return new Response(
      JSON.stringify({
        success: true,
        premium: riskFactor,
        zone: "High Performance North",
        risk_level: isHighRisk ? "HIGH" : "MEDIUM"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
