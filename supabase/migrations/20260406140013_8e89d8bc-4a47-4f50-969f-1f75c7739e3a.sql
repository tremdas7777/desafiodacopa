
CREATE OR REPLACE FUNCTION public.get_funnel_stats(cutoff_time timestamptz, active_cutoff timestamptz)
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT json_build_object(
    'visitors', coalesce(sum(case when event = 'visitor' then 1 else 0 end), 0),
    'quizStarted', coalesce(sum(case when event = 'quiz_started' then 1 else 0 end), 0),
    'quizCompleted', coalesce(sum(case when event = 'quiz_completed' then 1 else 0 end), 0),
    'scratchCard', coalesce(sum(case when event = 'scratch_card' then 1 else 0 end), 0),
    'checkout', coalesce(sum(case when event = 'checkout' then 1 else 0 end), 0),
    'purchase', coalesce(sum(case when event = 'purchase' then 1 else 0 end), 0),
    'thankYou', coalesce(sum(case when event = 'thank_you' then 1 else 0 end), 0),
    'upsell', coalesce(sum(case when event = 'upsell' then 1 else 0 end), 0),
    'thankYouUpsell', coalesce(sum(case when event = 'thank_you_upsell' then 1 else 0 end), 0),
    'activeNow', coalesce(sum(case when created_at >= active_cutoff then 1 else 0 end), 0)
  )
  FROM public.funnel_events
  WHERE created_at >= cutoff_time;
$$;
