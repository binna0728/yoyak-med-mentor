import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get('MFDS_EYAK_SERVICE_KEY');
    if (!serviceKey) {
      throw new Error('MFDS_EYAK_SERVICE_KEY is not configured');
    }

    const { itemName } = await req.json();
    if (!itemName || typeof itemName !== 'string') {
      return new Response(JSON.stringify({ error: '약품명을 입력하세요' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL('https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList');
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('itemName', itemName);
    url.searchParams.set('type', 'json');
    url.searchParams.set('numOfRows', '5');
    url.searchParams.set('pageNo', '1');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`MFDS API error [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();
    const body = data?.body;
    const items = body?.items ?? [];

    const normalized = items.map((item: any) => ({
      itemName: item.itemName || '',
      entpName: item.entpName || '',
      efcyQesitm: stripHtml(item.efcyQesitm || ''),
      useMethodQesitm: stripHtml(item.useMethodQesitm || ''),
      intrcQesitm: stripHtml(item.intrcQesitm || ''),
      seQesitm: stripHtml(item.seQesitm || ''),
      depositMethodQesitm: stripHtml(item.depositMethodQesitm || ''),
      itemSeq: item.itemSeq || '',
      itemImage: item.itemImage || '',
    }));

    return new Response(JSON.stringify({ results: normalized, totalCount: body?.totalCount || 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('MFDS search error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
