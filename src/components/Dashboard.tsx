import { useEffect, useState } from 'react';
import { fetchCollection } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Building2, 
  AlertCircle,
  Sparkles,
  BarChart3,
  Bell,
  Clock,
  Home,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Property, Unit, Tenant, Contract, Payment, Receipt, LandlordCharge, Expense, Movement } from '../types';
import { format, addDays, parseISO, differenceInDays, subMonths, isSameMonth } from 'date-fns';

export default function Dashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [charges, setCharges] = useState<LandlordCharge[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const reload = () => {
    fetchCollection<Property>('properties').then(setProperties).catch(console.error);
    fetchCollection<Unit>('units').then(setUnits).catch(console.error);
    fetchCollection<Tenant>('tenants').then(setTenants).catch(console.error);
    fetchCollection<Contract>('contracts').then(setContracts).catch(console.error);
    fetchCollection<Payment>('payments').then(setPayments).catch(console.error);
    fetchCollection<Receipt>('receipts').then(setReceipts).catch(console.error);
    fetchCollection<LandlordCharge>('landlordExpenses').then(setCharges).catch(console.error);
    fetchCollection<Expense>('expenses').then(setExpenses).catch(console.error);
    fetchCollection<Movement>('movements').then(setMovements).catch(console.error);
  };

  useEffect(() => {
    reload();
  }, []);

  // Stats Calculations
  const totalProperties = properties.length;
  const totalUnits = units.length;
  
  const occupiedUnits = units.filter(u => contracts.some(c => c.unitId === u.id && c.status === 'Active')).length;
  const vacantUnits = totalUnits - occupiedUnits;
  
  const occupancyPercentage = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  const currentMonthPayments = payments.filter(p => p.status === 'Paid' && isSameMonth(parseISO(p.dueDate), currentMonth));
  const currentMonthIncome = currentMonthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const currentMonthExpenses = expenses.filter(e => e.status === 'Paid' && isSameMonth(parseISO(e.date), currentMonth));
  const currentMonthExpensesTotal = currentMonthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const currentMonthCharges = charges.filter(c => c.status === 'Paid' && isSameMonth(parseISO(c.dueDate), currentMonth));
  const currentMonthChargesTotal = currentMonthCharges.reduce((acc, c) => acc + (c.amount || 0), 0);

  const totalMonthlyExpenses = currentMonthExpensesTotal + currentMonthChargesTotal;
  const netMonthlyRevenue = currentMonthIncome - totalMonthlyExpenses;

  const latePayments = payments.filter(p => p.status === 'Late');
  const latePaymentsTotal = latePayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const latePaymentsCount = new Set(latePayments.map(p => p.tenantId)).size;

  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const pendingPaymentsTotal = pendingPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingPaymentsCount = pendingPayments.length;

  const contractsExpiringSoon = contracts.filter(c => 
    c.status === 'Active' && 
    c.endDate && 
    differenceInDays(parseISO(c.endDate), currentMonth) <= 30 && 
    differenceInDays(parseISO(c.endDate), currentMonth) >= 0
  );

  const tenantsIdExpiringSoon = tenants.filter(t => 
    t.documentValidity && 
    differenceInDays(parseISO(t.documentValidity), currentMonth) <= 90 && 
    differenceInDays(parseISO(t.documentValidity), currentMonth) >= 0
  );

  const upcomingCharges = payments.filter(p => 
    p.type === 'Encargo' && 
    p.status === 'Pending' && 
    differenceInDays(parseISO(p.dueDate), currentMonth) <= 7 && 
    differenceInDays(parseISO(p.dueDate), currentMonth) >= 0
  );

  // Recent Activity
  const recentActivity = [
    ...expenses.map(e => {
      const prop = properties.find(p => p.id === e.propertyId);
      const unit = units.find(u => u.id === e.unitId);
      const activeContract = contracts.find(c => c.unitId === e.unitId && c.status === 'Active');
      const tenant = tenants.find(t => activeContract?.tenantIds.includes(t.id));
      
      return {
        type: 'Despesa',
        title: `Despesa - ${prop?.name || 'Imóvel'}`,
        amount: e.amount,
        person: tenant?.name || '---',
        date: e.date
      };
    }),
    ...payments.filter(p => p.status === 'Paid').map(p => {
      const prop = properties.find(pr => pr.id === p.propertyId);
      const tenant = tenants.find(t => t.id === p.tenantId);
      
      return {
        type: p.type === 'Renda' ? 'Renda' : 'Pagamento',
        title: `${p.type} - ${prop?.name || 'Imóvel'}`,
        amount: p.amount,
        person: tenant?.name || '---',
        date: p.dueDate
      };
    })
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Página Inicial</h2>
        <p className="text-neutral-500">Visão geral da gestão de arrendamentos</p>
      </div>

      {/* Top Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm rounded-xl bg-white">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-2">PORTFÓLIO GERAL</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-[#1E293B]">{totalProperties} · {totalUnits}</h3>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Total Imóveis · Total Unidades</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl bg-white">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-2">STATUS IMÓVEIS</p>
            <h3 className="text-2xl font-bold text-[#1E293B]">{vacantUnits} Vagos · {occupiedUnits} Ocupados</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl bg-white">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-2">OCUPAÇÃO</p>
            <h3 className="text-2xl font-bold text-[#1E293B]">{occupancyPercentage}% Total</h3>
            <p className="text-[11px] text-neutral-400 mt-1">{vacantUnits} Unid. Vagas · {occupiedUnits} Ocupadas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl bg-[#0F172A] text-white">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">FLUXO MENSAL</p>
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="text-xl font-bold">{currentMonthIncome.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</h3>
                <p className="text-[10px] text-slate-400">Rend. Bruto</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-rose-400">{totalMonthlyExpenses.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</h3>
                <p className="text-[10px] text-slate-400">Encargos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-lg rounded-3xl bg-[#0F172A] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <CardContent className="p-8 relative z-10">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-4">PERFORMANCE MENSAL</p>
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-5xl font-bold">{netMonthlyRevenue.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</h3>
              <Badge className="bg-slate-700 text-slate-300 border-none rounded-full px-3 py-1 text-xs">
                -- vs. mês anterior
              </Badge>
            </div>
            
            <div className="mb-12">
              <p className="text-lg font-semibold">Rendimento Líquido Mensal</p>
              <p className="text-sm text-slate-400">Total após encargos e impostos previstos</p>
            </div>

            <div className="flex justify-end gap-12">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">ENTRADAS</p>
                <p className="text-xl font-bold text-emerald-400">{currentMonthIncome.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">SAÍDAS</p>
                <p className="text-xl font-bold text-rose-400">{totalMonthlyExpenses.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-8 space-y-8">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">PENDÊNCIAS</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-[#1E293B]">Em Atraso</p>
                  <p className="text-xs text-rose-500">Pagamento crítico</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-rose-500">{latePaymentsTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="font-bold text-[#1E293B]">Pendentes</p>
                  <p className="text-xs text-neutral-400">Aguardando confirmação</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1E293B]">{pendingPaymentsTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</p>
            </div>

            <div className="pt-4 text-center">
              <Button variant="link" className="text-slate-600 font-semibold gap-2" onClick={() => onNavigate?.('financials')}>
                Ver Relatório Financeiro <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-rose-500 text-xl">*</span>
            <h4 className="font-bold text-[#1E293B]">Alertas Críticos</h4>
          </div>
          
          <div className="space-y-3">
            {latePaymentsTotal > 0 && (
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                    <AlertCircle size={18} />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    Rendas em Atraso — {latePaymentsCount} inquilino(s) p...
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-rose-500">{latePaymentsTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €</p>
                  <Button variant="ghost" size="sm" className="text-rose-500 font-bold text-[10px] uppercase tracking-wider" onClick={() => onNavigate?.('financials')}>
                    VER DETALHES
                  </Button>
                </div>
              </div>
            )}

            {pendingPaymentsTotal > 0 && (
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                    <AlertTriangle size={18} />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    Rendas Pendentes — {pendingPaymentsCount} contrato(s) em rascunho por ...
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-600 font-bold text-[10px] uppercase tracking-wider" onClick={() => onNavigate?.('financials')}>
                  PROCESSAR
                </Button>
              </div>
            )}

            {contractsExpiringSoon.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                    <Clock size={18} />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    Contrato a Terminar — {properties.find(p => p.id === c.propertyId)?.name} ({units.find(u => u.id === c.unitId)?.name})
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Termina em {differenceInDays(parseISO(c.endDate!), currentMonth)} dias</p>
                  <Button variant="ghost" size="sm" className="text-slate-600 font-bold text-[10px] uppercase tracking-wider" onClick={() => onNavigate?.('contracts')}>
                    VER CONTRATO
                  </Button>
                </div>
              </div>
            ))}

            {tenantsIdExpiringSoon.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                    <FileText size={18} />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    Documento a Caducar — {t.name} ({t.documentType || 'Documento'})
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Expira em {differenceInDays(parseISO(t.documentValidity!), currentMonth)} dias</p>
                  <Button variant="ghost" size="sm" className="text-slate-600 font-bold text-[10px] uppercase tracking-wider" onClick={() => onNavigate?.('tenants')}>
                    VER INQUILINO
                  </Button>
                </div>
              </div>
            ))}

            {upcomingCharges.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                    <CreditCard size={18} />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    Encargo Próximo — {p.category} ({properties.find(prop => prop.id === p.propertyId)?.name})
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Vence em {differenceInDays(parseISO(p.dueDate), currentMonth)} dias</p>
                  <Button variant="ghost" size="sm" className="text-slate-600 font-bold text-[10px] uppercase tracking-wider" onClick={() => onNavigate?.('financials')}>
                    VER
                  </Button>
                </div>
              </div>
            ))}

            {latePaymentsTotal === 0 && pendingPaymentsTotal === 0 && contractsExpiringSoon.length === 0 && tenantsIdExpiringSoon.length === 0 && upcomingCharges.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-neutral-200 text-neutral-400">
                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Sem alertas críticos no momento.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-neutral-400" />
            <h4 className="font-bold text-[#1E293B]">Atividade Recente</h4>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-neutral-50">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${activity.type === 'Despesa' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    <div>
                      <p className="text-sm font-bold text-[#1E293B]">{activity.title}</p>
                      <p className="text-[11px] text-neutral-400">
                        {activity.amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} € · {activity.person}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {format(parseISO(activity.date), 'dd/MM/yyyy')}
                  </p>
                </div>
              )) : (
                <div className="p-8 text-center text-neutral-400">
                  <p className="text-sm">Sem atividade recente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
