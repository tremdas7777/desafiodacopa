import { supabase } from '@/integrations/supabase/client';

export interface PagouAiConfig {
  publicKey: string;
  secretKey: string;
  enabled: boolean;
}

export interface VennoxConfig {
  secretKey: string;
  companyId: string;
  enabled: boolean;
}

export interface CenturionPayConfig {
  secretKey: string;
  companyId: string;
  enabled: boolean;
}

export interface IronPayConfig {
  apiToken: string;
  enabled: boolean;
}

export interface SimPayoutConfig {
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export interface PayEvoConfig {
  secretKey: string;
  companyId: string;
  receiverId: string;
  apiKey: string;
  enabled: boolean;
}

export interface MpPagamentosConfig {
  publicKey: string;
  secretKey: string;
  enabled: boolean;
}

export interface PaymentGatewayConfig {
  activeGateway: 'pagouai' | 'vennox' | 'centurionpay' | 'ironpay' | 'simpayout' | 'payevo' | 'mppagamentos';
  pagouai: PagouAiConfig;
  vennox: VennoxConfig;
  centurionpay: CenturionPayConfig;
  ironpay: IronPayConfig;
  simpayout: SimPayoutConfig;
  payevo: PayEvoConfig;
  mppagamentos: MpPagamentosConfig;
}

const defaultConfig: PaymentGatewayConfig = {
  activeGateway: 'centurionpay',
  pagouai: { publicKey: '', secretKey: '', enabled: false },
  vennox: { secretKey: '', companyId: '', enabled: false },
  centurionpay: { secretKey: '', companyId: '', enabled: false },
  ironpay: { apiToken: '', enabled: false },
  simpayout: { clientId: '', clientSecret: '', enabled: false },
  payevo: { secretKey: '', companyId: '', receiverId: '', apiKey: '', enabled: false },
  mppagamentos: { publicKey: '', secretKey: '', enabled: false },
};

// In-memory cache to avoid repeated DB calls within the same page
let cachedConfig: PaymentGatewayConfig | null = null;

export function getCachedGatewayConfig(): PaymentGatewayConfig {
  return cachedConfig || defaultConfig;
}

export async function fetchPaymentGatewayConfig(): Promise<PaymentGatewayConfig> {
  try {
    const { data, error } = await supabase
      .from('gateway_config')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      console.error('Error fetching gateway config:', error);
      return defaultConfig;
    }

    const config: PaymentGatewayConfig = {
      activeGateway: (['pagouai', 'vennox', 'centurionpay', 'ironpay', 'simpayout', 'payevo', 'mppagamentos'].includes(data.active_gateway)
        ? data.active_gateway
        : 'centurionpay') as PaymentGatewayConfig['activeGateway'],
      pagouai: {
        publicKey: data.pagouai_public_key || '',
        secretKey: data.pagouai_secret_key || '',
        enabled: !!(data.pagouai_secret_key),
      },
      vennox: {
        secretKey: data.vennox_secret_key || '',
        companyId: data.vennox_company_id || '',
        enabled: !!(data.vennox_secret_key && data.vennox_company_id),
      },
      centurionpay: {
        secretKey: data.centurionpay_secret_key || '',
        companyId: data.centurionpay_company_id || '',
        enabled: !!(data.centurionpay_secret_key && data.centurionpay_company_id),
      },
      ironpay: {
        apiToken: (data as any).ironpay_api_token || '',
        enabled: !!((data as any).ironpay_api_token),
      },
      simpayout: {
        clientId: (data as any).simpayout_client_id || '',
        clientSecret: (data as any).simpayout_client_secret || '',
        enabled: !!((data as any).simpayout_client_id && (data as any).simpayout_client_secret),
      },
      payevo: {
        secretKey: (data as any).payevo_secret_key || '',
        companyId: (data as any).payevo_company_id || '',
        receiverId: (data as any).payevo_receiver_id || '',
        apiKey: (data as any).payevo_api_key || '',
        enabled: !!((data as any).payevo_secret_key),
      },
      mppagamentos: {
        publicKey: (data as any).mppagamentos_public_key || '',
        secretKey: (data as any).mppagamentos_secret_key || '',
        enabled: !!((data as any).mppagamentos_public_key && (data as any).mppagamentos_secret_key),
      },
    };

    cachedConfig = config;
    return config;
  } catch (err) {
    console.error('Error fetching gateway config:', err);
    return defaultConfig;
  }
}

export async function savePaymentGatewayConfig(config: PaymentGatewayConfig): Promise<boolean> {
  try {
    // Get existing row id
    const { data: existing } = await supabase
      .from('gateway_config')
      .select('id')
      .limit(1)
      .single();

    const updateData = {
      active_gateway: config.activeGateway,
      pagouai_public_key: config.pagouai.publicKey,
      pagouai_secret_key: config.pagouai.secretKey,
      vennox_secret_key: config.vennox.secretKey,
      vennox_company_id: config.vennox.companyId,
      centurionpay_secret_key: config.centurionpay.secretKey,
      centurionpay_company_id: config.centurionpay.companyId,
      ironpay_api_token: config.ironpay.apiToken,
      simpayout_client_id: config.simpayout.clientId,
      simpayout_client_secret: config.simpayout.clientSecret,
      payevo_secret_key: config.payevo.secretKey,
      payevo_company_id: config.payevo.companyId,
      payevo_receiver_id: config.payevo.receiverId,
      payevo_api_key: config.payevo.apiKey,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await supabase
        .from('gateway_config')
        .update(updateData)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('gateway_config')
        .insert([updateData]);
      if (error) throw error;
    }

    cachedConfig = config;
    return true;
  } catch (err) {
    console.error('Error saving gateway config:', err);
    return false;
  }
}

// Legacy support - keep getPaymentGatewayConfig for sync access (uses cache)
export function getPaymentGatewayConfig(): PaymentGatewayConfig {
  return cachedConfig || defaultConfig;
}
