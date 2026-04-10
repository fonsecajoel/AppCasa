import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare,
  Plus
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { MaintenanceTicket, Property } from '../types';
import { toast } from 'sonner';

export default function Maintenance() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<Partial<MaintenanceTicket>>({
    propertyId: '',
    description: '',
    priority: 'Medium',
    status: 'Open'
  });

  useEffect(() => {
    if (!user) return;
    const qTickets = query(collection(db, 'maintenanceTickets'), where('ownerId', '==', user.uid));
    const qProperties = query(collection(db, 'properties'), where('ownerId', '==', user.uid));

    const unsubTickets = onSnapshot(qTickets, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTicket)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'maintenanceTickets'));

    const unsubProperties = onSnapshot(qProperties, (snapshot) => {
      setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'properties'));

    return () => {
      unsubTickets();
      unsubProperties();
    };
  }, [user]);

  const handleSaveTicket = async () => {
    if (!user || !newTicket.propertyId || !newTicket.description) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      await addDoc(collection(db, 'maintenanceTickets'), {
        ...newTicket,
        ownerId: user.uid,
        createdAt: new Date().toISOString()
      });
      toast.success('Ticket de manutenção criado!');
      setIsAddDialogOpen(false);
      setNewTicket({ propertyId: '', description: '', priority: 'Medium', status: 'Open' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'maintenanceTickets');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'Open' | 'In-Progress' | 'Closed') => {
    try {
      await updateDoc(doc(db, 'maintenanceTickets', id), { status });
      toast.success(`Estado atualizado para ${status}`);
    } catch (err) {
      toast.error('Erro ao atualizar estado.');
      handleFirestoreError(err, OperationType.UPDATE, 'maintenanceTickets');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Manutenção</h2>
          <p className="text-neutral-500">Gere pedidos de reparação e tickets.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={
            <Button className="gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-xl px-6 h-11 shadow-lg shadow-neutral-200">
              <Plus size={18} />Novo Ticket
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>Novo Ticket de Manutenção</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Imóvel</Label>
                <Select value={newTicket.propertyId || ''} onValueChange={v => setNewTicket({...newTicket, propertyId: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o imóvel" /></SelectTrigger>
                  <SelectContent>
                    {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select value={newTicket.priority || 'Medium'} onValueChange={(v: any) => setNewTicket({...newTicket, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Baixa</SelectItem>
                    <SelectItem value="Medium">Média</SelectItem>
                    <SelectItem value="High">Alta</SelectItem>
                    <SelectItem value="Urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Descrição do Problema</Label>
                <Textarea 
                  value={newTicket.description || ''} 
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  placeholder="Descreva o problema detalhadamente..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveTicket} className="w-full bg-[#1E293B] rounded-xl h-11">
                Criar Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-neutral-300 text-neutral-500">
            <Wrench size={48} className="mb-4 opacity-20" />
            <p>Nenhum ticket de manutenção em aberto.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                      {ticket.priority}
                    </Badge>
                    <span className="text-xs text-neutral-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">
                      {properties.find(p => p.id === ticket.propertyId)?.name || 'Imóvel'}
                    </h4>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Clock size={14} />
                      {ticket.status}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <MessageSquare size={14} />
                      2 Comentários
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 p-3 flex gap-2">
                  {ticket.status === 'Open' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-white"
                      onClick={() => handleUpdateStatus(ticket.id, 'In-Progress')}
                    >
                      Iniciar
                    </Button>
                  )}
                  {ticket.status === 'In-Progress' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-white text-emerald-600"
                      onClick={() => handleUpdateStatus(ticket.id, 'Closed')}
                    >
                      Concluir
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="flex-1">
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
