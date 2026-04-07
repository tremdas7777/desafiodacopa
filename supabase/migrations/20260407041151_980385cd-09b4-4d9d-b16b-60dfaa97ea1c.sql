CREATE POLICY "Allow anon read gateway_config"
ON public.gateway_config
FOR SELECT
TO anon
USING (true);