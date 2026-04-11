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
  FileText, 
  Search,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Building2,
  Home,
  Users,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Contract, Property, Unit, Tenant } from '../types';
import { toast } from 'sonner';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  
  const [newContract, setNewContract] = useState<Partial<Contract>>({
    propertyId: '',
    unitId: '',
    tenantIds: [],
    type: 'Com Prazo Certo',
    rentAmount: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    paymentDay: 1,
    depositAmount: 0,
    firstRentAmount: 0,
    lastRentAmount: 0,
    status: 'Active',
    observations: '',
  });

  useEffect(() => {
    const unsubContracts = onSnapshot(collection(db, 'contracts'), (s) => setContracts(s.docs.map(d => ({ id: d.id, ...d.data() } as Contract))), (e) => handleFirestoreError(e, OperationType.LIST, 'contracts'));
    const unsubProps = onSnapshot(collection(db, 'properties'), (s) => setProperties(s.docs.map(d => ({ id: d.id, ...d.data() } as Property))), (e) => handleFirestoreError(e, OperationType.LIST, 'properties'));
    const unsubUnits = onSnapshot(collection(db, 'units'), (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit))), (e) => handleFirestoreError(e, OperationType.LIST, 'units'));
    const unsubTenants = onSnapshot(collection(db, 'tenants'), (s) => setTenants(s.docs.map(d => ({ id: d.id, ...d.data() } as Tenant))), (e) => handleFirestoreError(e, OperationType.LIST, 'tenants'));

    return () => {
      unsubContracts(); unsubProps(); unsubUnits(); unsubTenants();
    };
  }, []);

  const handleSaveContract = async () => {
    try {
      if (editingContract) {
        await updateDoc(doc(db, 'contracts', editingContract.id), { ...newContract });
        toast.success('Contrato atualizado!');
      } else {
        await addDoc(collection(db, 'contracts'), {
          ...newContract,
          createdAt: new Date().toISOString()
        });
        toast.success('Contrato criado!');
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contracts');
    }
  };

  const resetForm = () => {
    setNewContract({
      propertyId: '',
      unitId: '',
      tenantIds: [],
      type: 'Com Prazo Certo',
      rentAmount: 0,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      paymentDay: 1,
      depositAmount: 0,
      firstRentAmount: 0,
      lastRentAmount: 0,
      status: 'Active',
      observations: '',
    });
    setEditingContract(null);
  };

  const handleDeleteContract = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contracts', id));
      toast.success('Contrato removido.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'contracts');
    }
  };

  const getContractStatus = (contract: Contract) => {
    if (contract.status === 'Terminated') return { label: 'Terminado', color: 'bg-rose-50 text-rose-600' };
    if (contract.endDate) {
      const daysLeft = differenceInDays(parseISO(contract.endDate), new Date());
      if (daysLeft < 0) return { label: 'Terminado', color: 'bg-rose-50 text-rose-600' };
      if (daysLeft <= 30) return { label: 'A Terminar', color: 'bg-amber-50 text-amber-600' };
    }
    return { label: 'Ativo', color: 'bg-emerald-50 text-emerald-600' };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Contratos</h2>
          <p className="text-neutral-500">Gestão de contratos de arrendamento e documentação legal.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Novo Contrato
            </Button>
          } />
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingContract ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-neutral-100 p-1">
                <TabsTrigger value="details" className="rounded-lg">Dados do Contrato</TabsTrigger>
                <TabsTrigger value="archive" className="rounded-lg">Arquivo</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Imóvel</Label>
                    <Select value={newContract.propertyId || ''} onValueChange={v => setNewContract({...newContract, propertyId: v, unitId: ''})}>
                      <SelectTrigger><SelectValue placeholder="Selecionar Imóvel" /></SelectTrigger>
                      <SelectContent>
                        {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Unidade</Label>
                    <Select value={newContract.unitId || ''} onValueChange={v => setNewContract({...newContract, unitId: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecionar Unidade" /></SelectTrigger>
                      <SelectContent>
                        {units.filter(u => u.propertyId === newContract.propertyId).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Inquilino(s)</Label>
                    <Select value={newContract.tenantIds?.[0] || ''} onValueChange={v => setNewContract({...newContract, tenantIds: [v]})}>
                      <SelectTrigger><SelectValue placeholder="Selecionar Inquilino" /></SelectTrigger>
                      <SelectContent>
                        {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipo de Contrato</Label>
                    <Select value={newContract.type || 'Com Prazo Certo'} onValueChange={(v: any) => setNewContract({...newContract, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Com Prazo Certo">Com Prazo Certo</SelectItem>
                        <SelectItem value="Sem Termo">Sem Termo</SelectItem>
                        <SelectItem value="De Curta Duração">De Curta Duração</SelectItem>
                        <SelectItem value="Arrendamento de Quarto">Arrendamento de Quarto</SelectItem>
                        <SelectItem value="Comodato">Comodato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor da Renda (€)</Label>
                    <Input type="number" value={newContract.rentAmount ?? 0} onChange={e => setNewContract({...newContract, rentAmount: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Data de Vencimento</Label>
                    <Input type="number" min="1" max="31" value={newContract.paymentDay ?? 1} onChange={e => setNewContract({...newContract, paymentDay: parseInt(e.target.value) || 1})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Caução (€)</Label>
                    <Input type="number" value={newContract.depositAmount ?? 0} onChange={e => setNewContract({...newContract, depositAmount: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data de Início</Label>
                    <Input type="date" value={newContract.startDate || ''} onChange={e => setNewContract({...newContract, startDate: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Data de Fim (Opcional)</Label>
                    <Input type="date" value={newContract.endDate || ''} onChange={e => setNewContract({...newContract, endDate: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Primeira Renda (€)</Label>
                    <Input type="number" value={newContract.firstRentAmount ?? 0} onChange={e => setNewContract({...newContract, firstRentAmount: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Última Renda (€)</Label>
                    <Input type="number" value={newContract.lastRentAmount ?? 0} onChange={e => setNewContract({...newContract, lastRentAmount: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Observações</Label>
                  <Input value={newContract.observations || ''} onChange={e => setNewContract({...newContract, observations: e.target.value})} />
                </div>
              </TabsContent>

              <TabsContent value="archive" className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-neutral-400 gap-2">
                    <ImageIcon size={32} />
                    <p className="text-xs font-medium">Fotos do Estado Inicial</p>
                    <Button variant="ghost" size="sm" className="text-[10px]">Upload</Button>
                  </div>
                  <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-neutral-400 gap-2">
                    <FileText size={32} />
                    <p className="text-xs font-medium">Contrato Assinado (PDF)</p>
                    <Button variant="ghost" size="sm" className="text-[10px]">Upload</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button onClick={handleSaveContract} className="w-full bg-[#1E293B] rounded-xl h-11">
                {editingContract ? 'Atualizar Contrato' : 'Guardar Contrato'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">CONTRATOS ATIVOS</p>
            <h3 className="text-2xl font-bold text-[#1E293B]">
              {contracts.filter(c => c.status === 'Active').length}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">A TERMINAR (30 DIAS)</p>
            <h3 className="text-2xl font-bold text-amber-500">
              {contracts.filter(c => c.status === 'Active' && c.endDate && differenceInDays(parseISO(c.endDate), new Date()) <= 30).length}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">RENDIMENTO CONTRATUAL</p>
            <h3 className="text-2xl font-bold text-emerald-600">
              {contracts.filter(c => c.status === 'Active').reduce((acc, c) => acc + c.rentAmount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">IMÓVEL / UNIDADE</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">INQUILINO(S)</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">VALOR</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">INÍCIO / FIM</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">ESTADO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-neutral-400">
                    Nenhum contrato registado.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => {
                  const prop = properties.find(p => p.id === contract.propertyId);
                  const unit = units.find(u => u.id === contract.unitId);
                  const contractTenants = tenants.filter(t => contract.tenantIds.includes(t.id));
                  const status = getContractStatus(contract);

                  return (
                    <TableRow key={contract.id} className="border-neutral-50 hover:bg-neutral-50/30 transition-colors group">
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
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contractTenants.map(t => (
                            <Badge key={t.id} variant="secondary" className="bg-neutral-100 text-neutral-600 border-none text-[10px] px-2">
                              {t.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-sm font-bold text-[#1E293B]">{contract.rentAmount}€</p>
                        <p className="text-[10px] text-neutral-400">Dia {contract.paymentDay}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-sm text-neutral-600">{contract.startDate}</p>
                        <p className="text-[10px] text-neutral-400">{contract.endDate || 'Sem data fim'}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={`${status.color} border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingContract(contract);
                            setNewContract(contract);
                            setIsAddDialogOpen(true);
                          }} className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteContract(contract.id)} className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></Button>
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
