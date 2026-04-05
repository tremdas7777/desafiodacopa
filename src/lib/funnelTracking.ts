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

  const { data, error } = await supabase
    .from('funnel_events')
    .select('event, created_at')
    .gte('created_at', cutoff);

  if (error) {
    console.warn('Failed to fetch funnel stats:', error);
    return { visitors: 0, quizStarted: 0, quizCompleted: 0, scratchCard: 0, checkout: 0, purchase: 0, thankYou: 0, upsell: 0, thankYouUpsell: 0, activeNow: 0 };
  }

  const events = data || [];
  const visitors = events.filter(e => e.event === 'visitor').length;
  const quizStarted = events.filter(e => e.event === 'quiz_started').length;
  const quizCompleted = events.filter(e => e.event === 'quiz_completed').length;
  const scratchCard = events.filter(e => e.event === 'scratch_card').length;
  const checkout = events.filter(e => e.event === 'checkout').length;
  const purchase = events.filter(e => e.event === 'purchase').length;
  const thankYou = events.filter(e => e.event === 'thank_you').length;
  const upsell = events.filter(e => e.event === 'upsell').length;
  const thankYouUpsell = events.filter(e => e.event === 'thank_you_upsell').length;
  const activeNow = events.filter(e => e.created_at >= activeNowCutoff).length;

  return { visitors, quizStarted, quizCompleted, scratchCard, checkout, purchase, thankYou, upsell, thankYouUpsell, activeNow };
}

export async function clearFunnelEvents() {
  // No-op: clearing from DB would require delete policy
  // Admin can use this as a placeholder
  console.log('Clear funnel events - data persists in database');
}
