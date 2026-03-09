import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name } = await req.json();
    if (!name) throw new Error("name is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            content: `당신은 영양제/비타민 전문 약사입니다. 사용자가 영양제 이름을 입력하면 정확한 정보를 제공하세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.
{
  "효능": "주요 효능 1-2줄",
  "권장복용량": "일반적인 1회 복용량 (예: 1정, 1000IU 등)",
  "복용시간": "추천 복용 시간대 (예: 아침 식후, 저녁 취침 전 등)",
  "주의사항": "주요 주의사항 1-2줄"
}`,
          },
          {
            role: "user",
            content: `영양제: ${name}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_supplement_info",
              description: "영양제 정보를 구조화된 형태로 반환합니다",
              parameters: {
                type: "object",
                properties: {
                  효능: { type: "string", description: "주요 효능" },
                  권장복용량: { type: "string", description: "일반적인 1회 복용량" },
                  복용시간: { type: "string", description: "추천 복용 시간대" },
                  주의사항: { type: "string", description: "주요 주의사항" },
                },
                required: ["효능", "권장복용량", "복용시간", "주의사항"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_supplement_info" } },
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
        return new Response(JSON.stringify({ error: "AI 사용량이 초과되었습니다." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    // tool_call 결과에서 구조화된 데이터 추출
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let info;
    
    if (toolCall?.function?.arguments) {
      info = JSON.parse(toolCall.function.arguments);
    } else {
      // fallback: content에서 JSON 파싱
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        info = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(JSON.stringify({ info }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("supplement-info error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});