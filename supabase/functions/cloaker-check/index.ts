const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ==================== GOOGLE BOT PATTERNS ====================
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

// ==================== TIKTOK BOT PATTERNS ====================
// TikTok Ad Review & Crawler signatures
const TIKTOK_BOT_PATTERNS = [
  'bytespider', 'bytedance', 'tiktokbot', 'tiktok',
  'petalbot',          // ByteDance search crawler
  'ucbrowser',         // Often used by TikTok's internal review
  'musical_ly',        // Legacy TikTok UA
  'tt_ads_review',     // TikTok Ads review bot
  'ttcrawler',         // TikTok crawler
  'bytelocale',        // ByteDance locale crawler
  'bytecrawler',       // ByteDance generic crawler
  'aweme',             // TikTok internal app name (Douyin/TikTok)
  'sgsnssdk',          // TikTok SDK internal UA
  'lark',              // ByteDance Lark bot
  'feishu',            // ByteDance Feishu bot
];

// ByteDance / TikTok datacenter IP ranges
// Sources: ASN data for ByteDance (AS396986, AS138699, AS131072)
const TIKTOK_IP_PREFIXES = [
  // ByteDance US data centers
  '130.44.', '152.199.', '161.117.',
  // ByteDance Singapore / Asia
  '103.136.220.', '103.136.221.', '103.136.222.', '103.136.223.',
  '111.225.', '122.14.', '122.228.',
  // TikTok CDN / review infra
  '144.48.', '150.109.', '152.32.',
  '162.14.', '162.62.',
  '170.33.', '192.133.', '203.107.',
  // ByteDance cloud (Volcengine / VolcEngine)
  '100.64.', '180.184.', '180.149.', '49.232.',
  '101.32.', '101.33.', '101.34.', '101.35.',
  '106.55.', '118.89.', '119.28.', '119.29.',
  '129.28.', '129.204.', '139.155.', '140.143.',
  '148.70.', '150.158.', '152.136.', '154.8.',
  '175.24.', '175.27.', '182.254.', '188.131.',
  '193.112.', '203.195.', '210.14.', '211.159.',
  '212.64.', '212.129.',
];

// TikTok referrer patterns (ad review clicking through)
const TIKTOK_REFERER_PATTERNS = [
  'tiktok.com', 'tiktokv.com', 'tiktokcdn.com',
  'byteoversea.com', 'bytecdn.cn', 'bytedance.com',
  'musical.ly', 'ibyteimg.com', 'pstatp.com',
  'snssdk.com', 'ibytedtos.com', 'bytedapm.com',
  'bytegecko.com', 'byted-static.com',
];

// ==================== GENERAL BOT PATTERNS ====================
const SUSPICIOUS_UA_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'headlesschrome', 'phantomjs', 'selenium', 'puppeteer', 'playwright',
  'semrushbot', 'ahrefsbot', 'dotbot', 'rogerbot', 'screaming frog',
  'yandexbot', 'baiduspider', 'sogou', 'exabot',
  'facebookexternalhit', 'twitterbot', 'slurp', 'duckduckbot',
  'archive.org_bot', 'ia_archiver', 'mj12bot', 'blexbot',
  'dataforseo', 'serpstatbot', 'zoominfobot',
  'applebot', 'bingbot', 'adidxbot', 'httpclient',
  'libwww', 'httpunit', 'nutch', 'biglotron',
  'teoma', 'convera', 'gigablast', 'webmon',
  'httrack', 'grub.org', 'netresearchserver', 'speedy',
  'fluffy', 'findlink', 'panscient', 'ips-agent',
  'yanga', 'cyberpatrol', 'postrank', 'page2rss',
  // Additional modern bots
  'gptbot', 'chatgpt', 'claudebot', 'anthropic',
  'ccbot', 'perplexitybot', 'youbot',
];

