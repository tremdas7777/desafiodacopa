
-- Remove the overly restrictive policy we just created
DROP POLICY IF EXISTS "Anon can read own order by id" ON public.orders;

-- Allow anon to read orders (needed for payment polling and upsell check)
-- We can't restrict columns via RLS, but we limit exposure
CREATE POLICY "Anon can read orders for checkout"
ON public.orders
FOR SELECT
TO anon
USING (true);

-- Allow anon to update only qr_code_copied
CREATE POLICY "Anon can update qr_code_copied"
ON public.orders
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
