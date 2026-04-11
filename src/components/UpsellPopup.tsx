import { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Sparkles, Loader2, Flame, Users, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { fetchPaymentGatewayConfig } from '@/lib/paymentGateway';
import { trackEvent } from '@/lib/funnelTracking';
import PixPopup from '@/components/PixPopup';
import trofeuLego from '@/assets/trofeu-lego-copa.png';

interface UpsellPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UPSELL_AMOUNT = 34.90;
const COUNTDOWN_SECONDS = 300;

export default function UpsellPopup({ open, onOpenChange }: UpsellPopupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPixPopup, setShowPixPopup] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState('');
  const [pixOrderId, setPixOrderId] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [viewerCount] = useState(() => Math.floor(Math.random() * 8) + 12);

  useEffect(() => {
    if (!open) return;
    setCountdown(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { onOpenChange(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const handleAccept = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: lastOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!lastOrder) {
        setError('Não foi possível localizar seu pedido anterior.');
        setLoading(false);
        return;
      }

      setBuyerEmail(lastOrder.buyer_email || '');
      setBuyerPhone(lastOrder.buyer_phone || '');

      const gatewayConfig = await fetchPaymentGatewayConfig();
      let activeGateway = gatewayConfig.activeGateway;

      const hasKeys: Record<string, boolean> = {
        pagouai: !!gatewayConfig.pagouai.secretKey?.trim(),
        vennox: !!gatewayConfig.vennox.secretKey?.trim() && !!gatewayConfig.vennox.companyId?.trim(),
        centurionpay: !!gatewayConfig.centurionpay?.secretKey?.trim() && !!gatewayConfig.centurionpay?.companyId?.trim(),
        ironpay: !!gatewayConfig.ironpay?.apiToken?.trim(),
        simpayout: !!gatewayConfig.simpayout?.clientId?.trim() && !!gatewayConfig.simpayout?.clientSecret?.trim(),
        payevo: !!gatewayConfig.payevo?.secretKey?.trim() && !!gatewayConfig.payevo?.companyId?.trim(),
      };

      if (!hasKeys[activeGateway]) {
        const fallback = (['pagouai', 'vennox', 'centurionpay', 'ironpay', 'simpayout', 'payevo'] as const).find(gw => hasKeys[gw]);
        if (fallback) activeGateway = fallback;
      }

      const metadata = {
        address: lastOrder.buyer_address || '',
        addressNumber: lastOrder.buyer_address_number || '',
        complement: lastOrder.buyer_complement || '',
        neighborhood: lastOrder.buyer_neighborhood || '',
        city: lastOrder.buyer_city || '',
        state: lastOrder.buyer_state || '',
        cep: lastOrder.buyer_cep || '',
        shippingMethod: 'sedex',
        shippingCostCents: 0,
        itemsDescription: 'Troféu Copa do Mundo FIFA LEGO',
        isUpsell: true,
        originalOrderId: lastOrder.id,
      };

      let functionName = 'criar-pix';
      let body: Record<string, any> = {
        amount: UPSELL_AMOUNT,
        buyerName: lastOrder.buyer_name || '',
        buyerEmail: lastOrder.buyer_email || '',
        buyerDocument: lastOrder.buyer_document || '',
        buyerPhone: lastOrder.buyer_phone || '',
        metadata,
      };

      if (activeGateway === 'pagouai') {
        functionName = 'criar-pix';
        body.publicKey = gatewayConfig.pagouai.publicKey;
        body.secretKey = gatewayConfig.pagouai.secretKey;
      } else if (activeGateway === 'vennox') {
        functionName = 'criar-pix-vennox';
        body.secretKey = gatewayConfig.vennox.secretKey;
        body.companyId = gatewayConfig.vennox.companyId;
      } else if (activeGateway === 'centurionpay') {
        functionName = 'criar-pix-centurionpay';
        body.secretKey = gatewayConfig.centurionpay.secretKey;
        body.companyId = gatewayConfig.centurionpay.companyId;
      } else if (activeGateway === 'ironpay') {
        functionName = 'criar-pix-ironpay';
        body.apiToken = gatewayConfig.ironpay.apiToken;
      } else if (activeGateway === 'simpayout') {
        functionName = 'criar-pix-simpayout';
        body.clientId = gatewayConfig.simpayout.clientId;
        body.clientSecret = gatewayConfig.simpayout.clientSecret;
      } else if (activeGateway === 'payevo') {
        functionName = 'criar-pix-payevo';
        body.secretKey = gatewayConfig.payevo.secretKey;
        body.companyId = gatewayConfig.payevo.companyId;
        body.receiverId = gatewayConfig.payevo.receiverId;
        body.apiKey = gatewayConfig.payevo.apiKey;
      }

      const { data, error: fnError } = await supabase.functions.invoke(functionName, { body });
      if (fnError) throw fnError;

      setPixCode(data.pix_code || '');
      setPixQrCodeBase64(data.pix_qr_code_base64 || '');
      setPixOrderId(data.order_id || '');
      trackEvent('upsell');
      onOpenChange(false);
      setShowPixPopup(true);
    } catch (err: any) {
      console.error('Upsell PIX error:', err);
      setError('Erro ao gerar PIX. Tente novamente.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[calc(100%-2rem)] sm:max-w-sm mx-auto rounded-2xl p-0 overflow-hidden border-0 gap-0"
          style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}
        >
          <DialogTitle className="sr-only">Oferta Especial</DialogTitle>

          {/* Header */}
          <div className="bg-primary px-4 py-2.5 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-centauro-gold" />
            <span className="text-xs font-black text-primary-foreground uppercase tracking-widest">
              Oferta exclusiva pós-compra
            </span>
            <Sparkles size={14} className="text-centauro-gold" />
          </div>

          {/* Countdown + Social proof */}
          <div className="bg-destructive/90 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Timer size={13} className="text-primary-foreground animate-pulse" />
              <span className="text-xs font-black text-primary-foreground tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-primary-foreground" />
              <span className="text-[10px] font-bold text-primary-foreground">
                {viewerCount} pessoas vendo agora
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pt-4 pb-4">
            {/* Product image + info */}
            <div className="flex gap-4 items-center mb-4">
              <div className="w-28 h-28 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden p-2 ring-2 ring-centauro-gold/30">
                <img
                  src={trofeuLego}
                  alt="Troféu Copa do Mundo FIFA LEGO"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  width={512}
                  height={512}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame size={12} className="text-destructive" />
                  <p className="text-[10px] font-black text-destructive uppercase tracking-wider">
                    Últimas unidades
                  </p>
                </div>
                <h3 className="text-sm font-black text-foreground leading-tight">
                  Troféu Oficial Copa do Mundo FIFA LEGO®
                </h3>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-lg font-black text-centauro-green">R$ 34,90</span>
                  <span className="text-xs text-muted-foreground line-through">R$ 89,90</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block text-[10px] font-bold bg-centauro-green/10 text-centauro-green px-2 py-0.5 rounded-full">
                    67% OFF
                  </span>
                  <span className="inline-block text-[10px] font-bold bg-centauro-gold/10 text-centauro-gold px-2 py-0.5 rounded-full">
                    FRETE GRÁTIS
                  </span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-4 bg-secondary/60 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-centauro-green flex-shrink-0" />
                <span className="text-xs text-foreground font-medium">Enviado junto — sem frete adicional</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-centauro-green flex-shrink-0" />
                <span className="text-xs text-foreground font-medium">+1 número extra no sorteio VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-centauro-green flex-shrink-0" />
                <span className="text-xs text-foreground font-medium">Peça colecionável edição limitada</span>
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-2 mb-4 bg-centauro-gold/5 rounded-lg py-2 px-3">
              <div className="flex -space-x-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-centauro-green/20 border border-background flex items-center justify-center">
                    <span className="text-[8px]">✓</span>
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                <strong className="text-foreground">47 pessoas</strong> aproveitaram essa oferta hoje
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-destructive text-xs font-semibold text-center mb-3">{error}</p>
            )}

            {/* CTA */}
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="w-full h-14 text-sm font-black uppercase tracking-wider bg-centauro-green hover:bg-centauro-green/90 text-primary-foreground rounded-xl shadow-lg animate-pulse hover:animate-none"
            >
              {loading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <ShoppingBag size={16} className="mr-2" />
              )}
              {loading ? 'Gerando PIX...' : 'SIM! Quero por R$ 34,90'}
            </Button>

            {/* Decline */}
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full mt-3 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors text-center py-1"
            >
              Não, prefiro perder essa oferta exclusiva
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <PixPopup
        open={showPixPopup}
        onOpenChange={setShowPixPopup}
        pixCode={pixCode}
        pixQrCodeBase64={pixQrCodeBase64}
        orderId={pixOrderId}
        amount={UPSELL_AMOUNT}
        buyerEmail={buyerEmail}
        buyerPhone={buyerPhone}
        redirectPath="/obrigado-upsell"
      />
    </>
  );
}
