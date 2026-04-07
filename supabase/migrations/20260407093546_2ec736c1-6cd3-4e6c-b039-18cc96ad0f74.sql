-- Allow anon to SELECT abandoned_checkouts (needed for upsert conflict resolution)
CREATE POLICY "Anon can read abandoned_checkouts"
ON public.abandoned_checkouts
FOR SELECT
TO anon
USING (true);