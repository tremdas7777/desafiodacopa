CREATE POLICY "Anon can read orders"
ON public.orders
FOR SELECT
TO anon
USING (true);