import { useEffect, useState } from 'react';
import { fetchCollection, createDoc, updateDoc as apiUpdateDoc, deleteDoc as apiDeleteDoc, batchWrite } from '../services/api';
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
  Building2, 
  Plus, 
  Trash2, 
  Pencil, 
  Info, 
  ChevronRight, 
  Building, 
  Wallet,
  Home,
  FileText,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { Property, Unit, LandlordCharge, Contract, Address } from '../types';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AddressInput } from './AddressInput';
import { useAuth } from '../contexts/AuthContext';

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

export default function PropertyManager() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [charges, setCharges] = useState<LandlordCharge[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    name: '',
    type: 'Apartamento',
    typology: 'T1',
    address: emptyAddress,
    area: 0,
  });

  const [propertyUnits, setPropertyUnits] = useState<Partial<Unit>[]>([]);
  const [propertyCharges, setPropertyCharges] = useState<Partial<LandlordCharge>[]>([]);

  const reload = () => {
    fetchCollection<Property>('properties').then(setProperties).catch(console.error);
    fetchCollection<Unit>('units').then(setUnits).catch(console.error);
    fetchCollection<LandlordCharge>('landlordExpenses').then(setCharges).catch(console.error);
    fetchCollection<Contract>('contracts').then(setContracts).catch(console.error);
  };

  useEffect(() => {
    reload();
  }, []);

  const handleSaveProperty = async () => {
    try {
      let propertyId = editingProperty?.id;

      if (editingProperty) {
        await apiUpdateDoc('properties', editingProperty.id, { ...newProperty });
      } else {
        propertyId = await createDoc('properties', {
          ...newProperty,
          ownerId: user?.uid || '',
          createdAt: new Date().toISOString(),
        });
      }

      const operations: Array<{ type: 'set'; collection: string; data: Record<string, unknown> }> = [];

      propertyUnits.forEach(u => {
        if (!u.id) {
          operations.push({
            type: 'set',
            collection: 'units',
            data: {
            ...u,
            propertyId,
            ownerId: user?.uid || '',
            createdAt: new Date().toISOString(),
            },
          });
        }
      });

      propertyCharges.forEach(c => {
        if (!c.id) {
          operations.push({
            type: 'set',
            collection: 'landlordExpenses',
            data: {
            ...c,
            propertyId,
            ownerId: user?.uid || '',
            createdAt: new Date().toISOString(),
            },
          });
        }
      });

      if (operations.length > 0) {
        await batchWrite(operations);
      }
      reload();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success(editingProperty ? 'Propriedade atualizada!' : 'Propriedade criada!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao guardar imóvel: ' + (err?.message || err));
    }
  };

  const resetForm = () => {
    setNewProperty({ name: '', type: 'Apartamento', typology: 'T1', address: emptyAddress, area: 0 });
    setPropertyUnits([]);
    setPropertyCharges([]);
    setEditingProperty(null);
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await apiDeleteDoc('properties', id);
      reload();
      toast.success('Propriedade removida.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover imóvel.');
    }
  };

  const addUnitField = () => {
    setPropertyUnits([...propertyUnits, { name: '', type: 'Habitação Completa' }]);
  };

  const removeUnitField = (index: number) => {
    setPropertyUnits(propertyUnits.filter((_, i) => i !== index));
  };

  const addChargeField = () => {
    setPropertyCharges([...propertyCharges, { type: 'IMI', amount: 0, frequency: 'Anual', nextDueDate: '' }]);
  };

  const removeChargeField = (index: number) => {
    setPropertyCharges(propertyCharges.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Imóveis</h2>
          <p className="text-neutral-500">Gestão de edifícios, unidades e encargos do senhorio.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Novo Imóvel
            </Button>
          } />
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingProperty ? 'Editar Imóvel' : 'Criar Novo Imóvel'}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-xl bg-neutral-100 p-1">
                <TabsTrigger value="details" className="rounded-lg">Dados</TabsTrigger>
                <TabsTrigger value="units" className="rounded-lg">Unidades</TabsTrigger>
                <TabsTrigger value="charges" className="rounded-lg">Encargos</TabsTrigger>
                <TabsTrigger value="archive" className="rounded-lg">Arquivo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Nome</Label>
                    <Input value={newProperty.name} onChange={e => setNewProperty({...newProperty, name: e.target.value})} placeholder="Ex: Casa Lisboa" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Artigo Matricial</Label>
                    <Input value={newProperty.matricialArticle} onChange={e => setNewProperty({...newProperty, matricialArticle: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Licença de Utilização</Label>
                    <Input value={newProperty.usageLicense} onChange={e => setNewProperty({...newProperty, usageLicense: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Certificado Energético</Label>
                    <Input value={newProperty.energyCertificate} onChange={e => setNewProperty({...newProperty, energyCertificate: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select value={newProperty.type} onValueChange={(v: any) => setNewProperty({...newProperty, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Moradia">Moradia</SelectItem>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Garagem/Box">Garagem/Box</SelectItem>
                        <SelectItem value="Armazém">Armazém</SelectItem>
                        <SelectItem value="Loja">Loja</SelectItem>
                        <SelectItem value="Espaço Comercial">Espaço Comercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipologia</Label>
                    <Select value={newProperty.typology} onValueChange={(v: any) => setNewProperty({...newProperty, typology: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['T0','T1','T2','T3','T4','T5','T6','T7','T8','T9'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Área (m2)</Label>
                    <Input type="number" value={newProperty.area} onChange={e => setNewProperty({...newProperty, area: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Morada</Label>
                  <AddressInput 
                    value={newProperty.address as Address} 
                    onChange={(addr) => setNewProperty({ ...newProperty, address: addr })} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Observações</Label>
                  <Input value={newProperty.observations} onChange={e => setNewProperty({...newProperty, observations: e.target.value})} />
                </div>
              </TabsContent>

              <TabsContent value="units" className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-sm">Unidades do Imóvel</h5>
                  <Button variant="outline" size="sm" onClick={addUnitField} className="gap-1 rounded-lg">
                    <Plus size={14} /> Adicionar Unidade
                  </Button>
                </div>
                <div className="space-y-3">
                  {propertyUnits.map((u, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 p-3 border rounded-xl bg-neutral-50">
                      <div className="grid gap-1">
                        <Label className="text-[10px]">Nome da Unidade</Label>
                        <Input value={u.name} onChange={e => {
                          const updated = [...propertyUnits];
                          updated[i].name = e.target.value;
                          setPropertyUnits(updated);
                        }} placeholder="Ex: Quarto 1" />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-[10px]">Tipo</Label>
                        <Select value={u.type} onValueChange={(v: any) => {
                          const updated = [...propertyUnits];
                          updated[i].type = v;
                          setPropertyUnits(updated);
                        }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Habitação Completa">Habitação Completa</SelectItem>
                            <SelectItem value="Quarto Individual">Quarto Individual</SelectItem>
                            <SelectItem value="Quarto Partilhado">Quarto Partilhado</SelectItem>
                            <SelectItem value="Assoalhada">Assoalhada</SelectItem>
                            <SelectItem value="Anexo">Anexo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button variant="ghost" size="icon" onClick={() => removeUnitField(i)} className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-9 w-9">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="charges" className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-sm">Encargos do Senhorio</h5>
                  <Button variant="outline" size="sm" onClick={addChargeField} className="gap-1 rounded-lg">
                    <Plus size={14} /> Adicionar Encargo
                  </Button>
                </div>
                <div className="space-y-3">
                  {propertyCharges.map((c, i) => (
                    <div key={i} className="p-3 border rounded-xl bg-neutral-50 space-y-3">
                      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3">
                        <div className="grid gap-1">
                          <Label className="text-[10px]">Tipo</Label>
                          <Select value={c.type} onValueChange={(v: any) => {
                            const updated = [...propertyCharges];
                            updated[i].type = v;
                            setPropertyCharges(updated);
                          }}>
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
                        <div className="grid gap-1">
                          <Label className="text-[10px]">Valor (€)</Label>
                          <Input type="number" value={c.amount} onChange={e => {
                            const updated = [...propertyCharges];
                            updated[i].amount = parseFloat(e.target.value);
                            setPropertyCharges(updated);
                          }} />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-[10px]">Frequência</Label>
                          <Select value={c.frequency} onValueChange={(v: any) => {
                            const updated = [...propertyCharges];
                            updated[i].frequency = v;
                            setPropertyCharges(updated);
                          }}>
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
                        <div className="flex items-end">
                          <Button variant="ghost" size="icon" onClick={() => removeChargeField(i)} className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-9 w-9">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-[10px]">Próxima Data de Pagamento</Label>
                        <Input type="date" value={c.nextDueDate || ''} onChange={e => {
                          const updated = [...propertyCharges];
                          updated[i].nextDueDate = e.target.value;
                          setPropertyCharges(updated);
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="archive" className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-neutral-400 gap-2">
                    <ImageIcon size={32} />
                    <p className="text-xs font-medium">Imagens do Imóvel</p>
                    <Button variant="ghost" size="sm" className="text-[10px]">Upload</Button>
                  </div>
                  <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-neutral-400 gap-2">
                    <FileText size={32} />
                    <p className="text-xs font-medium">Documentos Legais</p>
                    <Button variant="ghost" size="sm" className="text-[10px]">Upload</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button onClick={handleSaveProperty} className="w-full bg-[#1E293B] rounded-xl h-11">
                {editingProperty ? 'Atualizar Imóvel' : 'Guardar Imóvel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
              <Building2 size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 tracking-wider uppercase">PORTFÓLIO</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">{properties.length} / {units.length}</h3>
              <p className="text-[10px] text-neutral-400 mt-1">Imóveis / Unidades</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
              <Home size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 tracking-wider uppercase">RENDIMENTO BRUTO</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">
                {contracts.filter(c => c.status === 'Active').reduce((acc, c) => acc + c.rentAmount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </h3>
              <p className="text-[10px] text-neutral-400 mt-1">Soma de todas as rendas ativas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 tracking-wider uppercase">ENCARGOS MENSAIS</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">
                {charges.filter(c => c.frequency === 'Mensal').reduce((acc, c) => acc + c.amount, 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </h3>
              <p className="text-[10px] text-neutral-400 mt-1">Custos fixos do senhorio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow className="border-neutral-100 hover:bg-transparent">
                <TableHead className="w-[40px] px-6 py-4"></TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">IMÓVEL</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">UNIDADE(S)</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">ENCARGOS MENS.</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">REND. BRUTO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4">REND. LÍQUIDO</TableHead>
                <TableHead className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-6 py-4 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-neutral-400">
                    Nenhum imóvel registado.
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => {
                  const propUnits = units.filter(u => u.propertyId === property.id);
                  const propCharges = charges.filter(c => c.propertyId === property.id && c.frequency === 'Mensal');
                  const propContracts = contracts.filter(c => c.propertyId === property.id && c.status === 'Active');
                  
                  const monthlyCharge = propCharges.reduce((acc, c) => acc + c.amount, 0);
                  const grossRevenue = propContracts.reduce((acc, c) => acc + c.rentAmount, 0);
                  const netRevenue = grossRevenue - monthlyCharge;

                  return (
                    <TableRow key={property.id} className="border-neutral-50 hover:bg-neutral-50/30 transition-colors group">
                      <TableCell className="px-6 py-4">
                        <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-500">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B]">{property.name}</p>
                            <p className="text-[11px] text-neutral-400">{property.type} • {property.typology}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {propUnits.length > 0 ? propUnits.map(u => (
                            <Badge key={u.id} variant="secondary" className="bg-neutral-100 text-neutral-600 border-none text-[10px] px-2">
                              {u.name}
                            </Badge>
                          )) : <span className="text-[10px] text-neutral-400 italic">Sem unidades</span>}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-sm font-medium text-rose-500">{monthlyCharge}€</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-sm font-bold text-[#1E293B]">{grossRevenue}€</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-sm font-bold text-emerald-600">{netRevenue}€</p>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingProperty(property);
                            setNewProperty(property);
                            setPropertyUnits(propUnits);
                            setPropertyCharges(charges.filter(c => c.propertyId === property.id));
                            setIsAddDialogOpen(true);
                          }} className="text-neutral-300 hover:text-[#1E293B] hover:bg-neutral-100 rounded-lg"><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProperty(property.id)} className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></Button>
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
