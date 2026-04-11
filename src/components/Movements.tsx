import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
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
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  ArrowLeftRight
} from 'lucide-react';
import { Movement, Property, Unit } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Movements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  
  const [newMovement, setNewMovement] = useState<Partial<Movement>>({
    propertyId: '',
    unitId: '',
    type: 'Entrada',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Concluído',
    description: '',
  });

  useEffect(() => {
    const qMovements = collection(db, 'movements');
    const qProps = collection(db, 'properties');
    const qUnits = collection(db, 'units');

    const unsubMovements = onSnapshot(qMovements, (s) => setMovements(s.docs.map(d => ({ id: d.id, ...d.data() } as Movement))), (e) => handleFirestoreError(e, OperationType.LIST, 'movements'));
    const unsubProps = onSnapshot(qProps, (s) => setProperties(s.docs.map(d => ({ id: d.id, ...d.data() } as Property))), (e) => handleFirestoreError(e, OperationType.LIST, 'properties'));
    const unsubUnits = onSnapshot(qUnits, (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit))), (e) => handleFirestoreError(e, OperationType.LIST, 'units'));

    return () => {
      unsubMovements(); unsubProps(); unsubUnits();
    };
  }, []);

  const handleSaveMovement = async () => {
    try {
      if (editingMovement) {
        await updateDoc(doc(db, 'movements', editingMovement.id), { ...newMovement });
        toast.success('Movimento atualizado!');
      } else {
        await addDoc(collection(db, 'movements'), {
          ...newMovement,
          createdAt: new Date().toISOString()
        });
        toast.success('Movimento registado!');
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'movements');
    }
  };

  const resetForm = () => {
    setNewMovement({
      propertyId: '',
      unitId: '',
      type: 'Entrada',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Concluído',
      description: '',
    });
    setEditingMovement(null);
  };

  const handleDeleteMovement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'movements', id));
      toast.success('Movimento removido.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'movements');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído': return <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Concluído</Badge>;
      case 'Pendente': return <Badge className="bg-yellow-50 text-yellow-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Pendente</Badge>;
      case 'Cancelado': return <Badge className="bg-rose-50 text-rose-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Cancelado</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Movimentos</h2>
          <p className="text-neutral-500">Histórico consolidado de todas as transações financeiras.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Novo Movimento
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingMovement ? 'Editar Movimento' : 'Registar Novo Movimento'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Imóvel</Label>
                  <Select value={newMovement.propertyId} onValueChange={v => setNewMovement({...newMovement, propertyId: v, unitId: ''})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Imóvel" /></SelectTrigger>
                    <SelectContent>
                      {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Select value={newMovement.unitId} onValueChange={v => setNewMovement({...newMovement, unitId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Unidade" /></SelectTrigger>
                    <SelectContent>
                      {units.filter(u => u.propertyId === newMovement.propertyId).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={newMovement.type} onValueChange={(v: any) => setNewMovement({...newMovement, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Saída">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Valor (€)</Label>
                  <Input type="number" value={newMovement.amount} onChange={e => setNewMovement({...newMovement, amount: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input type="date" value={newMovement.date} onChange={e => setNewMovement({...newMovement, date: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select value={newMovement.status} onValueChange={(v: any) => setNewMovement({...newMovement, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input value={newMovement.description} onChange={e => setNewMovement({...newMovement, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveMovement} className="w-full bg-[#1E293B] rounded-xl h-11">
                {editingMovement ? 'Atualizar Movimento' : 'Guardar Movimento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <ArrowUpCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">ENTRADAS (MÊS)</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">
                {movements.filter(m => m.type === 'Entrada' && m.status === 'Concluído').reduce((acc, m) => acc + m.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
              <ArrowDownCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">SAÍDAS (MÊS)</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">
                {movements.filter(m => m.type === 'Saída' && m.status === 'Concluído').reduce((acc, m) => acc + m.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <ArrowLeftRight size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">SALDO ATUAL</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">
                {(movements.filter(m => m.type === 'Entrada' && m.status === 'Concluído').reduce((acc, m) => acc + m.amount, 0) - movements.filter(m => m.type === 'Saída' && m.status === 'Concluído').reduce((acc, m) => acc + m.amount, 0)).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
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
                placeholder="Pesquisar movimentos..." 
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
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">DESCRIÇÃO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">VALOR</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">ESTADO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-neutral-400">
                    Nenhum movimento registado.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((mov) => {
                  const prop = properties.find(p => p.id === mov.propertyId);
                  const unit = units.find(u => u.id === mov.unitId);

                  return (
                    <TableRow key={mov.id} className="border-neutral-50 hover:bg-neutral-50/30 transition-colors group">
                      <TableCell className="px-6 py-4 text-sm text-neutral-600 font-medium">
                        {mov.date}
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
                      <TableCell className="px-6 py-4 text-sm text-neutral-600">
                        {mov.description}
                      </TableCell>
                      <TableCell className={`px-6 py-4 font-bold ${mov.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {mov.type === 'Entrada' ? '+' : '-'} {mov.amount}€
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(mov.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingMovement(mov);
                            setNewMovement(mov);
                            setIsAddDialogOpen(true);
                          }} className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMovement(mov.id)} className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></Button>
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
