const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY');
  if (!TWILIO_API_KEY) {
    return new Response(JSON.stringify({ error: 'TWILIO_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { buyerName, buyerPhone, pixCode, amount } = await req.json();

    if (!buyerPhone || !pixCode) {
      return new Response(JSON.stringify({ error: 'buyerPhone and pixCode are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format phone to E.164
    let phone = buyerPhone.replace(/\D/g, '');
    if (phone.length === 11 || phone.length === 10) {
      phone = '55' + phone;
    }
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    const firstName = (buyerName || 'Cliente').split(' ')[0];

    const message = `Centauro: ${firstName}, seu pedido foi reservado! Valor do frete: R$ 44,90. ATENCAO: o PIX expira em 5 minutos. Copie e cole no app do banco agora: ${pixCode}`;

    // First, get available phone numbers to use as "From"
    const numbersRes = await fetch(`${GATEWAY_URL}/IncomingPhoneNumbers.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TWILIO_API_KEY,
      },
    });
    const numbersData = await numbersRes.json();
    
    let fromNumber = '+15017122661'; // fallback
    if (numbersData?.incoming_phone_numbers?.length > 0) {
      fromNumber = numbersData.incoming_phone_numbers[0].phone_number;
    }

    // Send SMS via Twilio gateway
    const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TWILIO_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', JSON.stringify(data));
      throw new Error(`Twilio API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    console.log('SMS sent via Twilio:', data.sid);

    return new Response(JSON.stringify({ success: true, sid: data.sid }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending SMS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
