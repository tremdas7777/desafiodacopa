// Pixel management - supports multiple pixels per platform
// Config is persisted in Supabase (pixel_config table) so ALL visitors load the pixels
// Events are queued until pixel scripts are ready, guaranteeing no events are lost

import { supabase } from '@/integrations/supabase/client';
import { getCampaignParams } from '@/lib/campaignParams';

export interface FacebookPixelEntry {
  id: string;
  pixelId: string;
  accessToken: string;
}

export interface TikTokPixelEntry {
  id: string;
  pixelId: string;
  accessToken: string;
}

export interface GoogleAdsEntry {
  id: string;
  adsId: string;
  adsLabel: string;
}

export interface PixelConfig {
  // Legacy single-pixel fields (kept for backward compat on load)
  facebookPixelId?: string;
  facebookAccessToken?: string;
  tiktokPixelId?: string;
  tiktokAccessToken?: string;
  googleAdsId?: string;
  googleAdsLabel?: string;
  // New multi-pixel arrays
  facebookPixels: FacebookPixelEntry[];
  tiktokPixels: TikTokPixelEntry[];
  googleAdsPixels: GoogleAdsEntry[];
  utmifyHtml?: string;
  // Conversion mode: true = fire only on paid, false = fire on pending + paid
  onlyPaid?: boolean;
}

const STORAGE_KEY = 'pixel_config';

function migrateConfig(raw: any): PixelConfig {
  const cfg: PixelConfig = {
    facebookPixels: raw.facebookPixels || [],
    tiktokPixels: raw.tiktokPixels || [],
    googleAdsPixels: raw.googleAdsPixels || [],
    utmifyHtml: raw.utmifyHtml || '',
    onlyPaid: raw.onlyPaid ?? false,
  };

  // Migrate legacy single fields into arrays if arrays are empty
  if (cfg.facebookPixels.length === 0 && raw.facebookPixelId) {
    cfg.facebookPixels.push({ id: crypto.randomUUID(), pixelId: raw.facebookPixelId, accessToken: raw.facebookAccessToken || '' });
  }
  if (cfg.tiktokPixels.length === 0 && raw.tiktokPixelId) {
    cfg.tiktokPixels.push({ id: crypto.randomUUID(), pixelId: raw.tiktokPixelId, accessToken: raw.tiktokAccessToken || '' });
  }
  if (cfg.googleAdsPixels.length === 0 && raw.googleAdsId) {
    cfg.googleAdsPixels.push({ id: crypto.randomUUID(), adsId: raw.googleAdsId, adsLabel: raw.googleAdsLabel || '' });
  }

  return cfg;
}

const DEFAULT_CONFIG: PixelConfig = {
  facebookPixels: [],
  tiktokPixels: [],
  googleAdsPixels: [],
  utmifyHtml: '',
  onlyPaid: false,
};

// In-memory cache so synchronous reads work after initial load
let cachedConfig: PixelConfig = DEFAULT_CONFIG;
let configLoaded = false;

// --- EVENT QUEUE SYSTEM ---
// Buffers events fired before pixel scripts are ready, then replays them
interface QueuedEvent {
  eventName: string;
  data?: Record<string, unknown>;
  userData?: { email?: string; phone?: string };
  eventId?: string;
}

let pixelsReady = false;
const eventQueue: QueuedEvent[] = [];
let pixelReadyResolve: (() => void) | null = null;
const pixelReadyPromise = new Promise<void>((resolve) => {
  pixelReadyResolve = resolve;
});

function markPixelsReady() {
  pixelsReady = true;
  if (pixelReadyResolve) {
    pixelReadyResolve();
    pixelReadyResolve = null;
  }
  // Replay queued events — CLIENT-SIDE ONLY (CAPI already fired when queued)
  while (eventQueue.length > 0) {
    const ev = eventQueue.shift()!;
    console.log(`[Pixels] Replaying queued event (client-only): ${ev.eventName}`);
    _fireClientPixelsOnly(ev.eventName, ev.data, ev.eventId);
  }
}

