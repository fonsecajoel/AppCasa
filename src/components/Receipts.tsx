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
  Search,
  Filter,
  Download,
  Printer,
  Mail,
  MoreVertical,
  FileCheck,
  Building2,
  Users,
  Pencil,
  Trash2
} from 'lucide-react';
import { Receipt, Property, Unit, Tenant } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  
  const [newReceipt, setNewReceipt] = useState<Partial<Receipt>>({
    propertyId: '',
    unitId: '',
    tenantId: '',
    type: 'Renda',
    amount: 0,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'Por Emitir',
    month: format(new Date(), 'MMMM yyyy'),
    category: '',
    method: undefined,
    previousReading: 0,
    currentReading: 0,
    pricePerUnit: 0,
  });

  useEffect(() => {
    const qReceipts = collection(db, 'receipts');
    const qProps = collection(db, 'properties');
    const qUnits = collection(db, 'units');
    const qTenants = collection(db, 'tenants');

    const unsubReceipts = onSnapshot(qReceipts, (s) => setReceipts(s.docs.map(d => ({ id: d.id, ...d.data() } as Receipt))), (e) => handleFirestoreError(e, OperationType.LIST, 'receipts'));
    const unsubProps = onSnapshot(qProps, (s) => setProperties(s.docs.map(d => ({ id: d.id, ...d.data() } as Property))), (e) => handleFirestoreError(e, OperationType.LIST, 'properties'));
    const unsubUnits = onSnapshot(qUnits, (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit))), (e) => handleFirestoreError(e, OperationType.LIST, 'units'));
    const unsubTenants = onSnapshot(qTenants, (s) => setTenants(s.docs.map(d => ({ id: d.id, ...d.data() } as Tenant))), (e) => handleFirestoreError(e, OperationType.LIST, 'tenants'));

    return () => {
      unsubReceipts(); unsubProps(); unsubUnits(); unsubTenants();
    };
  }, []);

  const handleSaveReceipt = async () => {
    try {
      if (editingReceipt) {
        await updateDoc(doc(db, 'receipts', editingReceipt.id), { ...newReceipt });
        toast.success('Recibo atualizado!');
      } else {
        await addDoc(collection(db, 'receipts'), {
          ...newReceipt,
          createdAt: new Date().toISOString()
        });
        toast.success('Recibo criado!');
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'receipts');
    }
  };

  const resetForm = () => {
    setNewReceipt({
      propertyId: '',
      unitId: '',
      tenantId: '',
      type: 'Renda',
      amount: 0,
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Por Emitir',
      month: format(new Date(), 'MMMM yyyy'),
      category: '',
      method: undefined,
      previousReading: 0,
      currentReading: 0,
      pricePerUnit: 0,
    });
    setEditingReceipt(null);
  };

  const handleDeleteReceipt = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'receipts', id));
      toast.success('Recibo removido.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'receipts');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Emitido': return <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Emitido</Badge>;
      case 'Por Emitir': return <Badge className="bg-yellow-50 text-yellow-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Por Emitir</Badge>;
      case 'Anulado': return <Badge className="bg-rose-50 text-rose-600 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">Anulado</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Recibos</h2>
          <p className="text-neutral-500">Emissão e histórico de recibos de quitação.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Emitir Recibo
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingReceipt ? 'Editar Recibo' : 'Emitir Novo Recibo'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Imóvel</Label>
                  <Select value={newReceipt.propertyId || ''} onValueChange={v => setNewReceipt({...newReceipt, propertyId: v, unitId: ''})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Imóvel" /></SelectTrigger>
                    <SelectContent>
                      {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Select value={newReceipt.unitId || ''} onValueChange={v => setNewReceipt({...newReceipt, unitId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Unidade" /></SelectTrigger>
                    <SelectContent>
                      {units.filter(u => u.propertyId === newReceipt.propertyId).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Inquilino</Label>
                <Select value={newReceipt.tenantId || ''} onValueChange={v => setNewReceipt({...newReceipt, tenantId: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecionar Inquilino" /></SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={newReceipt.type || 'Renda'} onValueChange={(v: any) => setNewReceipt({...newReceipt, type: v, category: '', method: undefined})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Renda">Renda</SelectItem>
                      <SelectItem value="Despesa">Despesa</SelectItem>
                      <SelectItem value="Caução">Caução</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Mês de Referência</Label>
                  <Input value={newReceipt.month || ''} onChange={e => setNewReceipt({...newReceipt, month: e.target.value})} placeholder="Ex: Abril 2026" />
                </div>
              </div>
              
              {newReceipt.type === 'Despesa' && (
                <div className="grid gap-2">
                  <Label>Qual é a Despesa?</Label>
                  <Select value={newReceipt.category || ''} onValueChange={v => setNewReceipt({...newReceipt, category: v, method: (v === 'Água' || v === 'Eletricidade') ? newReceipt.method : undefined})}>
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

              {newReceipt.type === 'Despesa' && (newReceipt.category === 'Água' || newReceipt.category === 'Eletricidade') && (
                <div className="grid gap-4 border-l-2 border-blue-100 pl-4 py-2 bg-blue-50/30 rounded-r-xl">
                  <div className="grid gap-2">
                    <Label className="text-blue-700 font-bold text-[10px] uppercase tracking-wider">Método de Cobrança</Label>
                    <Select value={newReceipt.method || 'Fatura'} onValueChange={(v: any) => setNewReceipt({...newReceipt, method: v})}>
                      <SelectTrigger className="bg-white border-blue-100"><SelectValue placeholder="Selecionar Método" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fatura">Fatura</SelectItem>
                        <SelectItem value="Contagem Manual">Contagem Manual</SelectItem>
                        <SelectItem value="Valor Fixo">Valor Fixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newReceipt.method === 'Contagem Manual' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-blue-600 text-[10px] uppercase tracking-wider">Anterior</Label>
                        <Input 
                          type="number" 
                          className="bg-white border-blue-100"
                          value={newReceipt.previousReading ?? 0} 
                          onChange={e => {
                            const prev = parseFloat(e.target.value) || 0;
                            const curr = newReceipt.currentReading || 0;
                            const price = newReceipt.pricePerUnit || 0;
                            setNewReceipt({
                              ...newReceipt, 
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
                          value={newReceipt.currentReading ?? 0} 
                          onChange={e => {
                            const curr = parseFloat(e.target.value) || 0;
                            const prev = newReceipt.previousReading || 0;
                            const price = newReceipt.pricePerUnit || 0;
                            setNewReceipt({
                              ...newReceipt, 
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
                          value={newReceipt.pricePerUnit ?? 0} 
                          onChange={e => {
                            const price = parseFloat(e.target.value) || 0;
                            const curr = newReceipt.currentReading || 0;
                            const prev = newReceipt.previousReading || 0;
                            setNewReceipt({
                              ...newReceipt, 
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor (€)</Label>
                  <Input type="number" value={newReceipt.amount ?? 0} onChange={e => setNewReceipt({...newReceipt, amount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="grid gap-2">
                  <Label>Data de Emissão</Label>
                  <Input type="date" value={newReceipt.dueDate || ''} onChange={e => setNewReceipt({...newReceipt, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select value={newReceipt.status || 'Por Emitir'} onValueChange={(v: any) => setNewReceipt({...newReceipt, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Por Emitir">Por Emitir</SelectItem>
                    <SelectItem value="Emitido">Emitido</SelectItem>
                    <SelectItem value="Anulado">Anulado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveReceipt} className="w-full bg-[#1E293B] rounded-xl h-11">
                {editingReceipt ? 'Atualizar Recibo' : 'Emitir Recibo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">RECIBOS ESTE MÊS</p>
            <h3 className="text-2xl font-bold text-[#1E293B]">
              {receipts.filter(r => r.status === 'Emitido').length}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">VALOR TOTAL EMITIDO</p>
            <h3 className="text-2xl font-bold text-[#1E293B]">
              {receipts.filter(r => r.status === 'Emitido').reduce((acc, r) => acc + r.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <FileCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">AUTOMAÇÃO</p>
              <h3 className="text-lg font-bold text-[#1E293B]">Ativa</h3>
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
                placeholder="Pesquisar recibos..." 
                className="pl-10 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-neutral-200 outline-none w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-neutral-500 rounded-xl">
              <Filter size={16} />
              Mês
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-neutral-500 rounded-xl">
              <Download size={16} />
              PDF
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">DATA / MÊS</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">IMÓVEL / UNIDADE</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">INQUILINO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">VALOR</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">ESTADO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-neutral-400">
                    Nenhum recibo registado.
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((receipt) => {
                  const prop = properties.find(p => p.id === receipt.propertyId);
                  const unit = units.find(u => u.id === receipt.unitId);
                  const tenant = tenants.find(t => t.id === receipt.tenantId);

                  return (
                    <TableRow key={receipt.id} className="border-neutral-50 hover:bg-neutral-50/30 transition-colors group">
                      <TableCell className="px-6 py-4">
                        <p className="text-sm font-bold text-[#1E293B]">{receipt.dueDate}</p>
                        <p className="text-[10px] text-neutral-400">{receipt.month}</p>
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
                      <TableCell className="px-6 py-4 font-bold text-[#1E293B]">
                        {receipt.amount}€
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(receipt.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Printer size={16} /></Button>
                          <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Mail size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingReceipt(receipt);
                            setNewReceipt(receipt);
                            setIsAddDialogOpen(true);
                          }} className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteReceipt(receipt.id)} className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></Button>
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
