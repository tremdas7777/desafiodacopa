
CREATE TABLE public.abandoned_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  last_step text NOT NULL DEFAULT 'identificação',
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  buyer_document text,
  buyer_city text,
  buyer_state text,
  converted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id)
);

ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert abandoned_checkouts"
  ON public.abandoned_checkouts FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update abandoned_checkouts"
  ON public.abandoned_checkouts FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can read abandoned_checkouts"
  ON public.abandoned_checkouts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete abandoned_checkouts"
  ON public.abandoned_checkouts FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Service role full access abandoned_checkouts"
  ON public.abandoned_checkouts FOR ALL TO service_role
  USING (true) WITH CHECK (true);
