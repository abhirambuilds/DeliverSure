// Supabase Edge Function: calculate-premium
// Deploy with: supabase functions deploy calculate-premium

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getWeather(lat: number, lng: number) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return {
      rain: data?.weather?.[0]?.main?.toLowerCase().includes("rain") || (data?.rain?.["1h"] || 0) > 0,
      temp: data?.main?.temp || 25,
    };
  } catch {
    return { rain: false, temp: 28 };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { lat = 12.9716, lng = 77.5946, location = "Current Zone" } = await req.json();
    const weather = await getWeather(lat, lng);

    const rainProb = weather.rain ? 1.0 : 0.1;
    const tempFactor = Math.min(Math.max(weather.temp / 40.0, 0.0), 1.0);
    const riskScore = rainProb * 0.5 + tempFactor * 0.5;
    const premium = Math.max(20, Math.min(50, 20 + riskScore * 30));

    return new Response(JSON.stringify({
      premium: Math.round(premium),
      risk_score: Math.round(riskScore * 100) / 100,
      location,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ premium: 35, risk_score: 0.5, location: "Default" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
