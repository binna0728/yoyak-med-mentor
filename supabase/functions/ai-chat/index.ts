import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, medications } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let medContext = "";
    if (medications && Array.isArray(medications) && medications.length > 0) {
      medContext = `\n\n현재 사용자가 복용 중인 약 목록:\n${medications.map((m: any, i: number) => {
        const parts = [`${i + 1}. ${m.name}`];
        if (m.dosage) parts.push(`용량: ${m.dosage}`);
        if (m.efcy) parts.push(`효능: ${m.efcy}`);
        if (m.se) parts.push(`부작용: ${m.se}`);
        if (m.intrc) parts.push(`상호작용: ${m.intrc}`);
        if (m.use_method) parts.push(`복용법: ${m.use_method}`);
        return parts.join(' | ');
      }).join('\n')}\n\n이 약 정보를 참고하여 사용자의 질문에 맞춤형 답변을 제공하세요. 특히 약물 간 상호작용에 주의하세요.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `당신은 '요약' 앱의 약 상담 AI 어시스턴트입니다.
사용자가 복용 중인 약에 대해 질문하면, 정확하고 이해하기 쉬운 한국어로 답변해주세요.

답변 가이드라인:
- 약의 효능, 부작용, 복용법, 주의사항 등을 친절하게 설명
- 전문 용어는 쉽게 풀어서 설명
- 위험한 상호작용이 있으면 반드시 경고
- 의사나 약사와 상담을 권고하는 면책 문구 포함
- 답변은 간결하되 필요한 정보는 빠짐없이 제공
- 이모지를 적절히 사용하여 가독성 향상${medContext}`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI 서비스 오류가 발생했습니다." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
