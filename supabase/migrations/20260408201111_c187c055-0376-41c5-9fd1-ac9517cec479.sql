
ALTER TABLE public.cloaker_config
  ADD COLUMN facebook_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE public.cloaker_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text,
  user_agent text,
  reason text NOT NULL,
  confidence integer NOT NULL DEFAULT 0,
  blocked boolean NOT NULL DEFAULT false,
  signals jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cloaker_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert cloaker_logs"
  ON public.cloaker_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read cloaker_logs"
  ON public.cloaker_logs FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Authenticated can read cloaker_logs"
  ON public.cloaker_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_cloaker_logs_created_at ON public.cloaker_logs (created_at DESC);
CREATE INDEX idx_cloaker_logs_blocked ON public.cloaker_logs (blocked) WHERE blocked = true;
