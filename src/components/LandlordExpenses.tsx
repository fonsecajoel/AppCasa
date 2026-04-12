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
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { LandlordExpense, Property } from '../types';
import { fetchCollection, createDoc, updateDoc as apiUpdateDoc, deleteDoc as apiDeleteDoc } from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

export default function LandlordExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<LandlordExpense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<LandlordExpense | null>(null);

  const loadExpenses = () => {
    fetchCollection<LandlordExpense>('landlordExpenses').then(setExpenses).catch(console.error);
  };

  const loadProperties = () => {
    fetchCollection<Property>('properties').then(setProperties).catch(console.error);
  };

  const loadData = () => {
    loadExpenses();
    loadProperties();
  };
  
  const [newExpense, setNewExpense] = useState<Partial<LandlordExpense>>({
    propertyId: '',
    type: 'IMI',
    amount: 0,
    frequency: 'Anual',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'Pending',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveExpense = async () => {
    try {
      if (editingExpense) {
        await apiUpdateDoc('landlordExpenses', editingExpense.id, { ...newExpense });
        toast.success('Encargo atualizado!');
      } else {
        await createDoc('landlordExpenses', {
          ...newExpense,
          ownerId: user?.uid || '',
          createdAt: new Date().toISOString()
        });
        toast.success('Encargo registado!');
      }
      loadExpenses();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao guardar encargo.');
    }
  };

  const resetForm = () => {
    setNewExpense({
      propertyId: '',
      type: 'IMI',
      amount: 0,
      frequency: 'Anual',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
      description: '',
    });
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await apiDeleteDoc('landlordExpenses', id);
      toast.success('Encargo removido.');
      loadExpenses();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover encargo.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Pago</Badge>;
      case 'Pending': return <Badge className="bg-yellow-50 text-yellow-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Pendente</Badge>;
      case 'Late': return <Badge className="bg-rose-50 text-rose-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Atrasado</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Encargos do Senhorio</h2>
          <p className="text-neutral-500">Gestão de impostos, condomínios, seguros e outras despesas fixas.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Novo Encargo
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Editar Encargo' : 'Registar Novo Encargo'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Imóvel</Label>
                <Select value={newExpense.propertyId} onValueChange={v => setNewExpense({...newExpense, propertyId: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecionar Imóvel" /></SelectTrigger>
                  <SelectContent>
                    {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={newExpense.type} onValueChange={(v: any) => setNewExpense({...newExpense, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                <div className="grid gap-2">
                  <Label>Frequência</Label>
                  <Select value={newExpense.frequency} onValueChange={(v: any) => setNewExpense({...newExpense, frequency: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anual">Anual</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Único">Único</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor (€)</Label>
                  <Input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                  <Label>Data de Vencimento</Label>
                  <Input type="date" value={newExpense.dueDate} onChange={e => setNewExpense({...newExpense, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select value={newExpense.status} onValueChange={(v: any) => setNewExpense({...newExpense, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pendente</SelectItem>
                    <SelectItem value="Paid">Pago</SelectItem>
                    <SelectItem value="Late">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Descrição / Notas</Label>
                <Input value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveExpense} className="w-full bg-[#1E293B] rounded-xl h-11">
                {editingExpense ? 'Atualizar Encargo' : 'Guardar Encargo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">TOTAL PAGO (ANO)</p>
            <h3 className="text-2xl font-bold text-rose-600">
              {expenses.filter(e => e.status === 'Paid').reduce((acc, e) => acc + e.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">ENCARGOS PENDENTES</p>
            <h3 className="text-2xl font-bold text-amber-600">
              {expenses.filter(e => e.status === 'Pending').reduce((acc, e) => acc + e.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">PRÓXIMO VENCIMENTO</p>
              <h3 className="text-lg font-bold text-[#1E293B]">
                {expenses.filter(e => e.status === 'Pending').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate || '---'}
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
                placeholder="Pesquisar encargos..." 
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
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">DATA VENC.</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">IMÓVEL</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">TIPO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">FREQUÊNCIA</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">VALOR</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">ESTADO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-neutral-400">
                    Nenhum encargo registado.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => {
                  const prop = properties.find(p => p.id === expense.propertyId);

                  return (
                    <TableRow key={expense.id} className="border-neutral-50 hover:bg-neutral-50/30 transition-colors group">
                      <TableCell className="px-6 py-4 text-sm text-neutral-600 font-medium">
                        {expense.dueDate}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-500">
                            <Building2 size={18} />
                          </div>
                          <p className="font-bold text-[#1E293B]">{prop?.name || '---'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">{expense.type}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-neutral-500">
                        {expense.frequency}
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