/** Synchronous getter – returns cached config (call loadPixelConfigFromDb first) */
export function getPixelConfig(): PixelConfig {
  // Fallback: if DB hasn't loaded yet, try localStorage (legacy)
  if (!configLoaded) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return migrateConfig(JSON.parse(raw));
    } catch { /* ignore */ }
  }
  return cachedConfig;
}

/** Load config from database and cache it */
export async function loadPixelConfigFromDb(): Promise<PixelConfig> {
  try {
    const { data, error } = await supabase
      .from('pixel_config')
      .select('config')
      .limit(1)
      .single();

    if (error || !data) {
      console.warn('[Pixels] Failed to load from DB, using fallback:', error?.message);
      return getPixelConfig();
    }

    const cfg = migrateConfig(data.config || {});
    cachedConfig = cfg;
    configLoaded = true;

    // Also sync to localStorage for legacy compat
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));

    return cfg;
  } catch (err) {
    console.warn('[Pixels] DB load error:', err);
    return getPixelConfig();
  }
}

/** Save config to database AND localStorage */
export async function savePixelConfig(config: PixelConfig) {
  cachedConfig = config;
  configLoaded = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

  try {
    // Get existing row
    const { data: existing } = await supabase
      .from('pixel_config')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      await supabase
        .from('pixel_config')
        .update({ config: config as any, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('pixel_config')
        .insert({ config: config as any });
    }
  } catch (err) {
    console.error('[Pixels] Failed to save to DB:', err);
  }

  injectPixels(config);
}

function removeExistingPixels() {
  document.querySelectorAll('[data-pixel-injected]').forEach(el => el.remove());
}

export function injectPixels(config?: PixelConfig) {
  const cfg = config || getPixelConfig();
  removeExistingPixels();

  const hasAnyPixel = cfg.facebookPixels.some(fb => fb.pixelId) || 
                      cfg.tiktokPixels.some(tt => tt.pixelId) || 
                      cfg.googleAdsPixels.some(ga => ga.adsId);

  // Facebook Pixels
  cfg.facebookPixels.forEach((fb, i) => {
    if (!fb.pixelId) return;
    const script = document.createElement('script');
    script.setAttribute('data-pixel-injected', `facebook-${i}`);
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${fb.pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.setAttribute('data-pixel-injected', `facebook-ns-${i}`);
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fb.pixelId}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);
  });

  // TikTok Pixels
  cfg.tiktokPixels.forEach((tt, i) => {
    if (!tt.pixelId) return;
    const script = document.createElement('script');
    script.setAttribute('data-pixel-injected', `tiktok-${i}`);
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${tt.pixelId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);
  });

  // Utmify HTML pixel
  if (cfg.utmifyHtml) {
    const container = document.createElement('div');
    container.setAttribute('data-pixel-injected', 'utmify-html');
    container.innerHTML = cfg.utmifyHtml;
    container.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.innerHTML = oldScript.innerHTML;
      newScript.setAttribute('data-pixel-injected', 'utmify-html');
      document.head.appendChild(newScript);
    });
    Array.from(container.children).forEach(child => {
      if (child.tagName !== 'SCRIPT') {
        (child as HTMLElement).setAttribute('data-pixel-injected', 'utmify-html');
        document.head.appendChild(child);
      }
    });
  }

  // Google Ads
  cfg.googleAdsPixels.forEach((ga, i) => {
    if (!ga.adsId) return;
    const gtagScript = document.createElement('script');
    gtagScript.setAttribute('data-pixel-injected', `google-ads-lib-${i}`);
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga.adsId}`;
    document.head.appendChild(gtagScript);

    const gtagInit = document.createElement('script');
    gtagInit.setAttribute('data-pixel-injected', `google-ads-init-${i}`);
    gtagInit.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga.adsId}');
    `;
    document.head.appendChild(gtagInit);
  });

  // Mark pixels as ready and replay queued events
  // Small delay to let injected scripts initialize (fbq, ttq, gtag)
  if (hasAnyPixel) {
    console.log('[Pixels] Scripts injected, waiting for initialization...');
    setTimeout(() => {
      console.log(`[Pixels] Ready! Queued events: ${eventQueue.length}`);
      markPixelsReady();
    }, 500);
  } else {
    // No pixels configured — mark ready immediately so CAPI calls still go through
    console.log('[Pixels] No client-side pixels configured, marking ready');
    markPixelsReady();
  }
}

