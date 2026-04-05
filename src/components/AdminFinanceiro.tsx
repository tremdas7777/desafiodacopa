import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw, Loader2,
  ShoppingCart, Percent, ArrowUpRight, ArrowDownRight, Calendar, Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type FilterPeriod = 'hoje' | 'ontem' | '3dias' | '7dias' | '15dias' | '30dias' | 'custom';

interface Order {
  id: string;
  amount_cents: number;
  shipping_cost_cents: number | null;
  status: string;
  created_at: string;
  buyer_name: string | null;
  buyer_document: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  gateway: string;
  items_description: string | null;
}

export default function AdminFinanceiro() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<FilterPeriod>('hoje');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('id, amount_cents, shipping_cost_cents, status, created_at, buyer_name, buyer_document, buyer_email, buyer_phone, gateway, items_description')
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      const created = new Date(order.created_at);
      switch (period) {
        case 'hoje':
          return created.toDateString() === now.toDateString();
        case '3dias': {
          const d = new Date(now); d.setDate(d.getDate() - 3);
          return created >= d;
        }
        case '7dias': {
          const d = new Date(now); d.setDate(d.getDate() - 7);
          return created >= d;
        }
        case '15dias': {
          const d = new Date(now); d.setDate(d.getDate() - 15);
          return created >= d;
        }
        case '30dias': {
          const d = new Date(now); d.setDate(d.getDate() - 30);
          return created >= d;
        }
        case 'custom': {
          if (dateFrom && created < dateFrom) return false;
          if (dateTo) {
            const end = new Date(dateTo);
            end.setHours(23, 59, 59, 999);
            if (created > end) return false;
          }
          return true;
        }
        default:
          return true;
      }
    });
  }, [orders, period, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const approved = filteredOrders.filter(o => o.status === 'paid');
    const pending = filteredOrders.filter(o => o.status === 'pending');
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled' || o.status === 'expired');

    const faturamentoBrutoCents = approved.reduce((sum, o) => sum + o.amount_cents + (o.shipping_cost_cents || 0), 0);
    const freteTotalCents = approved.reduce((sum, o) => sum + (o.shipping_cost_cents || 0), 0);
    const faturamentoLiquidoCents = approved.reduce((sum, o) => sum + o.amount_cents, 0);
    const pendenteCents = pending.reduce((sum, o) => sum + o.amount_cents + (o.shipping_cost_cents || 0), 0);

    const taxaAprovacao = filteredOrders.length > 0 ? (approved.length / filteredOrders.length) * 100 : 0;
    const taxaCancelamento = filteredOrders.length > 0 ? (cancelled.length / filteredOrders.length) * 100 : 0;

    return {
      totalOrders: filteredOrders.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      faturamentoBruto: faturamentoBrutoCents / 100,
      faturamentoLiquido: faturamentoLiquidoCents / 100,
      freteTotal: freteTotalCents / 100,
      pendente: pendenteCents / 100,
      ticketMedio: approved.length > 0 ? (faturamentoBrutoCents / approved.length) / 100 : 0,
      taxaAprovacao,
      taxaCancelamento,
    };
  }, [filteredOrders]);

  // Chart: faturamento por dia
  const chartData = useMemo(() => {
    const dayMap: Record<string, { bruto: number; liquido: number; vendas: number }> = {};
    filteredOrders.filter(o => o.status === 'paid').forEach(order => {
      const day = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!dayMap[day]) dayMap[day] = { bruto: 0, liquido: 0, vendas: 0 };
      dayMap[day].bruto += (order.amount_cents + (order.shipping_cost_cents || 0)) / 100;
      dayMap[day].liquido += order.amount_cents / 100;
      dayMap[day].vendas += 1;
    });
    return Object.entries(dayMap)
      .map(([dia, v]) => ({ dia, bruto: +v.bruto.toFixed(2), liquido: +v.liquido.toFixed(2), vendas: v.vendas }))
      .reverse();
  }, [filteredOrders]);

  // Chart: vendas por hora (apenas hoje)
  const hourlyData = useMemo(() => {
    if (period !== 'hoje') return [];
    const hourMap: Record<string, number> = {};
    for (let h = 0; h < 24; h++) hourMap[`${h.toString().padStart(2, '0')}h`] = 0;
    filteredOrders.filter(o => o.status === 'paid').forEach(order => {
      const hour = new Date(order.created_at).getHours();
      const key = `${hour.toString().padStart(2, '0')}h`;
      hourMap[key] = (hourMap[key] || 0) + 1;
    });
    return Object.entries(hourMap).map(([hora, vendas]) => ({ hora, vendas }));
  }, [filteredOrders, period]);

  // Pie data
  const pieData = useMemo(() => [
    { name: 'Aprovadas', value: stats.approvedCount, color: 'hsl(142, 71%, 45%)' },
    { name: 'Pendentes', value: stats.pendingCount, color: 'hsl(45, 93%, 47%)' },
    { name: 'Canceladas', value: stats.cancelledCount, color: 'hsl(0, 84%, 60%)' },
  ].filter(d => d.value > 0), [stats]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const periods: { id: FilterPeriod; label: string }[] = [
    { id: 'hoje', label: 'Hoje' },
    { id: '3dias', label: '3 dias' },
    { id: '7dias', label: '7 dias' },
    { id: '15dias', label: '15 dias' },
    { id: '30dias', label: '30 dias' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-black text-foreground">Financeiro</h2>
          <p className="text-muted-foreground text-xs">Faturamento, vendas e métricas em tempo real</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm" className="text-xs" disabled={loading}>
          {loading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />}
          Atualizar
        </Button>
      </div>

      {/* Period filter */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Filter size={14} className="text-muted-foreground" />
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-bold transition-colors',
              period === p.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-muted border border-border'
            )}
          >
            {p.label}
          </button>
        ))}

        <span className="text-muted-foreground mx-1">|</span>

        <Popover open={showDatePicker === 'from'} onOpenChange={(o) => setShowDatePicker(o ? 'from' : null)}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("text-xs gap-1.5", period === 'custom' && "border-primary")}
              onClick={() => setPeriod('custom')}
            >
              <Calendar size={12} />
              {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'De'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateFrom}
              onSelect={(d) => { setDateFrom(d); setPeriod('custom'); setShowDatePicker('to'); }}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <span className="text-xs text-muted-foreground">até</span>

        <Popover open={showDatePicker === 'to'} onOpenChange={(o) => setShowDatePicker(o ? 'to' : null)}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("text-xs gap-1.5", period === 'custom' && "border-primary")}
              onClick={() => setPeriod('custom')}
            >
              <Calendar size={12} />
              {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Até'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateTo}
              onSelect={(d) => { setDateTo(d); setPeriod('custom'); setShowDatePicker(null); }}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Main KPIs - top row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <KpiCard
              icon={<DollarSign size={16} className="text-centauro-green" />}
              iconBg="bg-centauro-green/10"
              label="Faturamento Bruto"
              value={formatCurrency(stats.faturamentoBruto)}
              sub={`${stats.approvedCount} vendas aprovadas`}
            />
            <KpiCard
              icon={<TrendingUp size={16} className="text-primary" />}
              iconBg="bg-primary/10"
              label="Faturamento Líquido"
              value={formatCurrency(stats.faturamentoLiquido)}
              sub={`Sem frete: ${formatCurrency(stats.freteTotal)}`}
            />
            <KpiCard
              icon={<ShoppingCart size={16} className="text-centauro-gold" />}
              iconBg="bg-centauro-gold/10"
              label="Total de Pedidos"
              value={String(stats.totalOrders)}
              sub={`${stats.approvedCount} aprovados`}
            />
            <KpiCard
              icon={<ArrowUpRight size={16} className="text-centauro-green" />}
              iconBg="bg-centauro-green/10"
              label="Ticket Médio"
              value={formatCurrency(stats.ticketMedio)}
              sub="Por venda aprovada"
            />
            <KpiCard
              icon={<Percent size={16} className="text-primary" />}
              iconBg="bg-primary/10"
              label="Taxa de Aprovação"
              value={`${stats.taxaAprovacao.toFixed(1)}%`}
              sub={`${stats.approvedCount}/${stats.totalOrders} pedidos`}
              valueColor={stats.taxaAprovacao >= 50 ? 'text-centauro-green' : 'text-destructive'}
            />
            <KpiCard
              icon={<Clock size={16} className="text-centauro-gold" />}
              iconBg="bg-centauro-gold/10"
              label="Pendentes"
              value={String(stats.pendingCount)}
              sub={formatCurrency(stats.pendente) + ' em aberto'}
            />
          </div>

          {/* Status summary bar */}
          <Card className="p-3 border border-border shadow-sm mb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-muted-foreground">Resumo</span>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] border-centauro-green/30 text-centauro-green">
                  <CheckCircle size={10} className="mr-1" /> {stats.approvedCount} aprovadas
                </Badge>
                <Badge variant="outline" className="text-[10px] border-centauro-gold/30 text-centauro-gold">
                  <Clock size={10} className="mr-1" /> {stats.pendingCount} pendentes
                </Badge>
                <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                  <XCircle size={10} className="mr-1" /> {stats.cancelledCount} canceladas
                </Badge>
              </div>
            </div>
            {/* Mini progress bar */}
            {stats.totalOrders > 0 && (
              <div className="flex h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-centauro-green" style={{ width: `${stats.taxaAprovacao}%` }} />
                <div className="bg-centauro-gold" style={{ width: `${(stats.pendingCount / stats.totalOrders) * 100}%` }} />
                <div className="bg-destructive" style={{ width: `${stats.taxaCancelamento}%` }} />
              </div>
            )}
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card className="p-4 border border-border shadow-sm">
              <h3 className="text-xs font-black text-foreground mb-3 uppercase">Faturamento por Dia</h3>
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-xs text-center py-8">Sem dados no período</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `R$ ${value.toFixed(2)}`,
                        name === 'bruto' ? 'Bruto' : 'Líquido'
                      ]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="bruto" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="bruto" />
                    <Bar dataKey="liquido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="liquido" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-4 border border-border shadow-sm">
              <h3 className="text-xs font-black text-foreground mb-3 uppercase">Status das Vendas</h3>
              {pieData.length === 0 ? (
                <p className="text-muted-foreground text-xs text-center py-8">Sem dados no período</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Hourly chart (only for 'hoje') */}
          {period === 'hoje' && hourlyData.length > 0 && (
            <Card className="p-4 border border-border shadow-sm mb-4">
              <h3 className="text-xs font-black text-foreground mb-3 uppercase">Vendas por Hora (Hoje)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hora" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="vendas" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Vendas por dia (line chart for periods > hoje) */}
          {period !== 'hoje' && chartData.length > 1 && (
            <Card className="p-4 border border-border shadow-sm mb-4">
              <h3 className="text-xs font-black text-foreground mb-3 uppercase">Evolução de Vendas</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Recent approved sales */}
          <div>
            <h3 className="text-sm font-black text-foreground mb-3">Últimas Vendas Aprovadas</h3>
            {filteredOrders.filter(o => o.status === 'paid').length === 0 ? (
              <Card className="p-6 border border-border shadow-sm text-center">
                <p className="text-muted-foreground text-xs">Nenhuma venda aprovada neste período</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredOrders
                  .filter(o => o.status === 'paid')
                  .slice(0, 15)
                  .map(order => (
                    <Card key={order.id} className="p-3 border border-border shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {order.buyer_name || 'Sem nome'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(order.created_at).toLocaleString('pt-BR')} • {order.gateway}
                          </p>
                          {order.items_description && (
                            <p className="text-[10px] text-muted-foreground truncate">{order.items_description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm font-black text-centauro-green">
                            {formatCurrency((order.amount_cents + (order.shipping_cost_cents || 0)) / 100)}
                          </p>
                          <Badge className="text-[9px] bg-centauro-green/10 text-centauro-green border-centauro-green/30" variant="outline">
                            Aprovada
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon, iconBg, label, value, sub, valueColor }: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <Card className="p-4 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        <span className="text-[11px] font-bold text-muted-foreground uppercase">{label}</span>
      </div>
      <p className={cn('text-xl font-black', valueColor || 'text-foreground')}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
    </Card>
  );
}
