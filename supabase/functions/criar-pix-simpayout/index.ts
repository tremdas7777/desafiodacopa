import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SIMPAYOUT_AUTH_URL = 'https://api.somossimpay.com.br/v2/auth/token/';
const SIMPAYOUT_PIX_URL = 'https://api.somossimpay.com.br/v2/finance/create-pix-copy-and-paste/';

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

    if (!clientId || !clientSecret || !amount) {
      return new Response(JSON.stringify({ error: 'clientId, clientSecret e amount são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Get access token
    console.log('Authenticating with Sim Payout...');
    const authResponse = await fetch(SIMPAYOUT_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const authData = await authResponse.json();
    if (!authResponse.ok || !authData.access) {
      console.error('Sim Payout auth error:', JSON.stringify(authData));
      return new Response(JSON.stringify({ error: 'Erro na autenticação Sim Payout', details: authData }), {
        status: authResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = authData.access;
    console.log('Sim Payout authenticated successfully');

    // Step 2: Create PIX Cash In
    const pixBody: Record<string, unknown> = {
      amount: amount,
      type_fine: 'NONE',
      fine: 0,
      base_64_image: true,
    };

    // Add optional debtor info
    if (buyerDocument) {
      const cleanDoc = buyerDocument.replace(/\D/g, '');
      pixBody.debtor_document = cleanDoc;
      pixBody.type_document = cleanDoc.length > 11 ? 'CNPJ' : 'CPF';
    }
    if (buyerName) {
      pixBody.debtor_name = buyerName.substring(0, 25);
    }
    if (externalRef) {
      pixBody.tag = externalRef;
    }

    console.log('Creating PIX Cash In:', JSON.stringify(pixBody));
    const pixResponse = await fetch(SIMPAYOUT_PIX_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(pixBody),
    });

    const pixData = await pixResponse.json();
    if (!pixResponse.ok || !pixData.worked) {
      console.error('Sim Payout PIX error:', JSON.stringify(pixData));
      return new Response(JSON.stringify({ error: 'Erro ao gerar PIX Sim Payout', details: pixData }), {
        status: pixResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sim Payout PIX created successfully:', JSON.stringify(pixData));

    const pixCode = pixData.pix_copy_and_paste || '';
    const pixQrCodeBase64 = pixData.base_64_image || '';

    // Save order to database
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      external_id: String(pixData.qr_code_id || externalRef || ''),
      gateway: 'simpayout',
      status: pixData.status === 'PAID' ? 'paid' : 'pending',
      amount_cents: Math.round(amount * 100),
      buyer_name: buyerName || null,
      buyer_email: buyerEmail || null,
      buyer_document: buyerDocument ? buyerDocument.replace(/\D/g, '') : null,
      buyer_phone: buyerPhone || null,
      pix_code: pixCode,
      pix_qr_code_base64: pixQrCodeBase64,
      gateway_response: pixData,
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
        amount: amount,
        gateway: 'simpayout',
      });
    }

    // Send SMS if available
    if (buyerPhone) {
      try {
        const smsToken = Deno.env.get('CPF_API_KEY');
        if (smsToken) {
          const phoneClean = buyerPhone.replace(/\D/g, '');
          const phoneFormatted = phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`;
          const firstName = buyerName ? buyerName.split(' ')[0] : 'Cliente';
          const smsMessage = `Centauro: ${firstName}, seus premios exclusivos estao liberados! Pague o PIX e receba em 3 a 5 dias uteis.`;
          const smsResponse = await fetch(`https://sms.aresfun.com/v1/integration/${smsToken}/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: [phoneFormatted], from: "29094", message: smsMessage }),
          });
          console.log('SMS sent:', await smsResponse.text());
        }
      } catch (smsError) {
        console.error('SMS send error:', smsError);
      }
    }

    return new Response(JSON.stringify({
      ...pixData,
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
