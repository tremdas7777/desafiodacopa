ALTER TABLE public.cloaker_config
  ADD COLUMN google_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN tiktok_enabled boolean NOT NULL DEFAULT true;