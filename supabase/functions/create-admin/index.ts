import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { email, password, secret } = await req.json()

  // Simple secret to prevent unauthorized use
  if (secret !== 'setup-admin-2024') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Check if user exists
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existing = users?.find((u: any) => u.email === email)

  if (existing) {
    // Update password
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ success: true, action: 'password_updated' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Create user
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true, action: 'user_created' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})