import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// --- Server Webhooks ---
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

// --- SHA-256 hash helper ---
async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Server-side Pixel Conversions ---
async function fireServerPixelConversions(
  supabase: any,
  order: any,
) {
  try {
    const { data: pixelRow } = await supabase
      .from('pixel_config')
      .select('config')
      .limit(1)
      .single();

    if (!pixelRow?.config) {
      console.log('[pixels] No pixel config found, skipping server-side conversions');
      return;
    }

    const cfg = pixelRow.config;
    const amount = order.amount_cents / 100;

    // --- Facebook Conversions API ---
    const fbPixels = cfg.facebookPixels || [];
    await Promise.allSettled(fbPixels.map(async (fb: any) => {
      if (!fb.pixelId || !fb.accessToken) return;
      try {
        const userData: Record<string, any> = {
          client_user_agent: 'server-side',
        };

        if (order.buyer_email) {
          userData.em = [await sha256(order.buyer_email)];
        }
        if (order.buyer_phone) {
          const phone = (order.buyer_phone || '').replace(/\D/g, '');
          const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
          userData.ph = [await sha256(fullPhone)];
        }
        if (order.buyer_name) {
          const nameParts = order.buyer_name.trim().split(/\s+/);
          if (nameParts.length > 0) userData.fn = [await sha256(nameParts[0])];
          if (nameParts.length > 1) userData.ln = [await sha256(nameParts[nameParts.length - 1])];
        }

        const eventData = {
          data: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: `purchase_${order.id}`,
            action_source: 'website',
            user_data: userData,
            custom_data: {
              value: amount,
              currency: 'BRL',
              order_id: order.id,
            },
          }],
          access_token: fb.accessToken,
        };

        const resp = await fetch(`https://graph.facebook.com/v19.0/${fb.pixelId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        const result = await resp.json();
        console.log(`[pixels] Facebook CAPI sent for pixel ${fb.pixelId}:`, JSON.stringify(result));
      } catch (err) {
        console.error(`[pixels] Facebook CAPI error (${fb.pixelId}):`, err);
      }
    }));

    // --- TikTok Events API ---
    const ttPixels = cfg.tiktokPixels || [];
    await Promise.allSettled(ttPixels.map(async (tt: any) => {
      if (!tt.pixelId || !tt.accessToken) return;
      try {
        const user: Record<string, any> = {};
        if (order.buyer_email) user.email = await sha256(order.buyer_email);
        if (order.buyer_phone) {
          const phone = (order.buyer_phone || '').replace(/\D/g, '');
          const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
          user.phone = await sha256(fullPhone);
        }

        const eventData = {
          pixel_code: tt.pixelId,
          event: 'CompletePayment',
          event_id: `purchase_${order.id}`,
          timestamp: new Date().toISOString(),
          context: {
            user_agent: 'server-side',
            user,
          },
          properties: {
            value: amount,
            currency: 'BRL',
            order_id: order.id,
            contents: [{ content_type: 'product', content_id: order.id, quantity: 1 }],
          },
        };

        const resp = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': tt.accessToken,
          },
          body: JSON.stringify(eventData),
        });
        const result = await resp.json();
        console.log(`[pixels] TikTok Events API sent for pixel ${tt.pixelId}:`, JSON.stringify(result));
      } catch (err) {
        console.error(`[pixels] TikTok Events API error (${tt.pixelId}):`, err);
      }
    }));

    // --- Google Ads Enhanced Conversions (via gtag Measurement Protocol) ---
    // Note: Google Ads server-side requires GA4 Measurement Protocol
    // Users need to add ga4MeasurementId and ga4ApiSecret to their pixel config
    const ga4Id = cfg.ga4MeasurementId;
    const ga4Secret = cfg.ga4ApiSecret;
    if (ga4Id && ga4Secret) {
      try {
        const eventPayload = {
          client_id: order.id,
          events: [{
            name: 'purchase',
            params: {
              transaction_id: order.id,
              value: amount,
              currency: 'BRL',
              items: [{ item_name: order.items_description || 'Frete', price: amount, quantity: 1 }],
            },
          }],
          user_data: {
            sha256_email_address: order.buyer_email ? [await sha256(order.buyer_email)] : undefined,
            sha256_phone_number: order.buyer_phone ? [await sha256(order.buyer_phone.replace(/\D/g, ''))] : undefined,
          },
        };

        const resp = await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${ga4Id}&api_secret=${ga4Secret}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventPayload),
          }
        );
        console.log(`[pixels] GA4 Measurement Protocol sent: status=${resp.status}`);
      } catch (err) {
        console.error('[pixels] GA4 Measurement Protocol error:', err);
      }
    }

    console.log('[pixels] Server-side conversion tracking completed');
  } catch (err) {
    console.error('[pixels] Error firing server-side conversions:', err);
  }
}

// --- Status helpers ---
function normalizeStatus(raw: any): string {
  const s = String(raw || '').toLowerCase().trim();
  // Only these exact values should map to 'paid'
  if (['paid', 'approved', 'completed', 'confirmed', 'captured'].includes(s)) return 'paid';
  if (['refunded', 'chargedback', 'chargeback'].includes(s)) return 'refunded';
  if (['expired', 'cancelled', 'canceled'].includes(s)) return 'expired';
  if (['pending', 'waiting_payment', 'processing', 'created', 'generated'].includes(s)) return 'pending';
  // Unknown status → do NOT default to something that could be interpreted as paid
  console.log(`[payment-webhook] Unknown status value: "${s}", treating as pending`);
  return 'pending';
}

function extractExternalId(body: any): string | null {
  const id = String(
    body.data?.id ||
    body.data?.transaction_id ||
    body.transaction_id ||
    body.transaction_hash ||
    body.tid ||
    body.object?.id ||
    body.id ||
    ''
  );
  return id || null;
}

function extractStatus(body: any): string {
  // Try each known field, take the FIRST non-empty one
  const candidates = [
    { field: 'current_status', value: body.current_status },
    { field: 'transaction_status', value: body.transaction_status },
    { field: 'data.status', value: body.data?.status },
    { field: 'object.status', value: body.object?.status },
    { field: 'status', value: body.status },
  ];

  // 'event' field (e.g. "transaction_paid") is a special case
  const eventStatus = body.event ? body.event.replace('transaction_', '') : undefined;
  if (eventStatus) {
    candidates.push({ field: 'event', value: eventStatus });
  }

  let raw = '';
  let sourceField = 'none';
  for (const c of candidates) {
    if (c.value && String(c.value).trim()) {
      raw = String(c.value).trim();
      sourceField = c.field;
      break;
    }
  }

  console.log(`[payment-webhook] Status extraction: field="${sourceField}", raw="${raw}", all_fields=${JSON.stringify({
    status: body.status,
    current_status: body.current_status,
    transaction_status: body.transaction_status,
    data_status: body.data?.status,
    object_status: body.object?.status,
    event: body.event,
  })}`);

  return normalizeStatus(raw);
}

// --- Main handler ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log('[payment-webhook] Received:', JSON.stringify(body).substring(0, 2000));

    // Handle manual status update from admin
    if (body.orderId && body.action === 'approve') {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', body.orderId)
        .single();

      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', body.orderId);

      if (error) {
        console.error('Approve error:', error);
        return new Response(JSON.stringify({ error: 'Erro ao aprovar pedido' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (orderData) {
        // Fire webhooks + server-side pixel conversions in parallel
        await Promise.allSettled([
          fireServerWebhooks(supabase, 'venda_aprovada', {
            source: 'admin-manual',
            orderId: body.orderId,
            buyerName: orderData.buyer_name,
            buyerEmail: orderData.buyer_email,
            buyerPhone: orderData.buyer_phone,
            amount: orderData.amount_cents / 100,
            gateway: orderData.gateway,
          }),
          fireServerPixelConversions(supabase, orderData),
        ]);
      }

      return new Response(JSON.stringify({ success: true, status: 'paid' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle postback from payment gateways
    const externalId = extractExternalId(body);
    const newStatus = extractStatus(body);

    if (!externalId) {
      console.warn('[payment-webhook] No external ID found in payload');
      return new Response(JSON.stringify({ error: 'No transaction ID found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[payment-webhook] Processing: externalId=${externalId}, status=${newStatus}`);

    // Try to find the order, with retry for race condition (webhook arrives before INSERT completes)
    let orderData: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('external_id', externalId)
        .single();

      if (data) {
        orderData = data;
        break;
      }

      if (attempt < 5) {
        console.log(`[payment-webhook] Order not found for external_id: ${externalId}, retry ${attempt}/5 in 3s...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    if (!orderData) {
      console.warn(`[payment-webhook] Order not found after 5 retries for external_id: ${externalId}`);
      return new Response(JSON.stringify({ received: true, warning: 'order_not_found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (orderData.status === 'paid' && newStatus !== 'refunded') {
      console.log(`[payment-webhook] Order ${externalId} already paid, skipping`);
      return new Response(JSON.stringify({ received: true, status: 'already_paid' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderData.id);

    if (error) {
      console.error('Update error:', error);
    }

    console.log(`[payment-webhook] Order ${orderData.id} (ext: ${externalId}) updated to ${newStatus}`);

    // Fire webhooks + server-side pixel conversions on approval
    if (newStatus === 'paid') {
      await Promise.allSettled([
        fireServerWebhooks(supabase, 'venda_aprovada', {
          source: 'gateway-postback',
          orderId: orderData.id,
          externalId,
          buyerName: orderData.buyer_name,
          buyerEmail: orderData.buyer_email,
          buyerPhone: orderData.buyer_phone,
          amount: orderData.amount_cents / 100,
          gateway: orderData.gateway,
        }),
        fireServerPixelConversions(supabase, orderData),
      ]);
    }

    return new Response(JSON.stringify({ received: true, status: newStatus }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[payment-webhook] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
