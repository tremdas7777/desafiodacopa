
ALTER TABLE public.gateway_config 
  ADD COLUMN simpayout_client_id TEXT DEFAULT '',
  ADD COLUMN simpayout_client_secret TEXT DEFAULT '';
