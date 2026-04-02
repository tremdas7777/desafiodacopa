
CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert funnel_events"
  ON public.funnel_events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public select funnel_events"
  ON public.funnel_events FOR SELECT
  TO anon
  USING (true);

CREATE INDEX idx_funnel_events_created_at ON public.funnel_events (created_at DESC);
CREATE INDEX idx_funnel_events_event ON public.funnel_events (event);
