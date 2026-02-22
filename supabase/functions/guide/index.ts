import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || '' } },
    });

    const { medicationId } = await req.json();
    if (!medicationId) {
      return new Response(JSON.stringify({ error: 'medicationId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch medication with MFDS fields
    const { data: med, error: medErr } = await supabase
      .from('medications')
      .select('*')
      .eq('id', medicationId)
      .single();

    if (medErr || !med) {
      return new Response(JSON.stringify({ error: 'Medication not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch RAG chunks
    const { data: chunks } = await supabase
      .from('drug_info_chunks')
      .select('chunk_type, content')
      .eq('medication_id', medicationId);

    // Build context bundle
    const bundle = {
      medication: {
        name: med.name,
        dosage: med.dosage,
        entpName: med.entp_name,
        itemImage: med.item_image,
      },
      sections: {
        efcy: med.efcy || '',
        useMethod: med.use_method || '',
        intrc: med.intrc || '',
        se: med.se || '',
        depositMethod: med.deposit_method || '',
      },
      chunks: chunks || [],
      summary: generateTemplateSummary(med),
      source: med.item_seq ? `식약처 e약은요 (품목코드: ${med.item_seq})` : '처방전 기반 정보',
    };

    return new Response(JSON.stringify(bundle), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Guide error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateTemplateSummary(med: any): string {
  const parts: string[] = [];
  if (med.efcy) parts.push(`【효능·효과】${med.efcy.substring(0, 200)}`);
  if (med.use_method) parts.push(`【용법·용량】${med.use_method.substring(0, 200)}`);
  if (med.intrc) parts.push(`【주의사항】${med.intrc.substring(0, 200)}`);
  if (med.se) parts.push(`【부작용】${med.se.substring(0, 200)}`);
  if (parts.length === 0) {
    return `${med.name}은(는) 처방된 약물입니다. 의사의 지시에 따라 복용하세요.`;
  }
  return parts.join('\n\n');
}
