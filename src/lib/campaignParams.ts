// Capture and persist campaign/tracking parameters from URL
// Supports Google Ads, Facebook, TikTok and custom cloaker params

const STORAGE_KEY = 'campaign_params';

// All recognized tracking parameter names
const TRACKED_PARAMS = [
  // Google Ads
  'gclid', 'wbraid', 'gbraid', 'ref_id',
  'cck', 'tck', 'gck', 'cr', 'plc', 'mtx', 'rdn', 'kw',
  'cpc', 'disp', 'int', 'loc', 'net', 'dev', 'xgo',
  // Facebook Ads (via cloaker)
  'fbclid', 'cname', 'domain', 'placement', 'adset', 'adname', 'site',
  // TikTok
  'ttclid',
  // UTM standard
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  // Utmify
  'src', 'sck',
];

export interface CampaignParams {
  [key: string]: string;
}

/**
 * Capture campaign params from current URL and save to sessionStorage.
 * Only overwrites if new params are present (preserves first-touch).
 */
export function captureCampaignParams(): CampaignParams {
  const urlParams = new URLSearchParams(window.location.search);
  const captured: CampaignParams = {};

  TRACKED_PARAMS.forEach(param => {
    const value = urlParams.get(param);
    if (value) captured[param] = value;
  });

  // Only save if we found tracking params
  if (Object.keys(captured).length > 0) {
    // Merge with existing (first-touch preserved, new params added)
    const existing = getCampaignParams();
    const merged = { ...existing, ...captured };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    console.log('[Campaign] Captured params:', Object.keys(captured).join(', '));
    return merged;
  }

  return getCampaignParams();
}

/**
 * Get stored campaign params from sessionStorage.
 */
export function getCampaignParams(): CampaignParams {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get the landing page URL (saved on first visit).
 */
export function getLandingUrl(): string {
  const key = 'campaign_landing_url';
  const existing = sessionStorage.getItem(key);
  if (!existing) {
    sessionStorage.setItem(key, window.location.href);
    return window.location.href;
  }
  return existing;
}
