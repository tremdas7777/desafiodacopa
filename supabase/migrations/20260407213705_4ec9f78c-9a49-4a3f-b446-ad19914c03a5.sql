ALTER TABLE public.gateway_config
  ADD COLUMN IF NOT EXISTS mppagamentos_public_key text DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS mppagamentos_secret_key text DEFAULT ''::text;