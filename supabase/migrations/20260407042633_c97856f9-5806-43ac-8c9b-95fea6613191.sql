-- Fix: authenticated users can't read pixel_config
CREATE POLICY "Authenticated users can read pixel_config"
ON public.pixel_config
FOR SELECT
TO authenticated
USING (true);

-- Fix: authenticated users can't read cloaker_config
CREATE POLICY "Authenticated users can read cloaker_config"
ON public.cloaker_config
FOR SELECT
TO authenticated
USING (true);

-- Fix: authenticated users can't insert funnel_events
CREATE POLICY "Authenticated users can insert funnel_events"
ON public.funnel_events
FOR INSERT
TO authenticated
WITH CHECK (true);