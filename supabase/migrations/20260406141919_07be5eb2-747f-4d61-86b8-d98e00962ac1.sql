-- =============================================
-- ORDERS: protect customer PII
-- =============================================
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;

-- Keep public insert (checkout needs it)
-- Already exists: "Allow public insert on orders"

-- Authenticated users can read orders
CREATE POLICY "Authenticated users can select orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);

-- Service role can select (for webhooks/edge functions)
CREATE POLICY "Service role can select orders"
  ON public.orders FOR SELECT
  TO service_role
  USING (true);

-- Authenticated users can update orders
CREATE POLICY "Authenticated users can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role can update (for payment webhooks)
CREATE POLICY "Service role can update orders"
  ON public.orders FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Only authenticated can delete
CREATE POLICY "Authenticated users can delete orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- GATEWAY_CONFIG: protect API keys/secrets
-- =============================================
DROP POLICY IF EXISTS "Allow public read" ON public.gateway_config;
DROP POLICY IF EXISTS "Allow public insert" ON public.gateway_config;
DROP POLICY IF EXISTS "Allow public update" ON public.gateway_config;

CREATE POLICY "Authenticated users can read gateway_config"
  ON public.gateway_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can read gateway_config"
  ON public.gateway_config FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Authenticated users can insert gateway_config"
  ON public.gateway_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gateway_config"
  ON public.gateway_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage gateway_config"
  ON public.gateway_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- WEBHOOK_ENDPOINTS: protect webhook URLs
-- =============================================
DROP POLICY IF EXISTS "Allow public read webhook_endpoints" ON public.webhook_endpoints;
DROP POLICY IF EXISTS "Allow public insert webhook_endpoints" ON public.webhook_endpoints;
DROP POLICY IF EXISTS "Allow public update webhook_endpoints" ON public.webhook_endpoints;
DROP POLICY IF EXISTS "Allow public delete webhook_endpoints" ON public.webhook_endpoints;

CREATE POLICY "Authenticated users can manage webhook_endpoints"
  ON public.webhook_endpoints FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage webhook_endpoints"
  ON public.webhook_endpoints FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- PIXEL_CONFIG: keep public read, protect write
-- =============================================
DROP POLICY IF EXISTS "Allow public insert pixel_config" ON public.pixel_config;
DROP POLICY IF EXISTS "Allow public update pixel_config" ON public.pixel_config;

CREATE POLICY "Authenticated users can insert pixel_config"
  ON public.pixel_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pixel_config"
  ON public.pixel_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- CLOAKER_CONFIG: keep public read, protect write
-- =============================================
DROP POLICY IF EXISTS "Allow public update cloaker_config" ON public.cloaker_config;

CREATE POLICY "Authenticated users can update cloaker_config"
  ON public.cloaker_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);