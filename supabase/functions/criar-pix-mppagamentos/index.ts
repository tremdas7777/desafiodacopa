import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function fireServerWebhooks(
  supabase: any,
  eventType: 'venda_pendente' | 'venda_aprovada',
  payload: Record<string, unknown>
) {
  try {
    const { data: webhooks } = await supabase
      .from('webhook_endpoints')
      .select('url, events')
      .eq('active', true);
    if (!webhooks || webhooks.length === 0) return;
    const targets = webhooks.filter((w: any) => w.url?.trim() && w.events?.includes(eventType));
    await Promise.allSettled(targets.map(async (webhook: any) => {
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: eventType, timestamp: new Date().toISOString(), ...payload }),
        });
        console.log(`Webhook sent to ${webhook.url} for ${eventType}`);
      } catch (err) {
        console.error(`Webhook error (${webhook.url}):`, err);
      }
    }));
  } catch (err) {
    console.error('Error firing server webhooks:', err);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { publicKey, secretKey, amount, buyerName, buyerEmail, buyerDocument, buyerPhone, externalRef, metadata } = await req.json();

    if (!publicKey || !secretKey || !amount) {
      return new Response(JSON.stringify({ error: 'publicKey, secretKey e amount são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique identifier for MP Pagamentos
    const identifier = crypto.randomUUID().replace(/-/g, '').slice(0, 20);

    // Build callback URL for webhooks
    const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`;

    // Build request body per MP Pagamentos docs
    const body: Record<string, unknown> = {
      identifier,
      amount,
      callbackUrl: webhookUrl,
      client: {
        name: buyerName || 'Cliente',
        email: buyerEmail || 'cliente@email.com',
        phone: buyerPhone ? buyerPhone.replace(/\D/g, '') : '11999999999',
        document: buyerDocument ? buyerDocument.replace(/\D/g, '') : '00000000000',
      },
    };

    if (metadata) {
      body.metadata = metadata;
    }

    console.log('MP Pagamentos request:', JSON.stringify(body));

    const response = await fetch('https://app.pagamentosmp.com/api/v1/gateway/pix/receive', {
      method: 'POST',
      headers: {
        'x-public-key': publicKey,
        'x-secret-key': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MP Pagamentos error:', JSON.stringify(data));
      return new Response(JSON.stringify({ error: 'Erro na API MP Pagamentos', details: data }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('MP Pagamentos success:', JSON.stringify(data));

    // Extract PIX data from response
    const pixCode = data.pix?.code || '';
    const pixQrCodeBase64 = data.pix?.base64 || data.pix?.image || '';
    const transactionId = data.transactionId || '';

    // Save order to database
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || null;
    let ipCity: string | null = null;
    if (clientIp) {
      try {
        const geo = await fetch(`http://ip-api.com/json/${clientIp}?fields=city,regionName,country`).then(r => r.json());
        if (geo.city) ipCity = `${geo.city}, ${geo.regionName}`;
      } catch {}
    }

    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      external_id: transactionId || identifier,
      gateway: 'mppagamentos',
      status: data.status === 'OK' ? 'pending' : (data.status || 'pending'),
      amount_cents: Math.round(amount * 100),
      buyer_name: buyerName || null,
      buyer_email: buyerEmail || null,
      buyer_document: buyerDocument ? buyerDocument.replace(/\D/g, '') : null,
      buyer_phone: buyerPhone || null,
      buyer_ip: clientIp,
      buyer_ip_city: ipCity,
      pix_code: pixCode,
      pix_qr_code_base64: pixQrCodeBase64,
      gateway_response: data,
      buyer_address: metadata?.address || null,
      buyer_address_number: metadata?.addressNumber || null,
      buyer_complement: metadata?.complement || null,
      buyer_neighborhood: metadata?.neighborhood || null,
      buyer_city: metadata?.city || null,
      buyer_state: metadata?.state || null,
      buyer_cep: metadata?.cep || null,
      shipping_method: metadata?.shippingMethod || null,
      shipping_cost_cents: metadata?.shippingCostCents || 0,
      items_description: metadata?.itemsDescription || null,
    }).select().single();

    if (orderError) {
      console.error('Order save error:', orderError);
    }

    // Fire venda_pendente webhook
    if (orderData) {
      await fireServerWebhooks(supabase, 'venda_pendente', {
        source: 'checkout',
        orderId: orderData.id,
        externalId: orderData.external_id,
        buyerName: buyerName || null,
        buyerEmail: buyerEmail || null,
        buyerPhone: buyerPhone || null,
        amount,
        gateway: 'mppagamentos',
      });
    }

    return new Response(JSON.stringify({
      ...data,
      order_id: orderData?.id || null,
      pix_code: pixCode,
      pix_qr_code_base64: pixQrCodeBase64,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