const buildResponsePayload = ({
  isBot,
  reason,
  confidence,
}: {
  isBot: boolean;
  reason: string;
  confidence: number;
}) => ({
  isBot,
  reason: isBot ? reason : 'real_user',
  confidence,
  timestamp: new Date().toISOString(),
});

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
    let confidence = 0;

    // Parse client fingerprint data
    let fingerprint: Record<string, any> = {};
    try {
      if (req.method === 'POST') {
        fingerprint = await req.json();
      }
    } catch { /* ignore */ }

    const googleEnabled = fingerprint.googleEnabled !== false;
    const tiktokEnabled = fingerprint.tiktokEnabled !== false;

    // === LAYER 1: Google Bot UA ===
    if (googleEnabled) {
      for (const pattern of GOOGLE_BOT_PATTERNS) {
        if (userAgent.includes(pattern)) {
          isBot = true;
          reason = `google_bot_ua:${pattern}`;
          confidence = 95;
          break;
        }
      }
    }

    // === LAYER 2: TikTok Bot UA ===
    if (!isBot && tiktokEnabled) {
      for (const pattern of TIKTOK_BOT_PATTERNS) {
        if (userAgent.includes(pattern)) {
          isBot = true;
          reason = `tiktok_bot_ua:${pattern}`;
          confidence = 95;
          break;
        }
      }
    }

    // === LAYER 3: Other Bot UAs ===
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

    // === LAYER 4: IP Analysis ===
    if (!isBot && clientIp) {
      // Google IPs
      for (const prefix of GOOGLE_IP_PREFIXES) {
        if (clientIp.startsWith(prefix)) {
          isBot = true;
          reason = `google_ip:${prefix}`;
          confidence = 90;
          break;
        }
      }

      // TikTok / ByteDance IPs
      if (!isBot) {
        for (const prefix of TIKTOK_IP_PREFIXES) {
          if (clientIp.startsWith(prefix)) {
            isBot = true;
            reason = `tiktok_ip:${prefix}`;
            confidence = 92;
            break;
          }
        }
      }
    }

    // === LAYER 5: Referer Analysis ===
    if (!isBot && referer) {
      // Google Ads review
      if (referer.includes('google.com/ads') || referer.includes('googleads.g.doubleclick')) {
        isBot = true;
        reason = 'google_ads_referer';
        confidence = 95;
      }

      // TikTok referer patterns
      if (!isBot) {
        for (const pattern of TIKTOK_REFERER_PATTERNS) {
          if (referer.includes(pattern)) {
            isBot = true;
            reason = `tiktok_referer:${pattern}`;
            confidence = 90;
            break;
          }
        }
      }
    }

    // === LAYER 6: Header Analysis ===
    if (!isBot) {
      // Empty or very short UA
      if (userAgent.length < 10) {
        isBot = true;
        reason = 'empty_or_short_ua';
        confidence = 80;
      }

      // Missing Accept-Language header
      const acceptLang = req.headers.get('accept-language');
      if (!isBot && (!acceptLang || acceptLang.length === 0)) {
        confidence += 30;
        if (confidence >= 60) {
          isBot = true;
          reason = 'no_accept_language';
        }
      }

      // Via header (Google/TikTok proxies)
      const viaHeader = req.headers.get('via') || '';
      if (!isBot && (viaHeader.includes('google') || viaHeader.includes('bytedance') || viaHeader.includes('tiktok'))) {
        isBot = true;
        reason = `via_header:${viaHeader.substring(0, 50)}`;
        confidence = 85;
      }

      // TikTok-specific headers
      const xTTTrace = req.headers.get('x-tt-trace-id') || req.headers.get('x-tt-logid') || '';
      if (!isBot && xTTTrace) {
        isBot = true;
        reason = 'tiktok_trace_header';
        confidence = 95;
      }

      // ByteDance SDK headers
      const xBd = req.headers.get('x-bd-traceid') || req.headers.get('x-byted-sdk') || '';
      if (!isBot && xBd) {
        isBot = true;
        reason = 'bytedance_sdk_header';
        confidence = 95;
      }
    }

    // === LAYER 7: Fingerprint Cross-Validation ===
    if (!isBot && fingerprint && Object.keys(fingerprint).length > 0) {
      let suspicionScore = 0;

      // No plugins on desktop Chrome
      if (fingerprint.pluginCount === 0 && userAgent.includes('chrome') && !userAgent.includes('mobile')) {
        suspicionScore += 25;
      }

      // Low color depth
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

      // Very low hardware concurrency
      if (fingerprint.hardwareConcurrency && fingerprint.hardwareConcurrency < 2) {
        suspicionScore += 15;
      }

      // No timezone
      if (!fingerprint.timezone) {
        suspicionScore += 20;
      }

      // No languages
      if (!fingerprint.languages || fingerprint.languages.length === 0) {
        suspicionScore += 25;
      }

      // TikTok in-app browser detection: TikTok WebView has specific traits
      if (fingerprint.isTikTokWebView) {
        suspicionScore += 40;
      }

      if (suspicionScore >= 50) {
        isBot = true;
        reason = `fingerprint_score:${suspicionScore}`;
        confidence = Math.min(suspicionScore + 30, 95);
      }
    }

    return new Response(
      JSON.stringify(buildResponsePayload({ isBot, reason, confidence })),
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
