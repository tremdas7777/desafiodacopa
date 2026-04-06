const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_BOT_PATTERNS = [
  'adsbot-google', 'googlebot', 'mediapartners-google',
  'google-inspectiontool', 'google-adwords', 'google-read-aloud',
  'feedfetcher-google', 'google-site-verification',
  'google-structured-data-testing-tool', 'google-xrawler',
  'googleother', 'storebot-google', 'apis-google',
  'google-safety', 'chrome-lighthouse', 'google page speed', 'pagespeed',
];

const GOOGLE_IP_PREFIXES = [
  '66.249.', '64.233.', '72.14.', '74.125.', '209.85.', '216.239.',
  '66.102.', '108.177.', '142.250.', '172.217.', '173.194.',
  '207.126.', '209.116.', '35.191.',
  ...Array.from({ length: 56 }, (_, i) => `35.${192 + i}.`),
  ...Array.from({ length: 96 }, (_, i) => `34.${64 + i}.`),
];

const SUSPICIOUS_UA_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'headlesschrome', 'phantomjs', 'selenium', 'puppeteer', 'playwright',
  'semrushbot', 'ahrefsbot', 'dotbot', 'rogerbot', 'screaming frog',
  'bytespider', 'yandexbot', 'baiduspider', 'sogou', 'exabot',
  'facebookexternalhit', 'twitterbot', 'slurp', 'duckduckbot',
  'archive.org_bot', 'ia_archiver', 'mj12bot', 'blexbot',
  'dataforseo', 'serpstatbot', 'zoominfobot', 'petalbot',
  'applebot', 'bingbot', 'adidxbot', 'httpclient',
  'libwww', 'httpunit', 'nutch', 'biglotron',
  'teoma', 'convera', 'gigablast', 'webmon',
  'httrack', 'grub.org', 'netresearchserver', 'speedy',
  'fluffy', 'findlink', 'panscient', 'ips-agent',
  'yanga', 'cyberpatrol', 'postrank', 'page2rss',
];

// Known datacenter/cloud IP prefixes (bots often run from these)
const DATACENTER_PREFIXES = [
  // AWS
  '3.', '13.', '18.', '34.', '35.', '44.', '50.', '52.', '54.', '99.',
  // Azure
  '13.', '20.', '23.', '40.', '51.', '52.', '65.', '70.', '104.',
  // GCP (already covered above for Google-specific)
];

// Blocked cities (normalized lowercase)
const BLOCKED_CITIES = [
  'vitoria da conquista',
  'vitória da conquista',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     req.headers.get('cf-connecting-ip') || '';
    const referer = (req.headers.get('referer') || '').toLowerCase();

    let isBot = false;
    let reason = '';
    let confidence = 0; // 0-100

    // Parse client fingerprint data
    let fingerprint: Record<string, any> = {};
    try {
      if (req.method === 'POST') {
        fingerprint = await req.json();
      }
    } catch { /* ignore */ }

    const cityCheckOnly = fingerprint.cityCheckOnly === true;

    // === LAYER 0: City Geolocation Block (always runs) ===
    if (!isBot && clientIp) {
      try {
        const geo = await fetch(`http://ip-api.com/json/${clientIp}?fields=city,regionName,country`).then(r => r.json());
        const city = (geo.city || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (const blocked of BLOCKED_CITIES) {
          const normalizedBlocked = blocked.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (city === normalizedBlocked || city.includes(normalizedBlocked)) {
            isBot = true;
            reason = `blocked_city:${geo.city}`;
            confidence = 99;
            break;
          }
        }
      } catch { /* ignore */ }
    }

    // If cityCheckOnly, skip all bot detection layers
    if (cityCheckOnly || isBot) {
      return new Response(
        JSON.stringify({ isBot, reason: isBot ? reason : 'real_user', confidence, timestamp: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // === LAYER 1: User-Agent Analysis ===

    // Check for Google bot patterns (highest priority)
    for (const pattern of GOOGLE_BOT_PATTERNS) {
      if (userAgent.includes(pattern)) {
        isBot = true;
        reason = `google_bot_ua:${pattern}`;
        confidence = 95;
        break;
      }
    }

    // Check for other known bot UAs
    if (!isBot) {
      for (const pattern of SUSPICIOUS_UA_PATTERNS) {
        if (userAgent.includes(pattern)) {
          isBot = true;
          reason = `suspicious_ua:${pattern}`;
          confidence = 85;
          break;
        }
      }
    }

    // === LAYER 2: IP Analysis ===

    // Google IP ranges
    if (!isBot && clientIp) {
      for (const prefix of GOOGLE_IP_PREFIXES) {
        if (clientIp.startsWith(prefix)) {
          isBot = true;
          reason = `google_ip:${prefix}`;
          confidence = 90;
          break;
        }
      }
    }

    // === LAYER 3: Header Analysis ===

    if (!isBot) {
      // Empty or very short UA
      if (userAgent.length < 10) {
        isBot = true;
        reason = 'empty_or_short_ua';
        confidence = 80;
      }

      // Google Ads review referrer
      if (!isBot && (referer.includes('google.com/ads') || referer.includes('googleads.g.doubleclick'))) {
        isBot = true;
        reason = 'google_ads_referer';
        confidence = 95;
      }

      // Missing Accept-Language header (real browsers always send this)
      const acceptLang = req.headers.get('accept-language');
      if (!isBot && (!acceptLang || acceptLang.length === 0)) {
        confidence += 30;
        if (confidence >= 60) {
          isBot = true;
          reason = 'no_accept_language';
        }
      }

      // Check for common bot headers
      const viaHeader = req.headers.get('via') || '';
      if (!isBot && viaHeader.includes('google')) {
        isBot = true;
        reason = 'via_header_google';
        confidence = 85;
      }
    }

    // === LAYER 4: Fingerprint Cross-Validation ===
    if (!isBot && fingerprint && Object.keys(fingerprint).length > 0) {
      let suspicionScore = 0;

      // No plugins on desktop Chrome = suspicious
      if (fingerprint.pluginCount === 0 && userAgent.includes('chrome') && !userAgent.includes('mobile')) {
        suspicionScore += 25;
      }

      // Software rendering indicators
      if (fingerprint.colorDepth && fingerprint.colorDepth < 15) {
        suspicionScore += 20;
      }

      // Zero pixel ratio
      if (!fingerprint.pixelRatio || fingerprint.pixelRatio === 0) {
        suspicionScore += 30;
      }

      // No touch on mobile UA
      if (/mobi|android|iphone/i.test(userAgent) && !fingerprint.hasTouch) {
        suspicionScore += 35;
      }

      // Very low hardware concurrency (unusual for real devices)
      if (fingerprint.hardwareConcurrency && fingerprint.hardwareConcurrency < 2) {
        suspicionScore += 15;
      }

      // No timezone (bots sometimes don't set this)
      if (!fingerprint.timezone) {
        suspicionScore += 20;
      }

      // No languages array
      if (!fingerprint.languages || fingerprint.languages.length === 0) {
        suspicionScore += 25;
      }

      if (suspicionScore >= 50) {
        isBot = true;
        reason = `fingerprint_score:${suspicionScore}`;
        confidence = Math.min(suspicionScore + 30, 95);
      }
    }



    return new Response(
      JSON.stringify({
        isBot,
        reason: isBot ? reason : 'real_user',
        confidence,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ isBot: false, reason: 'error', error: String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
