
CREATE TABLE public.cloaker_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cloaker_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read cloaker_config"
  ON public.cloaker_config FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public update cloaker_config"
  ON public.cloaker_config FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

INSERT INTO public.cloaker_config (enabled) VALUES (true);
