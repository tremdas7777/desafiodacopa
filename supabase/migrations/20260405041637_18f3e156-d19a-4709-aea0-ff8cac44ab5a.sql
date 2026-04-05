
CREATE TABLE public.pixel_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pixel_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read pixel_config" ON public.pixel_config FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public update pixel_config" ON public.pixel_config FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert pixel_config" ON public.pixel_config FOR INSERT TO anon WITH CHECK (true);

INSERT INTO public.pixel_config (config) VALUES ('{}'::jsonb);
