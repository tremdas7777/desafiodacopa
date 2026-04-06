import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SIMPAYOUT_API_URL = 'https://api.payoutbr.com.br/v1/transactions';

function toBase64(str: string): string {
  return btoa(str);
}

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
      } catch (err) {
        console.error(`Webhook error (${webhook.url}):`, err);
      }
    }));
  } catch (err) {
    console.error('Error firing server webhooks:', err);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, clientSecret, amount, buyerName, buyerDocument, buyerPhone, buyerEmail, externalRef, metadata } = await req.json();

    // clientSecret is the secret key for Basic Auth
    if (!clientSecret || !amount) {
      return new Response(JSON.stringify({ error: 'clientSecret e amount são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`;

    // Basic Auth: base64(secretKey:x)
    const authHeader = 'Basic ' + toBase64(`${clientSecret}:x`);

    // Build transaction body
    const cleanDoc = buyerDocument ? buyerDocument.replace(/\D/g, '') : '';
    const txBody: Record<string, unknown> = {
      amount: Math.round(amount * 100),
      paymentMethod: 'pix',
      postbackUrl: webhookUrl,
      pix: {
        expiresIn: 3600,
      },
      customer: {
        name: buyerName || 'Cliente',
        email: buyerEmail || 'cliente@email.com',
        document: {
          type: cleanDoc.length > 11 ? 'cnpj' : 'cpf',
          number: cleanDoc || '00000000000',
        },
        phone: buyerPhone ? buyerPhone.replace(/\D/g, '') : '00000000000',
      },
      items: [
        {
          title: metadata?.itemsDescription || 'Panela Antiaderente 12L',
          quantity: 1,
          unitPrice: Math.round(amount * 100),
          tangible: true,
        }
      ],
    };

    if (externalRef) {
      txBody.reference = externalRef;
    }

    console.log('Creating Sim Payout transaction:', JSON.stringify(txBody));
    const txResponse = await fetch(SIMPAYOUT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(txBody),
    });

    const txText = await txResponse.text();
    console.log('Sim Payout response status:', txResponse.status, 'body:', txText.substring(0, 1000));

    let txData;
    try {
      txData = JSON.parse(txText);
    } catch {
      return new Response(JSON.stringify({ error: 'Sim Payout retornou resposta inválida', details: txText.substring(0, 300) }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!txResponse.ok) {
      return new Response(JSON.stringify({ error: 'Erro ao gerar PIX Sim Payout', details: txData }), {
        status: txResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract PIX data from response - field is pix.qrcode
    const pixCode = txData.pix?.qrcode || txData.pix?.qr_code || '';
    const pixQrCodeBase64 = txData.pix?.qr_code_base64 || '';
    const externalId = String(txData.id || externalRef || '');

    // Save order
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      external_id: String(externalId),
      gateway: 'simpayout',
      status: txData.status === 'paid' ? 'paid' : 'pending',
      amount_cents: Math.round(amount * 100),
      buyer_name: buyerName || null,
      buyer_email: buyerEmail || null,
      buyer_document: cleanDoc || null,
      buyer_phone: buyerPhone || null,
      pix_code: pixCode,
      pix_qr_code_base64: pixQrCodeBase64,
      gateway_response: txData,
      buyer_address: metadata?.address || null,
      buyer_address_number: metadata?.addressNumber || null,
      buyer_complement: metadata?.complement || null,
      buyer_neighborhood: metadata?.neighborhood || null,
      buyer_city: metadata?.city || null,
      buyer_state: metadata?.state || null,
      buyer_cep: metadata?.cep || null,
      shipping_method: metadata?.shippingMethod || null,
      shipping_cost_cents: metadata?.shippingCostCents || 0,
      items_description: metadata?.itemsDescription || 'Panela Antiaderente 12L',
    }).select().single();

    if (orderError) console.error('Order save error:', orderError);

    if (orderData) {
      await fireServerWebhooks(supabase, 'venda_pendente', {
        source: 'checkout',
        orderId: orderData.id,
        externalId: orderData.external_id,
        buyerName, buyerEmail, buyerPhone,
        amount,
        gateway: 'simpayout',
      });
    }


    return new Response(JSON.stringify({
      ...txData,
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
