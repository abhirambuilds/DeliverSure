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
    const body = await req.json();
    const { user_id, lat, lng, trigger_scenario } = body;
    console.log(`Processing delivery for user: ${user_id}, scenario: ${trigger_scenario}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get active policy
    const { data: policies, error: policyErr } = await supabase
      .from("coverage_policies")
      .select("*")
      .eq("user_id", user_id)
      .eq("policy_status", "active");

    const policy = policies?.[0];
    console.log(`Active policy found: ${policy?.id || 'None'}`);

    // 2. Weather check via WeatherAPI.com
    const apiKey = Deno.env.get("WEATHERAPI_KEY");
    let is_raining = false;
    let temperature = 28;
    let condition = "Clear";
    let city = "Unknown City";

    try {
      const weatherRes = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lng}`
      );
      const weatherData = await weatherRes.json();
      
      temperature = weatherData.current?.temp_c || 28;
      condition = weatherData.current?.condition?.text || "Clear";
      city = weatherData.location?.name || "Target Zone";
      
      const weatherCode = weatherData.current?.condition?.code;
      is_raining = [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(weatherCode);
      console.log(`Weather at ${city}: ${condition}, ${temperature}C, Raining: ${is_raining}`);
    } catch (err) {
      console.error("WeatherAPI fetch error:", err);
    }

    // 3. Scenario Triggers
    let eventType = "none";
    let reasonText = "";
    let shouldTrigger = false;

    if (trigger_scenario === 'rain') {
      shouldTrigger = true;
      eventType = "rain";
      reasonText = "Simulated Rain Disruption (Demo)";
      is_raining = true;
      condition = "Heavy Rain";
    } else if (trigger_scenario === 'heat') {
      shouldTrigger = true;
      eventType = "heat";
      reasonText = "Simulated Heat Wave Disruption (Demo)";
      temperature = 42;
      condition = "Extreme Heat";
    } else if (is_raining) {
      shouldTrigger = true;
      eventType = "rain";
      reasonText = "Automatic rain detection payout";
    }

    if (!shouldTrigger || !policy) {
      console.log("No claim triggered (no risk detected or no policy found).");
      return new Response(JSON.stringify({
        success: true,
        weather: { rain_status: is_raining, condition: condition, temp: temperature, city: city }
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // 4. Create disruption event
    console.log("Triggering claim process...");
    const { data: event, error: eventErr } = await supabase
      .from("disruption_events")
      .insert({
        event_type: eventType,
        zone: city,
        severity: "high",
        source: "weather_api"
      })
      .select()
      .single();

    if (eventErr) throw new Error(`Event Insert Error: ${eventErr.message}`);
    console.log(`Event created: ${event.id}`);

    // 5. Create claim
    const claimTitle = eventType === 'rain' ? 'Rain Protection' : 'Heat Protection';
    const { data: claim, error: claimErr } = await supabase
      .from("claims")
      .insert({
        user_id,
        policy_id: policy.id,
        trigger_event_id: event.id,
        claim_type: claimTitle,
        claim_status: "paid",
        payout_amount: 500,
        reason: reasonText
      })
      .select()
      .single();

    if (claimErr) throw new Error(`Claim Insert Error: ${claimErr.message}`);
    console.log(`Claim created and paid: ${claim.id}`);

    return new Response(JSON.stringify({
      success: true,
      claim_created: true,
      payout: 500,
      claim: claim,
      weather: { rain_status: is_raining, condition: condition, temp: temperature, city: city }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("Critical Function Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 200, // Return 200 with error to handle gracefully on frontend
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
