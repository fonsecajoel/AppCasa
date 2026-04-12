import { useEffect, useState } from 'react';
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
  Droplets,
  Zap,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Expense, Property, Unit, Tenant } from '../types';
import { fetchCollection, createDoc, updateDoc as apiUpdateDoc, deleteDoc as apiDeleteDoc } from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadExpenses = () => {
    fetchCollection<Expense>('expenses').then(setExpenses).catch(console.error);
  };

  const loadProperties = () => {
    fetchCollection<Property>('properties').then(setProperties).catch(console.error);
  };

  const loadUnits = () => {
    fetchCollection<Unit>('units').then(setUnits).catch(console.error);
  };

  const loadTenants = () => {
    fetchCollection<Tenant>('tenants').then(setTenants).catch(console.error);
  };

  const loadData = () => {
    loadExpenses();
    loadProperties();
    loadUnits();
    loadTenants();
  };
  
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    propertyId: '',
    type: 'Água',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Pending',
    description: '',
    method: 'Fatura',
    previousReading: 0,
    currentReading: 0,
    pricePerUnit: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveExpense = async () => {
    try {
      if (editingExpense) {
        await apiUpdateDoc('expenses', editingExpense.id, { ...newExpense });
        toast.success('Despesa atualizada!');
      } else {
        await createDoc('expenses', {
          ...newExpense,
          ownerId: user?.uid || '',
          createdAt: new Date().toISOString()
        });
        toast.success('Despesa registada!');
      }
      loadExpenses();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao guardar despesa.');
    }
  };

  const resetForm = () => {
    setNewExpense({
      propertyId: '',
      type: 'Água',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
      description: '',
      method: 'Fatura',
      previousReading: 0,
      currentReading: 0,
      pricePerUnit: 0,
    });
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await apiDeleteDoc('expenses', id);
      toast.success('Despesa removida.');
      loadExpenses();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover despesa.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Pago</Badge>;
      case 'Pending': return <Badge className="bg-yellow-50 text-yellow-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Pendente</Badge>;
      default: return null;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Água': return <Droplets size={18} />;
      case 'Eletricidade': return <Zap size={18} />;
      case 'Manutenção': return <Wrench size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Despesas</h2>
          <p className="text-neutral-500">Gestão de consumos e manutenções das unidades.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Nova Despesa
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Registar Nova Despesa'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Imóvel</Label>
                  <Select value={newExpense.propertyId || ''} onValueChange={v => setNewExpense({...newExpense, propertyId: v, unitId: ''})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Imóvel" /></SelectTrigger>
                    <SelectContent>
                      {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Select value={newExpense.unitId || ''} onValueChange={v => setNewExpense({...newExpense, unitId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Unidade" /></SelectTrigger>
                    <SelectContent>
                      {units.filter(u => u.propertyId === newExpense.propertyId).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={newExpense.type || 'Água'} onValueChange={(v: any) => setNewExpense({...newExpense, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Água">Água</SelectItem>
                      <SelectItem value="Eletricidade">Eletricidade</SelectItem>
                      <SelectItem value="Gás">Gás</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Limpeza">Limpeza</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Valor (€)</Label>
                  <Input type="number" value={newExpense.amount ?? 0} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input type="date" value={newExpense.date || ''} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select value={newExpense.status || 'Pending'} onValueChange={(v: any) => setNewExpense({...newExpense, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pendente</SelectItem>
                      <SelectItem value="Paid">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input value={newExpense.description || ''} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              </div>

              {(newExpense.type === 'Água' || newExpense.type === 'Eletricidade') && (
                <div className="grid gap-4 border-l-2 border-blue-100 pl-4 py-2 bg-blue-50/30 rounded-r-xl">
                  <div className="grid gap-2">
                    <Label className="text-blue-700 font-bold text-[10px] uppercase tracking-wider">Método de Cobrança</Label>
                    <Select value={newExpense.method || 'Fatura'} onValueChange={(v: any) => setNewExpense({...newExpense, method: v})}>
                      <SelectTrigger className="bg-white border-blue-100"><SelectValue placeholder="Selecionar Método" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fatura">Fatura</SelectItem>
                        <SelectItem value="Contagem Manual">Contagem Manual</SelectItem>
                        <SelectItem value="Valor Fixo">Valor Fixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newExpense.method === 'Contagem Manual' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-blue-600 text-[10px] uppercase tracking-wider">Anterior</Label>
                        <Input 
                          type="number" 
                          className="bg-white border-blue-100"
                          value={newExpense.previousReading ?? 0} 
                          onChange={e => {
                            const prev = parseFloat(e.target.value) || 0;
                            const curr = newExpense.currentReading || 0;
                            const price = newExpense.pricePerUnit || 0;
                            setNewExpense({
                              ...newExpense, 
                              previousReading: prev,
                              amount: Number((Math.max(0, (curr - prev) * price)).toFixed(2))
                            });
                          }} 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-blue-600 text-[10px] uppercase tracking-wider">Atual</Label>
                        <Input 
                          type="number" 
                          className="bg-white border-blue-100"
                          value={newExpense.currentReading ?? 0} 
                          onChange={e => {
                            const curr = parseFloat(e.target.value) || 0;
                            const prev = newExpense.previousReading || 0;
                            const price = newExpense.pricePerUnit || 0;
                            setNewExpense({
                              ...newExpense, 
                              currentReading: curr,
                              amount: Number((Math.max(0, (curr - prev) * price)).toFixed(2))
                            });
                          }} 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-blue-600 text-[10px] uppercase tracking-wider">Preço/Unid</Label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          className="bg-white border-blue-100"
                          value={newExpense.pricePerUnit ?? 0} 
                          onChange={e => {
                            const price = parseFloat(e.target.value) || 0;
                            const curr = newExpense.currentReading || 0;
                            const prev = newExpense.previousReading || 0;
                            setNewExpense({
                              ...newExpense, 
                              pricePerUnit: price,
                              amount: Number((Math.max(0, (curr - prev) * price)).toFixed(2))
                            });
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSaveExpense} className="w-full bg-[#1E293B] rounded-xl h-11">
                {editingExpense ? 'Atualizar Despesa' : 'Guardar Despesa'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">TOTAL DESPESAS (MÊS)</p>
            <h3 className="text-2xl font-bold text-rose-600">
              {expenses.filter(e => e.status === 'Paid').reduce((acc, e) => acc + e.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">PENDENTE</p>
            <h3 className="text-2xl font-bold text-amber-600">
              {expenses.filter(e => e.status === 'Pending').reduce((acc, e) => acc + e.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">MANUTENÇÕES</p>
              <h3 className="text-lg font-bold text-[#1E293B]">
                {expenses.filter(e => e.type === 'Manutenção').length}
              </h3>
            </div>
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
                placeholder="Pesquisar despesas..." 
                className="pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-neutral-200 outline-none w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-neutral-500 rounded-xl">
              <Filter size={16} />
              Filtros
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-neutral-500 rounded-xl">
              <Download size={16} />
              Exportar
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">DATA</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">IMÓVEL / UNIDADE</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">TIPO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">VALOR</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">ESTADO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-neutral-400">
                    Nenhuma despesa registada.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => {
                  const prop = properties.find(p => p.id === expense.propertyId);
                  const unit = units.find(u => u.id === expense.unitId);

                  return (
                    <TableRow key={expense.id} className="border-neutral-50 hover:bg-neutral-50/30 transition-colors group">
                      <TableCell className="px-6 py-4 text-sm text-neutral-600 font-medium">
                        {expense.date}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-500">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B]">{prop?.name || '---'}</p>
                            <p className="text-[11px] text-neutral-400">{unit?.name || '---'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-neutral-400">{getIcon(expense.type)}</div>
                          <div className="flex flex-col">
                            <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase w-fit">{expense.type}</Badge>
                            {expense.method && (
                              <span className="text-[10px] text-neutral-400 mt-1 font-medium italic">
                                {expense.method} {expense.method === 'Contagem Manual' && `(${expense.previousReading} -> ${expense.currentReading})`}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-bold text-[#1E293B]">
                        {expense.amount}€
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(expense.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingExpense(expense);
                            setNewExpense(expense);
                            setIsAddDialogOpen(true);
                          }} className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)} className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></Button>
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
