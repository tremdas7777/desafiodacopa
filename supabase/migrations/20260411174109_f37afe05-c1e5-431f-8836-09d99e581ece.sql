
-- ============================================
-- 1. GATEWAY_CONFIG - REMOVE ANON READ (CRITICAL - exposes API keys)
-- ============================================
DROP POLICY IF EXISTS "Allow anon read gateway_config" ON public.gateway_config;

-- ============================================
-- 2. ORDERS - RESTRICT ANON ACCESS
-- ============================================
-- Remove broad anon read
DROP POLICY IF EXISTS "Anon can read orders" ON public.orders;

-- Remove broad anon update (was allowing updating ANY column)
DROP POLICY IF EXISTS "Anon can update qr_code_copied on orders" ON public.orders;

-- Allow anon to read ONLY their own order by ID (for polling payment status)
CREATE POLICY "Anon can read own order by id"
ON public.orders
FOR SELECT
TO anon
USING (false);
-- Note: We use false here. The checkout polls via service_role edge functions, not direct anon access.

-- Allow anon to update ONLY qr_code_copied column on their session's order
-- Actually, let's just block anon updates entirely - edge functions use service_role
-- No new update policy for anon needed.

-- ============================================
-- 3. ABANDONED_CHECKOUTS - RESTRICT ANON READ
-- ============================================
DROP POLICY IF EXISTS "Anon can read abandoned_checkouts" ON public.abandoned_checkouts;

-- ============================================
-- 4. FUNNEL_EVENTS - REMOVE ANON READ
-- ============================================
DROP POLICY IF EXISTS "Allow public select funnel_events" ON public.funnel_events;

-- ============================================
-- 5. PIXEL_CONFIG - Keep anon read (needed for pixel firing on frontend)
-- Already OK
-- ============================================

-- ============================================
-- 6. CLOAKER_CONFIG - Keep anon read (needed for cloaker check on frontend)  
-- Already OK
-- ============================================
