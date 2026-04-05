import { useState } from 'react';
import { ShoppingBag, CheckCircle, Sparkles, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { fetchPaymentGatewayConfig } from '@/lib/paymentGateway';
import { trackEvent } from '@/lib/funnelTracking';
import PixPopup from '@/components/PixPopup';
import camisaAzul from '@/assets/camisa-azul.webp';
import camisaAmarela from '@/assets/camisa-brasil-hero.webp';

interface UpsellPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shirtColor: 'amarela' | 'azul' | string;
}

const UPSELL_AMOUNT = 29.90;
const SIZES = ['P', 'M', 'G', 'GG'] as const;

export default function UpsellPopup({ open, onOpenChange, shirtColor }: UpsellPopupProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeError, setSizeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPixPopup, setShowPixPopup] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState('');
  const [pixOrderId, setPixOrderId] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  const isAzul = shirtColor === 'azul';
  const shirtImage = isAzul ? camisaAzul : camisaAmarela;
  const colorLabel = isAzul ? 'Azul' : 'Amarela';

  const handleAccept = async () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
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
        itemsDescription: 'Panela Antiaderente 12L',
        isUpsell: true,
        originalOrderId: lastOrder.id,
        shirtColor: colorLabel,
        shirtSize: selectedSize,
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

          {/* Header badge */}
          <div className="bg-primary px-4 py-2.5 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-centauro-gold" />
            <span className="text-xs font-black text-primary-foreground uppercase tracking-widest">
              Oferta exclusiva pós-compra
            </span>
            <Sparkles size={14} className="text-centauro-gold" />
          </div>

          {/* Content */}
          <div className="px-5 pt-5 pb-4">
            {/* Product image + info */}
            <div className="flex gap-4 items-center mb-4">
              <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                <img
                  src={shirtImage}
                  alt={`Camisa ${colorLabel} Seleção 2026`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  Adicione ao seu pedido
                </p>
                <h3 className="text-sm font-black text-foreground leading-tight">
                  Camisa {colorLabel} Seleção Brasileira 2026
                </h3>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-lg font-black text-centauro-green">R$ 29,90</span>
                  <span className="text-xs text-muted-foreground line-through">R$ 89,90</span>
                </div>
                <span className="inline-block mt-1 text-[10px] font-bold bg-centauro-green/10 text-centauro-green px-2 py-0.5 rounded-full">
                  67% OFF
                </span>
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                Escolha o tamanho
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${
                      selectedSize === size
                        ? 'border-centauro-green bg-centauro-green/10 text-centauro-green'
                        : sizeError
                          ? 'border-destructive bg-destructive/5 text-foreground'
                          : 'border-border bg-secondary text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-destructive text-[11px] font-semibold mt-1.5">Selecione um tamanho</p>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-5 bg-secondary/60 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-centauro-green flex-shrink-0" />
                <span className="text-xs text-foreground">Enviada junto com seu pedido</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-centauro-green flex-shrink-0" />
                <span className="text-xs text-foreground">Sem frete adicional</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-centauro-green flex-shrink-0" />
                <span className="text-xs text-foreground">+1 número extra no sorteio VIP</span>
              </div>
            </div>

            {/* Timer urgency */}
            <div className="flex items-center justify-center gap-1.5 mb-4 text-muted-foreground">
              <Clock size={12} />
              <span className="text-[10px] font-medium">Oferta válida apenas agora</span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-destructive text-xs font-semibold text-center mb-3">{error}</p>
            )}

            {/* CTA */}
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="w-full h-13 text-sm font-black uppercase tracking-wider bg-centauro-green hover:bg-centauro-green/90 text-primary-foreground rounded-xl shadow-lg"
            >
              {loading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <ShoppingBag size={16} className="mr-2" />
              )}
              {loading ? 'Gerando PIX...' : 'Quero por R$ 29,90'}
            </Button>

            {/* Decline */}
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors text-center py-1"
            >
              Não, obrigado. Continuar sem a oferta.
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIX Popup for upsell payment */}
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
