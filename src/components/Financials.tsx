import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Trash2, 
  Pencil,
  Search,
  Filter,
  Download,
  Building2,
  Home,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Payment, Property, Unit, Tenant } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Financials() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    propertyId: '',
    unitId: '',
    tenantId: '',
    type: 'Renda',
    category: '',
    amount: 0,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    day: new Date().getDate(),
    month: format(new Date(), 'MMMM'),
    status: 'Pending',
    description: '',
  });

  useEffect(() => {
    if (!user) return;
    const qPayments = query(collection(db, 'payments'), where('ownerId', '==', user.uid));
    const qProps = query(collection(db, 'properties'), where('ownerId', '==', user.uid));
    const qUnits = query(collection(db, 'units'), where('ownerId', '==', user.uid));
    const qTenants = query(collection(db, 'tenants'), where('ownerId', '==', user.uid));

    const unsubPayments = onSnapshot(qPayments, (s) => setPayments(s.docs.map(d => ({ id: d.id, ...d.data() } as Payment))), (e) => handleFirestoreError(e, OperationType.LIST, 'payments'));
    const unsubProps = onSnapshot(qProps, (s) => setProperties(s.docs.map(d => ({ id: d.id, ...d.data() } as Property))), (e) => handleFirestoreError(e, OperationType.LIST, 'properties'));
    const unsubUnits = onSnapshot(qUnits, (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit))), (e) => handleFirestoreError(e, OperationType.LIST, 'units'));
    const unsubTenants = onSnapshot(qTenants, (s) => setTenants(s.docs.map(d => ({ id: d.id, ...d.data() } as Tenant))), (e) => handleFirestoreError(e, OperationType.LIST, 'tenants'));

    return () => {
      unsubPayments(); unsubProps(); unsubUnits(); unsubTenants();
    };
  }, [user]);

  const handleSavePayment = async () => {
    if (!user) return;
    try {
      if (editingPayment) {
        await updateDoc(doc(db, 'payments', editingPayment.id), { ...newPayment });
        toast.success('Pagamento atualizado!');
      } else {
        await addDoc(collection(db, 'payments'), {
          ...newPayment,
          ownerId: user.uid,
          createdAt: new Date().toISOString()
        });
        toast.success('Pagamento registado!');
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'payments');
    }
  };

  const resetForm = () => {
    setNewPayment({
      propertyId: '',
      unitId: '',
      tenantId: '',
      type: 'Renda',
      category: '',
      amount: 0,
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      day: new Date().getDate(),
      month: format(new Date(), 'MMMM'),
      status: 'Pending',
      description: '',
    });
    setEditingPayment(null);
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'payments', id));
      toast.success('Pagamento removido.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'payments');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold">Pago</Badge>;
      case 'Pending': return <Badge className="bg-yellow-50 text-yellow-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold">Pendente</Badge>;
      case 'Late': return <Badge className="bg-rose-50 text-rose-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold">Atrasado</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Pagamentos</h2>
          <p className="text-neutral-500">Registo e controlo de rendas, despesas e encargos.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Novo Pagamento
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingPayment ? 'Editar Pagamento' : 'Registar Novo Pagamento'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Imóvel</Label>
                  <Select value={newPayment.propertyId || ''} onValueChange={v => setNewPayment({...newPayment, propertyId: v, unitId: ''})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Imóvel" /></SelectTrigger>
                    <SelectContent>
                      {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Select value={newPayment.unitId || ''} onValueChange={v => setNewPayment({...newPayment, unitId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Unidade" /></SelectTrigger>
                    <SelectContent>
                      {units.filter(u => u.propertyId === newPayment.propertyId).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Inquilino</Label>
                <Select value={newPayment.tenantId || ''} onValueChange={v => setNewPayment({...newPayment, tenantId: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecionar Inquilino" /></SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={newPayment.type || 'Renda'} onValueChange={(v: any) => setNewPayment({...newPayment, type: v, category: ''})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Renda">Renda</SelectItem>
                      <SelectItem value="Despesa">Despesa (Inquilino)</SelectItem>
                      <SelectItem value="Encargo">Encargo (Senhorio)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Valor (€)</Label>
                  <Input type="number" value={newPayment.amount ?? 0} onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})} />
                </div>
              </div>

              {newPayment.type === 'Despesa' && (
                <div className="grid gap-2">
                  <Label>Qual é a Despesa?</Label>
                  <Select value={newPayment.category || ''} onValueChange={v => setNewPayment({...newPayment, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Despesa" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Água">Água</SelectItem>
                      <SelectItem value="Eletricidade">Eletricidade</SelectItem>
                      <SelectItem value="Gás">Gás</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Limpeza">Limpeza</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newPayment.type === 'Encargo' && (
                <>
                  <div className="grid gap-2">
                    <Label>Qual é o Encargo?</Label>
                    <Select value={newPayment.category || ''} onValueChange={v => setNewPayment({...newPayment, category: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecionar Encargo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMI">IMI</SelectItem>
                        <SelectItem value="AIMI">AIMI</SelectItem>
                        <SelectItem value="Condomínio">Condomínio</SelectItem>
                        <SelectItem value="Seguro">Seguro</SelectItem>
                        <SelectItem value="Prestação ao Banco">Prestação ao Banco</SelectItem>
                        <SelectItem value="Licenças">Licenças</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Dia do Pagamento</Label>
                      <Input type="number" min="1" max="31" value={newPayment.day ?? ''} onChange={e => setNewPayment({...newPayment, day: parseInt(e.target.value) || 1})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Mês do Pagamento</Label>
                      <Select value={newPayment.month || ''} onValueChange={v => setNewPayment({...newPayment, month: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecionar Mês" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Janeiro">Janeiro</SelectItem>
                          <SelectItem value="Fevereiro">Fevereiro</SelectItem>
                          <SelectItem value="Março">Março</SelectItem>
                          <SelectItem value="Abril">Abril</SelectItem>
                          <SelectItem value="Maio">Maio</SelectItem>
                          <SelectItem value="Junho">Junho</SelectItem>
                          <SelectItem value="Julho">Julho</SelectItem>
                          <SelectItem value="Agosto">Agosto</SelectItem>
                          <SelectItem value="Setembro">Setembro</SelectItem>
                          <SelectItem value="Outubro">Outubro</SelectItem>
                          <SelectItem value="Novembro">Novembro</SelectItem>
                          <SelectItem value="Dezembro">Dezembro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data de Vencimento</Label>
                  <Input type="date" value={newPayment.dueDate || ''} onChange={e => setNewPayment({...newPayment, dueDate: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select value={newPayment.status || 'Pending'} onValueChange={(v: any) => setNewPayment({...newPayment, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pendente</SelectItem>
                      <SelectItem value="Paid">Pago</SelectItem>
                      <SelectItem value="Late">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descrição / Observações</Label>
                <Input value={newPayment.description || ''} onChange={e => setNewPayment({...newPayment, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSavePayment} className="w-full bg-[#1E293B] rounded-xl h-11">
                {editingPayment ? 'Atualizar Pagamento' : 'Guardar Pagamento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">TOTAL RECEBIDO (MÊS)</p>
            <h3 className="text-2xl font-bold text-emerald-600">
              {payments.filter(p => p.status === 'Paid' && p.type === 'Renda').reduce((acc, p) => acc + p.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">PENDENTE</p>
            <h3 className="text-2xl font-bold text-amber-600">
              {payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">EM ATRASO</p>
            <h3 className="text-2xl font-bold text-rose-600">
              {payments.filter(p => p.status === 'Late').reduce((acc, p) => acc + p.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
        <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar pagamentos..." 
                className="pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-neutral-200 outline-none w-64"
              />
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-neutral-500 rounded-xl">
              <Filter size={16} />
              Filtros
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-neutral-500 rounded-xl">
            <Download size={16} />
            Exportar
          </Button>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">DATA VENC.</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">IMÓVEL / UNIDADE</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">INQUILINO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">TIPO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">VALOR</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">ESTADO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-neutral-400">
                    Nenhum pagamento registado.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const prop = properties.find(p => p.id === payment.propertyId);
                  const unit = units.find(u => u.id === payment.unitId);
                  const tenant = tenants.find(t => t.id === payment.tenantId);

                  return (
                    <TableRow key={payment.id} className="border-neutral-50 hover:bg-neutral-50/30 transition-colors group">
                      <TableCell className="px-6 py-4 text-sm text-neutral-600 font-medium">
                        {payment.dueDate}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-500">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B]">{prop?.name}</p>
                            <p className="text-[11px] text-neutral-400">{unit?.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-neutral-600">
                        {tenant?.name || '---'}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase w-fit">{payment.type}</Badge>
                          {payment.category && (
                            <span className="text-[10px] text-neutral-400 mt-1 font-medium">{payment.category}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-bold text-[#1E293B]">
                        {payment.amount}€
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingPayment(payment);
                            setNewPayment(payment);
                            setIsAddDialogOpen(true);
                          }} className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(payment.id)} className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
