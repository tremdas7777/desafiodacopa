CREATE POLICY "Authenticated users can select funnel_events"
ON public.funnel_events
FOR SELECT
TO authenticated
USING (true);