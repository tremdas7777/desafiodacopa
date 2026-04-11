import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackEvent } from '@/lib/funnelTracking';
import { CheckCircle, Package, Truck, Gift, ShieldCheck, PartyPopper } from 'lucide-react';
import centauroLogo from '@/assets/centauro-logo.webp';
import cbfLogo from '@/assets/cbf-logo.webp';
import UpsellPopup from '@/components/UpsellPopup';

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) { trackEvent('thank_you'); hasTracked.current = true; }
    window.scrollTo(0, 0);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#212121');
    document.documentElement.style.backgroundColor = '#212121';
    document.body.style.backgroundColor = '#212121';

    const timer = setTimeout(() => setShowConfetti(false), 4000);
    // Show upsell popup faster - 1.5 seconds (catch excitement)
    const upsellTimer = setTimeout(() => setShowUpsell(true), 1500);
    return () => {
      clearTimeout(timer);
      clearTimeout(upsellTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Rubik', 'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-primary py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center -translate-x-2">
          <img src={centauroLogo} alt="Centauro" className="h-14 md:h-20 object-contain brightness-0 invert" />
          <div className="w-px h-8 bg-primary-foreground/30 ml-2 mr-4" />
          <img src={cbfLogo} alt="CBF" className="h-14 md:h-20 object-contain" />
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-centauro-green py-3 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2 text-primary-foreground">
          <PartyPopper size={20} />
          <span className="text-sm font-bold tracking-wide uppercase">Pagamento Confirmado!</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Success Icon */}
        <div className="flex flex-col items-center mb-8 relative">
          {showConfetti && (
            <div className="absolute -top-4 left-0 right-0 flex justify-center pointer-events-none">
              {[...Array(18)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full absolute animate-bounce"
                  style={{
                    backgroundColor: ['#E60000', '#FFD700', '#00A651', '#FFFFFF', '#0066CC', '#FF6B00'][i % 6],
                    left: `${8 + (i * 5)}%`,
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: `${0.6 + (i * 0.08)}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="w-20 h-20 rounded-full bg-centauro-green/10 flex items-center justify-center mb-4 ring-4 ring-centauro-green/20 animate-bounce" style={{ animationDuration: '2s', animationIterationCount: '3' }}>
            <CheckCircle className="text-centauro-green" size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-foreground text-center uppercase tracking-tight">
            Parabéns! Compra realizada! 🎉
          </h1>
          <p className="text-muted-foreground text-center mt-2 text-sm leading-relaxed max-w-xs">
            Seu pedido foi confirmado com sucesso. Aguarde uma surpresa especial!
          </p>
        </div>

        {/* Order Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-centauro-green/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-centauro-green" size={22} />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Pagamento aprovado ✅</p>
              <p className="text-muted-foreground text-xs mt-0.5">O valor foi confirmado e seu pedido está sendo processado.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="text-primary" size={22} />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Preparando seu pedido</p>
              <p className="text-muted-foreground text-xs mt-0.5">Os itens estão sendo separados para envio.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-centauro-gold/10 flex items-center justify-center flex-shrink-0">
              <Truck className="text-centauro-gold" size={22} />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Envio via Correios SEDEX</p>
              <p className="text-muted-foreground text-xs mt-0.5">O código de rastreio será enviado ao seu e-mail assim que disponível.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-centauro-green/10 flex items-center justify-center flex-shrink-0">
              <Gift className="text-centauro-green" size={22} />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Sorteio VIP incluso! 🏆</p>
              <p className="text-muted-foreground text-xs mt-0.5">Sua participação no sorteio de ingressos VIP Copa 2026 já está confirmada.</p>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
            <ShieldCheck size={14} />
            <span className="text-[11px] font-medium uppercase tracking-wider">Compra 100% segura</span>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/70 leading-relaxed">
            Este é um site oficial da Centauro em parceria com a CBF. 
            Todos os seus dados estão protegidos com criptografia de ponta a ponta.
          </p>
        </div>
      </div>

      {/* Upsell Popup */}
      <UpsellPopup open={showUpsell} onOpenChange={setShowUpsell} />
    </div>
  );
}
