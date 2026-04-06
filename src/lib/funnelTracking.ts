// Funnel event tracking using Supabase database
// Events: 'visitor' | 'quiz_started' | 'quiz_completed' | 'checkout' | 'purchase'

import { supabase } from '@/integrations/supabase/client';

export type FunnelEvent = 'visitor' | 'quiz_started' | 'quiz_completed' | 'scratch_card' | 'checkout' | 'purchase' | 'thank_you' | 'upsell' | 'thank_you_upsell';

const SESSION_KEY = 'funnel_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function trackEvent(event: FunnelEvent) {
  try {
    await supabase.from('funnel_events').insert({
      event,
      session_id: getSessionId(),
    });
  } catch (err) {
    console.warn('Failed to track funnel event:', err);
  }
}

export async function getFunnelStats(periodMinutes: number) {
  const cutoff = new Date(Date.now() - periodMinutes * 60 * 1000).toISOString();
  const activeNowCutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data, error } = await supabase.rpc('get_funnel_stats', {
    cutoff_time: cutoff,
    active_cutoff: activeNowCutoff,
  });

  if (error) {
    console.warn('Failed to fetch funnel stats:', error);
    return { visitors: 0, quizStarted: 0, quizCompleted: 0, scratchCard: 0, checkout: 0, purchase: 0, thankYou: 0, upsell: 0, thankYouUpsell: 0, activeNow: 0 };
  }

  const stats = data as Record<string, number> || {};
  return {
    visitors: stats.visitors || 0,
    quizStarted: stats.quizStarted || 0,
    quizCompleted: stats.quizCompleted || 0,
    scratchCard: stats.scratchCard || 0,
    checkout: stats.checkout || 0,
    purchase: stats.purchase || 0,
    thankYou: stats.thankYou || 0,
    upsell: stats.upsell || 0,
    thankYouUpsell: stats.thankYouUpsell || 0,
    activeNow: stats.activeNow || 0,
  };
}

export async function clearFunnelEvents() {
  // No-op: clearing from DB would require delete policy
  // Admin can use this as a placeholder
  console.log('Clear funnel events - data persists in database');
}
