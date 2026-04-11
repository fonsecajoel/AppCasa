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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Users, 
  Plus, 
  Trash2, 
  Phone, 
  AlertTriangle, 
  Pencil, 
  Mail,
  CreditCard,
  Building2,
  Home
} from 'lucide-react';
import { Tenant, Contract, Payment, Property, Unit, Address } from '../types';
import { toast } from 'sonner';
import { AddressInput } from './AddressInput';

const emptyAddress: Address = {
  street: '',
  number: '',
  lot: '',
  floor: '',
  door: '',
  postalCode: '',
  locality: '',
  municipality: '',
  district: '',
  country: 'Portugal',
};

export default function TenantManager() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  
  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    name: '',
    email: '',
    phone: '',
    nif: '',
    address: emptyAddress,
    profession: '',
    emergencyContact: '',
  });

  useEffect(() => {
    const unsubTenants = onSnapshot(collection(db, 'tenants'), (s) => setTenants(s.docs.map(d => ({ id: d.id, ...d.data() } as Tenant))), (e) => handleFirestoreError(e, OperationType.LIST, 'tenants'));
    const unsubContracts = onSnapshot(collection(db, 'contracts'), (s) => setContracts(s.docs.map(d => ({ id: d.id, ...d.data() } as Contract))), (e) => handleFirestoreError(e, OperationType.LIST, 'contracts'));
    const unsubPayments = onSnapshot(collection(db, 'payments'), (s) => setPayments(s.docs.map(d => ({ id: d.id, ...d.data() } as Payment))), (e) => handleFirestoreError(e, OperationType.LIST, 'payments'));
    const unsubProps = onSnapshot(collection(db, 'properties'), (s) => setProperties(s.docs.map(d => ({ id: d.id, ...d.data() } as Property))), (e) => handleFirestoreError(e, OperationType.LIST, 'properties'));
    const unsubUnits = onSnapshot(collection(db, 'units'), (s) => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() } as Unit))), (e) => handleFirestoreError(e, OperationType.LIST, 'units'));

    return () => {
      unsubTenants(); unsubContracts(); unsubPayments(); unsubProps(); unsubUnits();
    };
  }, []);

  const handleSaveTenant = async () => {
    try {
      if (editingTenant) {
        await updateDoc(doc(db, 'tenants', editingTenant.id), { ...newTenant });
        toast.success('Inquilino atualizado!');
      } else {
        await addDoc(collection(db, 'tenants'), {
          ...newTenant,
          createdAt: new Date().toISOString()
        });
        toast.success('Inquilino adicionado!');
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tenants');
    }
  };

  const resetForm = () => {
    setNewTenant({ name: '', email: '', phone: '', nif: '', address: emptyAddress, profession: '', emergencyContact: '' });
    setEditingTenant(null);
  };

  const handleDeleteTenant = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tenants', id));
      toast.success('Inquilino removido.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'tenants');
    }
  };

  const getTenantStatus = (tenantId: string) => {
    const tenantContracts = contracts.filter(c => c.tenantIds.includes(tenantId));
    const activeContract = tenantContracts.find(c => c.status === 'Active');
    const latePayments = payments.filter(p => p.tenantId === tenantId && p.status === 'Late');

    if (activeContract) {
      if (latePayments.length > 0) return { label: 'Ativo com Aviso', color: 'bg-amber-50 text-amber-600' };
      return { label: 'Ativo', color: 'bg-emerald-50 text-emerald-600' };
    }
    if (tenantContracts.length > 0) return { label: 'Inativo', color: 'bg-rose-50 text-rose-600' };
    return { label: 'Novo', color: 'bg-yellow-50 text-yellow-600' };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Inquilinos</h2>
          <p className="text-neutral-500">Gestão de ocupantes, contactos e histórico contratual.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Novo Inquilino
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingTenant ? 'Editar Inquilino' : 'Novo Inquilino'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Nome Completo</Label>
                  <Input value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} placeholder="Ex: Joel Fonseca" />
                </div>
                <div className="grid gap-2">
                  <Label>NIF</Label>
                  <Input value={newTenant.nif} onChange={e => setNewTenant({...newTenant, nif: e.target.value})} placeholder="123456789" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={newTenant.email} onChange={e => setNewTenant({...newTenant, email: e.target.value})} placeholder="joel@exemplo.com" />
                </div>
                <div className="grid gap-2">
                  <Label>Telemóvel</Label>
                  <Input value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} placeholder="912345678" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Morada Fiscal</Label>
                <AddressInput 
                  value={newTenant.address as Address} 
                  onChange={(addr) => setNewTenant({ ...newTenant, address: addr })} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Profissão</Label>
                  <Input value={newTenant.profession} onChange={e => setNewTenant({...newTenant, profession: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Contacto de Emergência</Label>
                  <Input value={newTenant.emergencyContact} onChange={e => setNewTenant({...newTenant, emergencyContact: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveTenant} className="w-full bg-[#1E293B] rounded-xl h-11">
                {editingTenant ? 'Atualizar Inquilino' : 'Guardar Inquilino'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">TOTAL INQUILINOS</p>
            <h3 className="text-2xl font-bold text-[#1E293B]">{tenants.length}</h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">ATIVOS</p>
            <h3 className="text-2xl font-bold text-emerald-600">
              {tenants.filter(t => getTenantStatus(t.id).label === 'Ativo').length}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">COM AVISO</p>
            <h3 className="text-2xl font-bold text-amber-600">
              {tenants.filter(t => getTenantStatus(t.id).label === 'Ativo com Aviso').length}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">INATIVOS</p>
            <h3 className="text-2xl font-bold text-rose-600">
              {tenants.filter(t => getTenantStatus(t.id).label === 'Inativo').length}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">INQUILINO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">UNIDADE ATUAL</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">CONTACTOS</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">STATUS</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-neutral-400">
                    Nenhum inquilino registado.
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => {
                  const status = getTenantStatus(tenant.id);
                  const activeContract = contracts.find(c => c.tenantIds.includes(tenant.id) && c.status === 'Active');
                  const unit = activeContract ? units.find(u => u.id === activeContract.unitId) : null;
                  const property = unit ? properties.find(p => p.id === unit.propertyId) : null;

                  return (
                    <TableRow key={tenant.id} className="border-neutral-50 hover:bg-neutral-50/30 transition-colors group">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 border-none">
                            <AvatarFallback className="font-bold text-xs">{tenant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-[#1E293B]">{tenant.name}</p>
                            <p className="text-[10px] text-neutral-400">NIF: {tenant.nif}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {unit ? (
                          <div>
                            <p className="text-sm font-bold text-[#1E293B]">{unit.name}</p>
                            <p className="text-[10px] text-neutral-400">{property?.name}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">Sem unidade ativa</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-neutral-500">
                            <Phone size={12} className="opacity-40" />
                            <span className="text-xs">{tenant.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-500">
                            <Mail size={12} className="opacity-40" />
                            <span className="text-xs">{tenant.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={`${status.color} border-none rounded-md px-2 py-0.5 text-[10px] font-bold`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingTenant(tenant);
                            setNewTenant(tenant);
                            setIsAddDialogOpen(true);
                          }} className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTenant(tenant.id)} className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></Button>
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

      {/* Late Payments Alert Section */}
      {payments.some(p => p.status === 'Late') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle size={20} />
              <h3 className="font-bold">Incumprimentos Detetados</h3>
            </div>
          </div>
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-neutral-50/50">
                  <TableRow className="border-neutral-100 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">INQUILINO</TableHead>
                    <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">TIPO</TableHead>
                    <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">MONTANTE</TableHead>
                    <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">VENCIMENTO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.filter(p => p.status === 'Late').map(p => {
                    const tenant = tenants.find(t => t.id === p.tenantId);
                    return (
                      <TableRow key={p.id} className="border-neutral-50">
                        <TableCell className="px-6 py-4 font-bold text-[#1E293B]">{tenant?.name || 'Desconhecido'}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-neutral-500">{p.type}</TableCell>
                        <TableCell className="px-6 py-4 font-bold text-rose-600">{p.amount}€</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-neutral-500">{p.dueDate}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
