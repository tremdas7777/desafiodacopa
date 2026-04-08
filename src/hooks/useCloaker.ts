import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Advanced cloaker with multi-layer detection:
 * 1. Client-side browser fingerprinting (headless, webdriver, automation)
 * 2. Behavioral analysis (interaction patterns)
 * 3. Server-side UA/IP verification
 * 4. Canvas/WebGL fingerprinting anomalies
 */

type CloakerCheckResponse = {
  isBot?: boolean;
  reason?: string;
  confidence?: number;
  timestamp?: string;
};

// Client-side bot detection checks
const detectClientSideBot = (): { isBot: boolean; signals: string[] } => {
  const signals: string[] = [];

  if ((navigator as any).webdriver) signals.push('webdriver');
  if (/HeadlessChrome/i.test(navigator.userAgent)) signals.push('headless_chrome_ua');
  if (navigator.plugins && navigator.plugins.length === 0) signals.push('no_plugins');
  if (!navigator.languages || navigator.languages.length === 0) signals.push('no_languages');
  const isChrome = /Chrome/.test(navigator.userAgent);
  if (isChrome && !(window as any).chrome) signals.push('chrome_without_chrome_obj');
  if (isChrome && !(navigator as any).connection) signals.push('no_connection_api');
  if (window.screen.width === 0 || window.screen.height === 0) signals.push('zero_screen');
  if (window.outerWidth === 0 && window.outerHeight === 0) signals.push('zero_outer_dimensions');

  const automationProps = [
    '__nightmare', '__selenium_unwrapped', '__webdriver_evaluate',
    '__driver_evaluate', '__webdriver_script_function',
    '__webdriver_script_func', '__webdriver_script_fn',
    '_Selenium_IDE_Recorder', '_selenium', 'callSelenium',
    '__phantomas', 'Buffer', 'emit', 'spawn',
    'domAutomation', 'domAutomationController',
    '__lastWatirAlert', '__lastWatirConfirm', '__lastWatirPrompt',
    '_WEBDRIVER_ELEM_CACHE', 'ChromeDriverw',
    '__webdriverFuncgoog_$evalByXPath', 'cdc_adoQpoasnfa76pfcZLmcfl_Array',
    'cdc_adoQpoasnfa76pfcZLmcfl_Promise',
    'cdc_adoQpoasnfa76pfcZLmcfl_Symbol',
  ];
  for (const prop of automationProps) {
    if (prop in window || prop in document) {
      signals.push(`automation_prop:${prop}`);
      break;
    }
  }

  const docProps = ['__webdriver_script_fn', 'webdriver', 'driver-evaluate', 'selenium'];
  for (const prop of docProps) {
    if ((document as any)[prop] || document.documentElement.getAttribute(prop)) {
      signals.push(`doc_prop:${prop}`);
      break;
    }
  }

  // TikTok in-app browser / review bot detection
  const ua = navigator.userAgent;
  if (/TikTok|BytedanceWebview|ByteLocale|musical_ly|aweme/i.test(ua)) {
    signals.push('tiktok_webview_ua');
  }
  // TikTok review bots inject specific objects
  if ((window as any).__ttWebview || (window as any).TikTok || (window as any).bytedance) {
    signals.push('tiktok_global_object');
  }
  // Detect TikTok SDK bridge
  if ((window as any).ToutiaoJSBridge || (window as any).TTWebviewJSBridge) {
    signals.push('tiktok_js_bridge');
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Cwm fjordbank', 2, 15);
      const dataUrl = canvas.toDataURL();
      if (dataUrl.length < 100) signals.push('canvas_anomaly');
    }
  } catch {
    signals.push('canvas_blocked');
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (/SwiftShader|llvmpipe|Mesa/i.test(renderer)) signals.push('software_renderer');
      }
    } else {
      signals.push('no_webgl');
    }
  } catch {
    signals.push('webgl_error');
  }

  const isMobileUA = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isMobileUA && !hasTouch) signals.push('mobile_ua_no_touch');

  const platform = navigator.platform || '';
  if (/Win/.test(navigator.userAgent) && /Linux|Mac/.test(platform)) signals.push('platform_mismatch');

  const strongSignals = ['webdriver', 'headless_chrome_ua', 'automation_prop', 'doc_prop', 'software_renderer'];
  const strongCount = signals.filter(s => strongSignals.some(ss => s.startsWith(ss))).length;
  const weakCount = signals.length - strongCount;
  const isBot = strongCount > 0 || weakCount >= 3;

  return { isBot, signals };
};

const checkPermissionsAnomaly = async (): Promise<boolean> => {
  try {
    if (!navigator.permissions) return false;
    const start = performance.now();
    const result = await navigator.permissions.query({ name: 'notifications' });
    const elapsed = performance.now() - start;
    if (result.state === 'denied' && elapsed < 1) return true;
  } catch {}
  return false;
};

export const useCloaker = () => {
  const [isBot, setIsBot] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCloaker = async () => {
      try {
        const { data: config } = await supabase
          .from('cloaker_config')
          .select('enabled, google_enabled, tiktok_enabled')
          .limit(1)
          .single();

        const cloakerEnabled = config?.enabled ?? false;
        const googleEnabled = (config as any)?.google_enabled ?? true;
        const tiktokEnabled = (config as any)?.tiktok_enabled ?? true;

        if (!cloakerEnabled) {
          setIsBot(false);
          setLoading(false);
          return;
        }

        const clientCheck = detectClientSideBot();
        const permAnomaly = await checkPermissionsAnomaly();
        if (permAnomaly) clientCheck.signals.push('permissions_anomaly');

        if (clientCheck.isBot || permAnomaly) {
          console.log('[Cloaker] Client-side bot detected:', clientCheck.signals);
          setIsBot(true);
          setLoading(false);
          return;
        }

        const { data } = await supabase.functions.invoke('cloaker-check', {
          body: {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            languages: navigator.languages?.slice(0, 3),
            platform: navigator.platform,
            hardwareConcurrency: navigator.hardwareConcurrency,
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            pluginCount: navigator.plugins?.length ?? 0,
            isTikTokWebView: /TikTok|BytedanceWebview|ByteLocale|musical_ly|aweme/i.test(navigator.userAgent) ||
              !!(window as any).__ttWebview || !!(window as any).TikTok || !!(window as any).ToutiaoJSBridge,
            googleEnabled,
            tiktokEnabled,
          },
        });

        const serverResult = data as CloakerCheckResponse | null;

        if (serverResult?.isBot) {
          console.log('[Cloaker] Blocked:', serverResult.reason);
          setIsBot(true);
          setLoading(false);
          return;
        }

        setIsBot(false);
        setLoading(false);
      } catch (err) {
        console.warn('[Cloaker] Error, defaulting to real page:', err);
        setIsBot(false);
      } finally {
        setLoading(false);
      }
    };

    checkCloaker();
  }, []);

  return { isBot, loading };
};
