import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://yoyak.apps.tossmini.com",
  "https://yoyak.private-apps.tossmini.com",
  "https://yoyak.site",
  "https://yoyak-med-mentor.lovable.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".lovable.app");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth: accept either Basic Auth (from Toss callback) or Bearer token (from client)
    const authHeader = req.headers.get("Authorization") || "";
    const expectedToken = Deno.env.get("TOSS_UNLINK_AUTH_TOKEN");

    const isBasicAuth = expectedToken && authHeader === `Basic ${btoa(expectedToken)}`;
    const isBearerAuth = authHeader.startsWith("Bearer ");

    if (!isBasicAuth && !isBearerAuth) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    console.log("Toss unlink callback received:", JSON.stringify(body));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract user identifier from toss callback payload
    const userId = body.user_id || body.userId;

    if (userId) {
      // Clean up user data from all tables
      const tables = [
        "schedules",
        "drug_info_chunks",
        "interaction_matrix",
        "interaction_warnings",
        "medications",
        "user_term_consents",
        "user_roles",
        "profiles",
      ];

      for (const table of tables) {
        await supabase.from(table).delete().eq("user_id", userId);
      }

      console.log(`User data cleaned up for: ${userId}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Unlink processed" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Toss unlink error:", error);
    return new Response(
      JSON.stringify({ success: true, message: "Acknowledged" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
