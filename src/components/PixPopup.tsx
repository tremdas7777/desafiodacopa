import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, QrCode, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { fireConversionEvent } from '@/lib/pixelManager';

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
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (!open) {
      setTimeLeft(5 * 60);
      return;
    }
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open, timeLeft]);

  // Poll order status and fire pixel when paid, then redirect
  useEffect(() => {
    if (!open || !orderId) return;
    hasFiredPaidPixel.current = false;

    const interval = setInterval(async () => {
      const { data } = await supabase.from('orders').select('status').eq('id', orderId).single();
      if (data?.status === 'paid' && !hasFiredPaidPixel.current) {
        hasFiredPaidPixel.current = true;
        const dedupEventId = `purchase_${orderId}`;
        fireConversionEvent('Purchase', { value: amount, currency: 'BRL' }, { email: buyerEmail, phone: buyerPhone }, dedupEventId);
        clearInterval(interval);
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
      if (orderId) {
        await supabase.from('orders').update({ qr_code_copied: true }).eq('id', orderId);
      }
      setTimeout(() => setCopied(false), 3000);
    } catch {
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

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const isUrgent = timeLeft <= 60;
  const isExpired = timeLeft === 0;
  const progressPercent = (timeLeft / (5 * 60)) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md mx-auto rounded-2xl p-5 gap-0">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <QrCode size={20} className="text-centauro-green" />
            Pagamento via PIX
          </DialogTitle>
          <DialogDescription className="text-xs">
            Escaneie o QR Code ou copie o código para pagar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Timer bar — compact and elegant */}
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-secondary/50">
            {/* Progress bar background */}
            <div
              className="absolute inset-0 transition-all duration-1000 ease-linear"
              style={{
                width: `${progressPercent}%`,
                background: isExpired
                  ? 'hsl(var(--destructive) / 0.15)'
                  : isUrgent
                    ? 'linear-gradient(90deg, hsl(0 84% 60% / 0.2), hsl(0 84% 60% / 0.1))'
                    : 'linear-gradient(90deg, hsl(var(--centauro-green) / 0.2), hsl(var(--centauro-green) / 0.08))',
              }}
            />
            <div className="relative flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                {isExpired ? (
                  <AlertTriangle size={14} className="text-destructive" />
                ) : (
                  <Clock size={14} className={isUrgent ? 'text-destructive animate-pulse' : 'text-centauro-green'} />
                )}
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {isExpired ? 'PIX expirado' : 'Expira em'}
                </span>
              </div>
              {!isExpired && (
                <div className="flex items-center gap-0.5">
                  <span className={`text-lg font-black tabular-nums tracking-tight ${isUrgent ? 'text-destructive' : 'text-foreground'}`}>
                    {minutes}
                  </span>
                  <span className={`text-lg font-black ${isUrgent ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>:</span>
                  <span className={`text-lg font-black tabular-nums tracking-tight ${isUrgent ? 'text-destructive' : 'text-foreground'}`}>
                    {seconds}
                  </span>
                </div>
              )}
              {isExpired && (
                <span className="text-xs font-bold text-destructive">Gere um novo código</span>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="text-center bg-secondary rounded-xl p-2.5">
            <p className="text-[10px] text-muted-foreground mb-0.5">Valor a pagar</p>
            <p className="text-xl font-black text-foreground">
              R$ {amount.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* QR Code */}
          {pixCode ? (
            <div className="flex justify-center">
              <div className="bg-white p-2.5 rounded-xl shadow-sm">
                <img
                  src={pixQrCodeBase64 
                    ? (pixQrCodeBase64.startsWith('data:') ? pixQrCodeBase64 : `data:image/png;base64,${pixQrCodeBase64}`)
                    : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`
                  }
                  alt="QR Code PIX"
                  className="w-44 h-44 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Step-by-step instructions */}
          {pixCode && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className={`flex flex-col items-center gap-1 rounded-lg p-2 border transition-colors ${copied ? 'border-centauro-green/40 bg-centauro-green/5' : 'border-border/50 bg-secondary/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${copied ? 'bg-centauro-green text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>1</div>
                  <Copy size={14} className={copied ? 'text-centauro-green' : 'text-muted-foreground'} />
                  <span className="text-[9px] font-semibold text-muted-foreground text-center leading-tight">Copie o código</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg p-2 border border-border/50 bg-secondary/50">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-muted-foreground/20 text-muted-foreground">2</div>
                  <Smartphone size={14} className="text-muted-foreground" />
                  <span className="text-[9px] font-semibold text-muted-foreground text-center leading-tight">Abra seu banco</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg p-2 border border-border/50 bg-secondary/50">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-muted-foreground/20 text-muted-foreground">3</div>
                  <ClipboardCheck size={14} className="text-muted-foreground" />
                  <span className="text-[9px] font-semibold text-muted-foreground text-center leading-tight">Cole no PIX</span>
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-2.5 break-all">
                <p className="text-[11px] font-mono text-foreground leading-relaxed max-h-16 overflow-y-auto">
                  {pixCode}
                </p>
              </div>
              <Button
                onClick={handleCopy}
                className="w-full font-bold text-sm py-5 rounded-xl transition-all bg-centauro-green hover:bg-centauro-green/90 text-primary-foreground"
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
            Após o pagamento, a confirmação será automática.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
