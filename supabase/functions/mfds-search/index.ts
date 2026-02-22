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

    // Korean public data API: serviceKey may be pre-encoded or decoded
    // Try with the key as-is first, then try encoding it
    const baseUrl = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';
    const encodedName = encodeURIComponent(itemName);
    
    // First try: key as-is (common for keys copied from data.go.kr which are already URL-encoded)
    let apiUrl = `${baseUrl}?serviceKey=${serviceKey}&itemName=${encodedName}&type=json&numOfRows=5&pageNo=1`;
    console.log('Calling MFDS API for:', itemName);
    
    let response = await fetch(apiUrl);
    
    // If 401, try with URL-encoded key (key might have been stored decoded)
    if (response.status === 401) {
      console.log('First attempt 401, retrying with encoded key...');
      await response.text(); // consume body
      const encodedKey = encodeURIComponent(serviceKey);
      apiUrl = `${baseUrl}?serviceKey=${encodedKey}&itemName=${encodedName}&type=json&numOfRows=5&pageNo=1`;
      response = await fetch(apiUrl);
    }
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('MFDS API response error:', response.status, errText);
      throw new Error(`MFDS API error [${response.status}]: ${errText}`);
    }

    const rawText = await response.text();
    console.log('MFDS raw response preview:', rawText.substring(0, 500));
    
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('Failed to parse MFDS response:', rawText.substring(0, 500));
      throw new Error('MFDS API returned non-JSON response');
    }
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
