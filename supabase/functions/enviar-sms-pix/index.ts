const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const SMSDEV_API_KEY = Deno.env.get('SMSDEV_API_KEY');
  if (!SMSDEV_API_KEY) {
    return new Response(JSON.stringify({ error: 'SMSDEV_API_KEY not configured' }), {
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

    // Format phone: keep only digits, ensure 55 prefix
    let phone = buyerPhone.replace(/\D/g, '');
    if (phone.length === 11 || phone.length === 10) {
      phone = '55' + phone;
    }

    const formattedAmount = (amount || 0).toFixed(2).replace('.', ',');
    const firstName = (buyerName || 'Cliente').split(' ')[0];

    const message = `Centauro: Ola ${firstName}! Seu pedido foi gerado. Valor: R$ ${formattedAmount}. Copie o codigo PIX abaixo e cole no app do seu banco para pagar: ${pixCode}`;

    // SMS Dev API - send SMS via GET
    const url = new URL('https://api.smsdev.com.br/v1/send');
    url.searchParams.set('key', SMSDEV_API_KEY);
    url.searchParams.set('type', '9');
    url.searchParams.set('number', phone);
    url.searchParams.set('msg', message);

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log('SMS Dev response:', JSON.stringify(data));

    if (data.situacao && data.situacao === 'OK') {
      return new Response(JSON.stringify({ success: true, id: data.id }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Even if not "OK", return the response for debugging
    return new Response(JSON.stringify({ success: true, response: data }), {
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
