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

function flattenForForm(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenForForm(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(result, flattenForForm(item as Record<string, unknown>, `${fullKey}[${i}]`));
        } else {
          result[`${fullKey}[${i}]`] = String(item);
        }
      });
    } else if (value !== undefined && value !== null) {
      result[fullKey] = String(value);
    }
  }
  return result;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    if (!finalProductHash) {
      return new Response(JSON.stringify({ error: 'Product Hash da Iron Pay não configurado. Configure no painel admin.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`;
    const amountCents = Math.round(amount * 100);

    const body: Record<string, unknown> = {
      product_hash: finalProductHash,
      offer_hash: finalProductHash,
      operation_type: 'pix',
      amount: amountCents,
      payment_method: 'pix',
      postback_url: webhookUrl,
      cart: [
        {
          title: 'Frete SEDEX',
          price: amountCents,
          quantity: 1,
        },
      ],
    };

    if (buyerName || buyerEmail || buyerDocument || buyerPhone) {
      body.customer = {
        ...(buyerName && { name: buyerName }),
        ...(buyerEmail && { email: buyerEmail }),
        ...(buyerPhone && { phone: buyerPhone.replace(/\D/g, '') }),
        ...(buyerDocument && {
          documents: [{ type: 'cpf', number: buyerDocument.replace(/\D/g, '') }],
        }),
      };
    }

    if (externalRef) {
      body.external_ref = externalRef;
    }

    const apiUrl = `https://api.ironpayapp.com.br/api/public/v1/transactions?api_token=${apiToken}`;
    console.log('Calling Iron Pay API with product_hash:', finalProductHash);

    // Build FormData for Laravel API
    const formData = new FormData();
    const flat = flattenForForm(body);
    for (const [k, v] of Object.entries(flat)) {
      formData.append(k, v);
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('IronPay error:', JSON.stringify(data));
      return new Response(JSON.stringify({ error: 'Erro na API IronPay', details: data }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('IronPay success response:', JSON.stringify(data));

    const pixCode = data.pix?.qrcode || data.pix?.qr_code || data.pix_qr_code || data.qr_code || data.pix?.emv || '';
    const pixQrCodeBase64 = data.pix?.qrcodeBase64 || data.pix?.qr_code_base64 || data.pix_qr_code_url || data.qr_code_url || '';

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || null;
    let ipCity: string | null = null;
    if (clientIp) {
      try { const geo = await fetch(`http://ip-api.com/json/${clientIp}?fields=city,regionName,country`).then(r => r.json()); if (geo.city) ipCity = `${geo.city}, ${geo.regionName}`; } catch {}
    }
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      external_id: data.transaction_hash || data.id?.toString() || data.tid || externalRef || null,
      gateway: 'ironpay',
      status: data.status || 'pending',
      amount_cents: amountCents,
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