// Helper: read a cookie by name
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Helper: SHA-256 hash for PII (Facebook/TikTok requirement)
async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Build hashed user_data for CAPI
async function buildFacebookUserData(userData?: { email?: string; phone?: string }) {
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');
  
  const result: Record<string, any> = {
    client_user_agent: navigator.userAgent,
  };

  if (fbp) result.fbp = fbp;
  if (fbc) result.fbc = fbc;
  
  // If no fbc cookie but fbclid in URL, build it
  if (!fbc) {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) {
      result.fbc = `fb.1.${Date.now()}.${fbclid}`;
    }
  }

  if (userData?.email) result.em = [await sha256(userData.email)];
  if (userData?.phone) {
    const phone = userData.phone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
    result.ph = [await sha256(fullPhone)];
  }

  return result;
}

// PUBLIC API: Fire conversion event — queues if pixels not ready yet
export function fireConversionEvent(eventName: string, data?: Record<string, unknown>, userData?: { email?: string; phone?: string }, eventId?: string) {
  if (!pixelsReady) {
    console.log(`[Pixels] Queuing event: ${eventName} (pixels not ready yet)`);
    eventQueue.push({ eventName, data, userData, eventId });
    // CAPI calls don't need client-side pixels — fire them immediately
    _fireCAPIOnly(eventName, data, userData, eventId);
    return;
  }
  _fireConversionEventNow(eventName, data, userData, eventId);
}

// Fire CAPI (server-side API calls) immediately — these don't depend on client pixel scripts
function _fireCAPIOnly(eventName: string, data?: Record<string, unknown>, userData?: { email?: string; phone?: string }, eventId?: string) {
  const cfg = getPixelConfig();
  const dedupEventId = eventId || `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Facebook Conversions API — works without fbq script
  cfg.facebookPixels.forEach(fb => {
    if (!fb.pixelId || !fb.accessToken) return;
    buildFacebookUserData(userData).then(user_data => {
      const eventData = {
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: dedupEventId,
          action_source: 'website',
          event_source_url: window.location.href,
          user_data,
          custom_data: data,
        }],
        access_token: fb.accessToken,
      };
      fetch(`https://graph.facebook.com/v19.0/${fb.pixelId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }).then(resp => resp.json()).then(result => {
        console.log(`[Pixels] Facebook CAPI ${eventName} sent:`, JSON.stringify(result));
      }).catch(err => console.error('Facebook CAPI error:', err));
    });
  });

  // TikTok Events API — works without ttq script
  const tiktokEventMap: Record<string, string> = {
    'Purchase': 'CompletePayment',
    'InitiateCheckout': 'InitiateCheckout',
    'AddToCart': 'AddToCart',
    'ViewContent': 'ViewContent',
    'Lead': 'SubmitForm',
  };
  const tiktokEventName = tiktokEventMap[eventName] || eventName;

  cfg.tiktokPixels.forEach(tt => {
    if (!tt.pixelId || !tt.accessToken) return;
    const ttp = getCookie('_ttp');
    const eventData: Record<string, any> = {
      pixel_code: tt.pixelId,
      event: tiktokEventName,
      event_id: dedupEventId,
      timestamp: new Date().toISOString(),
      context: {
        page: { url: window.location.href },
        user_agent: navigator.userAgent,
        user: ttp ? { ttp } : undefined,
      },
      properties: data,
    };
    fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': tt.accessToken,
      },
      body: JSON.stringify(eventData),
    }).catch(err => console.error('TikTok Events API error:', err));
  });
}


