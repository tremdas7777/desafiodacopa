import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, ShoppingCart, Phone, Mail, Copy, CheckCircle, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AbandonedOrder {
  id: string;
  buyer_name: string | null;
  buyer_document: string | null;
  buyer_phone: string | null;
  buyer_email: string | null;
  amount_cents: number;
  status: string;
  created_at: string;
  buyer_address: string | null;
  buyer_address_number: string | null;
  buyer_neighborhood: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
  buyer_cep: string | null;
  buyer_ip_city: string | null;
  buyer_ip: string | null;
  shipping_method: string | null;
}

type TimeFilter = 'today' | '24h' | '3d' | '7d' | '30d' | 'all';

export default function AdminAbandonedCheckouts() {
  const [orders, setOrders] = useState<AbandonedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAbandoned = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('id, buyer_name, buyer_document, buyer_phone, buyer_email, amount_cents, status, created_at, buyer_address, buyer_address_number, buyer_neighborhood, buyer_city, buyer_state, buyer_cep, buyer_ip_city, buyer_ip, shipping_method')
      .in('status', ['pending', 'expired', 'waiting_payment'])
      .order('created_at', { ascending: false })
      .limit(200);

    if (timeFilter !== 'all') {
      const now = new Date();
      let cutoff: Date;
      switch (timeFilter) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '24h':
          cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '3d':
          cutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      query = query.gte('created_at', cutoff.toISOString());
    }

    const { data } = await query;
    setOrders((data as AbandonedOrder[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAbandoned();
  }, [timeFilter]);

  const stats = useMemo(() => {
    const withPhone = orders.filter(o => o.buyer_phone).length;
    const withEmail = orders.filter(o => o.buyer_email).length;
    const totalValue = orders.reduce((sum, o) => sum + o.amount_cents, 0);
    const pending = orders.filter(o => o.status === 'pending').length;
    const expired = orders.filter(o => o.status === 'expired').length;
    return { total: orders.length, withPhone, withEmail, totalValue, pending, expired };
  }, [orders]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllPhones = () => {
    const phones = orders.filter(o => o.buyer_phone).map(o => o.buyer_phone!);
    if (phones.length === 0) return toast.error('Nenhum telefone encontrado');
    navigator.clipboard.writeText(phones.join('\n'));
    toast.success(`${phones.length} telefones copiados!`);
  };

  const copyAllEmails = () => {
    const emails = orders.filter(o => o.buyer_email).map(o => o.buyer_email!);
    if (emails.length === 0) return toast.error('Nenhum email encontrado');
    navigator.clipboard.writeText(emails.join('\n'));
    toast.success(`${emails.length} emails copiados!`);
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const timeFilters: { id: TimeFilter; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: '24h', label: '24h' },
    { id: '3d', label: '3 dias' },
    { id: '7d', label: '7 dias' },
    { id: '30d', label: '30 dias' },
    { id: 'all', label: 'Todos' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <AlertTriangle size={20} className="text-centauro-gold" />
            Checkouts Abandonados
          </h2>
          <p className="text-muted-foreground text-xs">PIX gerado mas não pago — oportunidades de remarketing</p>
        </div>
        <Button onClick={fetchAbandoned} variant="outline" size="sm" className="text-xs" disabled={loading}>
          {loading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />}
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={14} className="text-centauro-gold" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Abandonados</span>
          </div>
          <p className="text-lg font-black text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Pendentes</span>
          </div>
          <p className="text-lg font-black text-foreground">{stats.pending}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Phone size={14} className="text-centauro-green" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Com Telefone</span>
          </div>
          <p className="text-lg font-black text-foreground">{stats.withPhone}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-destructive" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Valor Perdido</span>
          </div>
          <p className="text-lg font-black text-foreground">R$ {(stats.totalValue / 100).toFixed(2).replace('.', ',')}</p>
        </Card>
      </div>

      {/* Time filter + bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Período:</span>
          {timeFilters.map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                timeFilter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-muted border border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={copyAllPhones} variant="outline" size="sm" className="text-xs" disabled={stats.withPhone === 0}>
            <Phone size={12} className="mr-1" /> Copiar Telefones
          </Button>
          <Button onClick={copyAllEmails} variant="outline" size="sm" className="text-xs" disabled={stats.withEmail === 0}>
            <Mail size={12} className="mr-1" /> Copiar Emails
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-6 border border-border shadow-sm text-center">
          <ShoppingCart size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm font-bold">Nenhum checkout abandonado</p>
          <p className="text-muted-foreground text-xs">Boas notícias! Todos pagaram 🎉</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <Card key={order.id} className="p-3 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">
                      {order.buyer_name || 'Sem nome'}
                    </p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {getTimeSince(order.created_at)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {order.buyer_phone && (
                      <button
                        onClick={() => copyToClipboard(order.buyer_phone!, order.id + '-phone')}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === order.id + '-phone' ? <CheckCircle size={10} className="text-centauro-green" /> : <Phone size={10} />}
                        {order.buyer_phone}
                      </button>
                    )}
                    {order.buyer_email && (
                      <button
                        onClick={() => copyToClipboard(order.buyer_email!, order.id + '-email')}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === order.id + '-email' ? <CheckCircle size={10} className="text-centauro-green" /> : <Mail size={10} />}
                        {order.buyer_email}
                      </button>
                    )}
                    {order.buyer_document && (
                      <button
                        onClick={() => copyToClipboard(order.buyer_document!, order.id + '-cpf')}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === order.id + '-cpf' ? <CheckCircle size={10} className="text-centauro-green" /> : <Copy size={10} />}
                        CPF: {order.buyer_document}
                      </button>
                    )}
                  </div>
                  {order.buyer_ip_city && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      🌐 {order.buyer_ip_city}
                    </p>
                  )}
                  {(order.buyer_city || order.buyer_state) && (
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                      <MapPin size={10} />
                      {[order.buyer_neighborhood, order.buyer_city && order.buyer_state ? `${order.buyer_city}/${order.buyer_state}` : (order.buyer_city || order.buyer_state)].filter(Boolean).join(' • ')}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleString('pt-BR')} • R$ {(order.amount_cents / 100).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="ml-3">
                  <Badge variant="outline" className={`text-[9px] ${order.status === 'pending' ? 'text-centauro-gold border-centauro-gold/30' : 'text-destructive border-destructive/30'}`}>
                    {order.status === 'pending' ? 'Pendente' : order.status === 'expired' ? 'Expirado' : order.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
