CREATE POLICY "Anon can update qr_code_copied on orders"
ON public.orders
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);