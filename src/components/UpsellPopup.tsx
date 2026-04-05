import { useState } from 'react';
import { X, ShoppingBag, CheckCircle, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';
import camisaAzul from '@/assets/camisa-azul.png';

interface UpsellPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpsellPopup({ open, onOpenChange }: UpsellPopupProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    // Could navigate to a new checkout or add to existing order
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-sm mx-auto rounded-2xl p-0 overflow-hidden border-0 gap-0"
        style={{ fontFamily: "'Rubik', system-ui, sans-serif" }}
      >
        <DialogTitle className="sr-only">Oferta Especial</DialogTitle>

        {/* Accepted state */}
        {accepted ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-centauro-green/10 flex items-center justify-center mb-4">
              <CheckCircle className="text-centauro-green" size={40} />
            </div>
            <h3 className="text-lg font-black text-foreground">Adicionado ao pedido!</h3>
            <p className="text-sm text-muted-foreground mt-1">Você receberá as duas camisas juntas.</p>
          </div>
        ) : (
          <>
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
                    src={camisaAzul}
                    alt="Camisa Azul Seleção 2026"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                    Adicione ao seu pedido
                  </p>
                  <h3 className="text-sm font-black text-foreground leading-tight">
                    Camisa Azul Seleção Brasileira 2026
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

              {/* CTA */}
              <Button
                onClick={handleAccept}
                className="w-full h-13 text-sm font-black uppercase tracking-wider bg-centauro-green hover:bg-centauro-green/90 text-primary-foreground rounded-xl shadow-lg"
              >
                <ShoppingBag size={16} className="mr-2" />
                Quero por R$ 29,90
              </Button>

              {/* Decline */}
              <button
                onClick={() => onOpenChange(false)}
                className="w-full mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors text-center py-1"
              >
                Não, obrigado. Continuar sem a oferta.
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