// Fire ONLY client-side pixel calls (used for replaying queued events where CAPI already fired)
function _fireClientPixelsOnly(eventName: string, data?: Record<string, unknown>, eventId?: string) {
  const cfg = getPixelConfig();
  const dedupEventId = eventId || `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Facebook - client pixel
  if (cfg.facebookPixels.some(fb => fb.pixelId) && typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', eventName, data, { eventID: dedupEventId });
    console.log(`[Pixels] fbq('track', '${eventName}') fired (replay)`);
  }

  // TikTok - client pixel
  const tiktokEventMap: Record<string, string> = {
    'Purchase': 'CompletePayment',
    'InitiateCheckout': 'InitiateCheckout',
    'AddToCart': 'AddToCart',
    'ViewContent': 'ViewContent',
    'Lead': 'SubmitForm',
  };
  const tiktokEventName = tiktokEventMap[eventName] || eventName;
  if (cfg.tiktokPixels.some(tt => tt.pixelId) && typeof (window as any).ttq?.track === 'function') {
    (window as any).ttq.track(tiktokEventName, data);
    console.log(`[Pixels] ttq.track('${tiktokEventName}') fired (replay)`);
  }

  // Google Ads - client pixel
  cfg.googleAdsPixels.forEach(ga => {
    if (!ga.adsId || typeof (window as any).gtag !== 'function') return;
    if (ga.adsLabel) {
      (window as any).gtag('event', 'conversion', {
        send_to: `${ga.adsId}/${ga.adsLabel}`,
        transaction_id: dedupEventId,
        ...data,
      });
      console.log(`[Pixels] gtag conversion sent (replay) to ${ga.adsId}/${ga.adsLabel}`);
    } else {
      (window as any).gtag('event', eventName === 'Purchase' ? 'conversion' : eventName, {
        transaction_id: dedupEventId,
        ...data,
      });
    }
  });
}

// Internal: fire all conversion events (client + CAPI) — only called when pixels are ready AND event is fresh
function _fireConversionEventNow(eventName: string, data?: Record<string, unknown>, userData?: { email?: string; phone?: string }, eventId?: string) {
  const cfg = getPixelConfig();
  const dedupEventId = eventId || `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Client-side pixels
  _fireClientPixelsOnly(eventName, data, dedupEventId);

  // Facebook - Conversions API for each pixel with token
  cfg.facebookPixels.forEach(fb => {
    if (!fb.pixelId || !fb.accessToken) return;
    buildFacebookUserData(userData).then(user_data => {
      const eventData = {
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: dedupEventId,
          action_source: 'website',
          event_source_url: window.location.href,
          user_data,
          custom_data: data,
        }],
        access_token: fb.accessToken,
      };
      fetch(`https://graph.facebook.com/v19.0/${fb.pixelId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }).then(resp => resp.json()).then(result => {
        console.log(`[Pixels] Facebook CAPI ${eventName} sent:`, JSON.stringify(result));
      }).catch(err => console.error('Facebook CAPI error:', err));
    });
  });

  // TikTok - Events API for each pixel with token
  const tiktokEventMap: Record<string, string> = {
    'Purchase': 'CompletePayment',
    'InitiateCheckout': 'InitiateCheckout',
    'AddToCart': 'AddToCart',
    'ViewContent': 'ViewContent',
    'Lead': 'SubmitForm',
  };
  const tiktokEventName = tiktokEventMap[eventName] || eventName;
  cfg.tiktokPixels.forEach(tt => {
    if (!tt.pixelId || !tt.accessToken) return;
    const ttp = getCookie('_ttp');
    const eventData: Record<string, any> = {
      pixel_code: tt.pixelId,
      event: tiktokEventName,
      event_id: dedupEventId,
      timestamp: new Date().toISOString(),
      context: {
        page: { url: window.location.href },
        user_agent: navigator.userAgent,
        user: ttp ? { ttp } : undefined,
      },
      properties: data,
    };
    fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': tt.accessToken,
      },
      body: JSON.stringify(eventData),
    }).catch(err => console.error('TikTok Events API error:', err));
  });
}
