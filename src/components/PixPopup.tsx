import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { fireConversionEvent, getPixelConfig } from '@/lib/pixelManager';

interface PixPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pixCode: string;
  pixQrCodeBase64: string;
  orderId: string;
  amount: number;
  buyerEmail?: string;
  buyerPhone?: string;
  redirectPath?: string;
  redirectQuery?: string;
}

export default function PixPopup({ open, onOpenChange, pixCode, pixQrCodeBase64, orderId, amount, buyerEmail, buyerPhone, redirectPath = '/obrigado', redirectQuery = '' }: PixPopupProps) {
  const [copied, setCopied] = useState(false);
  const hasFiredPaidPixel = useRef(false);
  const navigate = useNavigate();

  // Poll order status and fire pixel when paid, then redirect
  useEffect(() => {
    if (!open || !orderId) return;
    hasFiredPaidPixel.current = false;

    const interval = setInterval(async () => {
      const { data } = await supabase.from('orders').select('status').eq('id', orderId).single();
      if (data?.status === 'paid' && !hasFiredPaidPixel.current) {
        hasFiredPaidPixel.current = true;
        // Fire client-side conversion with event_id matching server-side for Facebook dedup
        const dedupEventId = `purchase_${orderId}`;
        fireConversionEvent('Purchase', { value: amount, currency: 'BRL' }, { email: buyerEmail, phone: buyerPhone }, dedupEventId);
        clearInterval(interval);
        // Redirect to thank you page after a short delay
        setTimeout(() => {
          navigate(redirectPath + redirectQuery);
        }, 1500);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [open, orderId, amount]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);

      // Track that QR code was copied
      if (orderId) {
        await supabase.from('orders').update({ qr_code_copied: true }).eq('id', orderId);
      }

      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback copy
      const textarea = document.createElement('textarea');
      textarea.value = pixCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);

      if (orderId) {
        await supabase.from('orders').update({ qr_code_copied: true }).eq('id', orderId);
      }

      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md mx-auto rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <QrCode size={20} className="text-centauro-green" />
            Pagamento via PIX
          </DialogTitle>
          <DialogDescription className="text-xs">
            Escaneie o QR Code ou copie o código para pagar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount */}
          <div className="text-center bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Valor a pagar</p>
            <p className="text-2xl font-black text-foreground">
              R$ {amount.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* QR Code */}
          {pixCode ? (
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-lg">
                <img
                  src={pixQrCodeBase64 
                    ? (pixQrCodeBase64.startsWith('data:') ? pixQrCodeBase64 : `data:image/png;base64,${pixQrCodeBase64}`)
                    : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`
                  }
                  alt="QR Code PIX"
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* PIX Code - Copia e Cola */}
          {pixCode && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Código PIX (Copia e Cola)
              </label>
              <div className="bg-secondary rounded-lg p-3 break-all">
                <p className="text-[11px] font-mono text-foreground leading-relaxed max-h-20 overflow-y-auto">
                  {pixCode}
                </p>
              </div>
              <Button
                onClick={handleCopy}
                className="w-full font-bold text-sm py-5 transition-all bg-centauro-green hover:bg-centauro-green/90 text-primary-foreground"
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copiar Código PIX
                  </>
                )}
              </Button>
            </div>
          )}

          <p className="text-[10px] text-center text-muted-foreground">
            Após o pagamento, a confirmação será automática em até 5 minutos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
