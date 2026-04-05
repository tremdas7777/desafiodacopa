ALTER TABLE public.gateway_config
  ADD COLUMN IF NOT EXISTS payevo_secret_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payevo_company_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payevo_receiver_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payevo_api_key text DEFAULT '';