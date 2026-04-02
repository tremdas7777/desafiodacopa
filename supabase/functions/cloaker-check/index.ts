import { corsHeaders } from '@supabase/supabase-js/cors'

const GOOGLE_BOT_PATTERNS = [
  'adsbot-google',
  'googlebot',
  'mediapartners-google',
  'google-inspectiontool',
  'google-adwords',
  'google-read-aloud',
  'feedfetcher-google',
  'google-site-verification',
  'google-structured-data-testing-tool',
  'google-xrawler',
  'googleother',
  'storebot-google',
  'apis-google',
  'google-safety',
  'chrome-lighthouse',
  'google page speed',
  'pagespeed',
];

// Known Google IP ranges (ASN: AS15169, AS396982)
// These are broad CIDR prefixes - not exhaustive but covers major ranges
const GOOGLE_IP_PREFIXES = [
  '66.249.', '64.233.', '72.14.', '74.125.', '209.85.', '216.239.',
  '66.102.', '108.177.', '142.250.', '172.217.', '173.194.',
  '207.126.', '209.116.', '35.191.', '35.192.', '35.193.',
  '35.194.', '35.195.', '35.196.', '35.197.', '35.198.',
  '35.199.', '35.200.', '35.201.', '35.202.', '35.203.',
  '35.204.', '35.205.', '35.206.', '35.207.', '35.208.',
  '35.209.', '35.210.', '35.211.', '35.212.', '35.213.',
  '35.214.', '35.215.', '35.216.', '35.217.', '35.218.',
  '35.219.', '35.220.', '35.221.', '35.222.', '35.223.',
  '35.224.', '35.225.', '35.226.', '35.227.', '35.228.',
  '35.229.', '35.230.', '35.231.', '35.232.', '35.233.',
  '35.234.', '35.235.', '35.236.', '35.237.', '35.238.',
  '35.239.', '35.240.', '35.241.', '35.242.', '35.243.',
  '35.244.', '35.245.', '35.246.', '35.247.',
  '34.64.', '34.65.', '34.80.', '34.81.', '34.82.', '34.83.',
  '34.84.', '34.85.', '34.86.', '34.87.', '34.88.', '34.89.',
  '34.90.', '34.91.', '34.92.', '34.93.', '34.94.', '34.95.',
  '34.96.', '34.97.', '34.98.', '34.99.', '34.100.', '34.101.',
  '34.102.', '34.103.', '34.104.', '34.105.', '34.106.',
  '34.107.', '34.108.', '34.109.', '34.110.', '34.111.',
  '34.112.', '34.113.', '34.114.', '34.115.', '34.116.',
  '34.117.', '34.118.', '34.119.', '34.120.', '34.121.',
  '34.122.', '34.123.', '34.124.', '34.125.', '34.126.',
  '34.127.', '34.128.', '34.129.', '34.130.', '34.131.',
  '34.132.', '34.133.', '34.134.', '34.135.', '34.136.',
  '34.137.', '34.138.', '34.139.', '34.140.', '34.141.',
  '34.142.', '34.143.', '34.144.', '34.145.', '34.146.',
  '34.147.', '34.148.', '34.149.', '34.150.', '34.151.',
  '34.152.', '34.153.', '34.154.', '34.155.', '34.156.',
  '34.157.', '34.158.', '34.159.',
];

// Additional suspicious patterns (generic crawlers, security scanners)
const SUSPICIOUS_UA_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'headlesschrome', 'phantomjs', 'selenium', 'puppeteer', 'playwright',
  'semrushbot', 'ahrefsbot', 'dotbot', 'rogerbot', 'screaming frog',
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

    // Check User-Agent for Google bot patterns
    for (const pattern of GOOGLE_BOT_PATTERNS) {
      if (userAgent.includes(pattern)) {
        isBot = true;
        reason = `google_bot_ua:${pattern}`;
        break;
      }
    }

    // Check User-Agent for other suspicious patterns
    if (!isBot) {
      for (const pattern of SUSPICIOUS_UA_PATTERNS) {
        if (userAgent.includes(pattern)) {
          isBot = true;
          reason = `suspicious_ua:${pattern}`;
          break;
        }
      }
    }

    // Check IP against Google ranges
    if (!isBot && clientIp) {
      for (const prefix of GOOGLE_IP_PREFIXES) {
        if (clientIp.startsWith(prefix)) {
          isBot = true;
          reason = `google_ip:${prefix}`;
          break;
        }
      }
    }

    // Check for missing/empty User-Agent (common in automated tools)
    if (!isBot && userAgent.length < 10) {
      isBot = true;
      reason = 'empty_or_short_ua';
    }

    // Check referer for Google Ads review patterns
    if (!isBot && (referer.includes('google.com/ads') || referer.includes('googleads.g.doubleclick'))) {
      isBot = true;
      reason = `google_ads_referer`;
    }

    return new Response(
      JSON.stringify({
        isBot,
        reason: isBot ? reason : 'real_user',
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
