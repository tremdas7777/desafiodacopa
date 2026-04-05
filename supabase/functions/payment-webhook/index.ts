import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    const targets = webhooks.filter((w: any) =>
      w.url?.trim() && w.events?.includes(eventType)
    );

    await Promise.allSettled(targets.map(async (webhook: any) => {
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: eventType,
            timestamp: new Date().toISOString(),
            ...payload,
          }),
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

// Normalize status from various gateway formats
function normalizeStatus(raw: any): string {
  const s = String(raw || '').toLowerCase();
  if (['paid', 'approved', 'completed', 'confirmed', 'captured'].includes(s)) return 'paid';
  if (['refunded', 'chargedback', 'chargeback'].includes(s)) return 'refunded';
  if (['expired', 'cancelled', 'canceled'].includes(s)) return 'expired';
  return s || 'pending';
}

// Extract external ID from various gateway payload formats
function extractExternalId(body: any): string | null {
  // Try common field names
  return String(
    body.id ||
    body.transaction_id ||
    body.transaction_hash ||
    body.tid ||
    body.data?.id ||
    body.data?.transaction_id ||
    body.object?.id ||
    ''
  ) || null;
}

// Extract status from various gateway payload formats
function extractStatus(body: any): string {
  return normalizeStatus(
    body.status ||
    body.current_status ||
    body.transaction_status ||
    body.data?.status ||
    body.object?.status ||
    body.event?.replace('transaction_', '') ||
    ''
  );
}

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
        await fireServerWebhooks(supabase, 'venda_aprovada', {
          source: 'admin-manual',
          orderId: body.orderId,
          buyerName: orderData.buyer_name,
          buyerEmail: orderData.buyer_email,
          buyerPhone: orderData.buyer_phone,
          amount: orderData.amount_cents / 100,
          gateway: orderData.gateway,
        });
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

    // Find the order by external_id
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('external_id', externalId)
      .single();

    if (!orderData) {
      console.warn(`[payment-webhook] Order not found for external_id: ${externalId}`);
      // Return 200 to avoid gateway retries for unknown orders
      return new Response(JSON.stringify({ received: true, warning: 'order_not_found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Skip if already in same or better status
    if (orderData.status === 'paid' && newStatus !== 'refunded') {
      console.log(`[payment-webhook] Order ${externalId} already paid, skipping`);
      return new Response(JSON.stringify({ received: true, status: 'already_paid' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderData.id);

    if (error) {
      console.error('Update error:', error);
    }

    console.log(`[payment-webhook] Order ${orderData.id} (ext: ${externalId}) updated to ${newStatus}`);

    // Fire webhook on approval
    if (newStatus === 'paid') {
      await fireServerWebhooks(supabase, 'venda_aprovada', {
        source: 'gateway-postback',
        orderId: orderData.id,
        externalId,
        buyerName: orderData.buyer_name,
        buyerEmail: orderData.buyer_email,
        buyerPhone: orderData.buyer_phone,
        amount: orderData.amount_cents / 100,
        gateway: orderData.gateway,
      });
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