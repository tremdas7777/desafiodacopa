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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const IRONPAY_BASE = "https://api.ironpayapp.com.br/api/public/v1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiToken, productHash, amount, buyerName, buyerEmail, buyerDocument, buyerPhone, externalRef, metadata } = await req.json();

    if (!apiToken || !amount) {
      return new Response(JSON.stringify({ error: 'apiToken e amount são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If no productHash provided, try to fetch from gateway_config
    let finalProductHash = productHash || '';
    if (!finalProductHash) {
      const { data: gcData } = await supabase
        .from('gateway_config')
        .select('ironpay_product_hash')
        .limit(1)
        .single();
      finalProductHash = gcData?.ironpay_product_hash || '';
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`;
    const amountCents = Math.round(amount * 100);

    const cleanCpf = buyerDocument ? buyerDocument.replace(/\D/g, '') : '';
    const cleanPhone = buyerPhone ? buyerPhone.replace(/\D/g, '') : '';

    // Build payload matching Plaud's working Iron Pay integration
    const transactionPayload: Record<string, unknown> = {
      api_token: apiToken,
      offer_hash: finalProductHash || '',
      product_hash: finalProductHash || '',
      title: 'Frete SEDEX',
      operation_type: '1',
      cart: [
        {
          offer_hash: finalProductHash || '',
          product_hash: finalProductHash || '',
          title: 'Frete SEDEX',
          operation_type: '1',
          quantity: 1,
          price: amountCents,
        },
      ],
      payment_method: 'pix',
      amount: amountCents,
      postback_url: webhookUrl,
      customer: {
        name: buyerName || 'Cliente',
        email: buyerEmail || 'cliente@email.com',
        document: cleanCpf,
        phone: cleanPhone,
      },
    };

    if (externalRef) {
      transactionPayload.external_ref = externalRef;
    }

    console.log('IronPay request payload:', JSON.stringify(transactionPayload));

    const response = await fetch(`${IRONPAY_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(transactionPayload),
    });

    const responseText = await response.text();
    console.log('IronPay response status:', response.status);
    console.log('IronPay response body:', responseText);

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(responseText);
    } catch {
      return new Response(
        JSON.stringify({ error: `Resposta inválida da IronPay: ${responseText.slice(0, 200)}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorMsg = (data.message as string) || (data.error as string) || `IronPay retornou status ${response.status}`;
      console.error('IronPay error:', errorMsg, JSON.stringify(data));
      return new Response(JSON.stringify({ error: errorMsg, details: data }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('IronPay transaction created successfully');

    // Extract PIX data
    const pixData = (data.pix as Record<string, unknown>) || {};
    const pixCode = (pixData.pix_qr_code as string) || (data.pix_qr_code as string) || (data.qr_code as string) || (data.pix_copy_paste as string) || (data.emv as string) || '';
    const pixQrCodeBase64 = (pixData.pix_url as string) || (data.pix_qr_code_url as string) || (data.qr_code_url as string) || '';

    // Get client IP for geo
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || null;
    let ipCity: string | null = null;
    if (clientIp) {
      try {
        const geo = await fetch(`http://ip-api.com/json/${clientIp}?fields=city,regionName,country`).then(r => r.json());
        if (geo.city) ipCity = `${geo.city}, ${geo.regionName}`;
      } catch {}
    }

    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      external_id: (data.hash as string) || (data.transaction_hash as string) || data.id?.toString() || externalRef || null,
      gateway: 'ironpay',
      status: (data.payment_status as string) || (data.status as string) || 'pending',
      amount_cents: amountCents,
      buyer_name: buyerName || null,
      buyer_email: buyerEmail || null,
      buyer_document: cleanCpf || null,
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

    if (orderData) {
      await fireServerWebhooks(supabase, 'venda_pendente', {
        source: 'checkout',
        orderId: orderData.id,
        externalId: orderData.external_id,
        buyerName: buyerName || null,
        buyerEmail: buyerEmail || null,
        buyerPhone: buyerPhone || null,
        amount: amount,
        gateway: 'ironpay',
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
