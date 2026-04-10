import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { 
  Sparkles, 
  FileText, 
  Megaphone, 
  MessageSquare,
  Loader2,
  Send
} from 'lucide-react';
import { 
  generatePropertyAd, 
  generateMonthlyReport, 
  generateCollectionNotice 
} from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function AIAssistant() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const pSnap = await getDocs(query(collection(db, 'properties'), where('ownerId', '==', user.uid)));
      const tSnap = await getDocs(query(collection(db, 'tenants'), where('ownerId', '==', user.uid)));
      setProperties(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTenants(tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [user]);

  const handleGenerateAd = async () => {
    if (properties.length === 0) {
      toast.error('Adicione primeiro um imóvel.');
      return;
    }
    setLoading(true);
    try {
      const res = await generatePropertyAd(properties[0]);
      setResult(res || 'Erro ao gerar anúncio.');
    } catch (err) {
      toast.error('Erro ao chamar IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Fetch some mock/real data for the report
      const paySnap = await getDocs(query(collection(db, 'payments'), where('ownerId', '==', user?.uid)));
      const expSnap = await getDocs(query(collection(db, 'expenses'), where('ownerId', '==', user?.uid)));
      
      const res = await generateMonthlyReport({
        properties,
        payments: paySnap.docs.map(d => d.data()),
        expenses: expSnap.docs.map(d => d.data())
      });
      setResult(res || 'Erro ao gerar relatório.');
    } catch (err) {
      toast.error('Erro ao chamar IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNotice = async () => {
    if (tenants.length === 0) {
      toast.error('Adicione primeiro um inquilino.');
      return;
    }
    setLoading(true);
    try {
      const res = await generateCollectionNotice(tenants[0], { amount: 500, date: '01/04/2026' });
      setResult(res || 'Erro ao gerar notificação.');
    } catch (err) {
      toast.error('Erro ao chamar IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Assistente IA</h2>
          <p className="text-neutral-500">Automatize conteúdos e comunicações com IA.</p>
        </div>
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Sparkles size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors border-neutral-200 shadow-sm"
            onClick={handleGenerateReport}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Relatório Mensal</h4>
                <p className="text-xs text-neutral-500">Resumo de rendimentos e despesas.</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors border-neutral-200 shadow-sm"
            onClick={handleGenerateAd}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Megaphone size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Anúncio de Imóvel</h4>
                <p className="text-xs text-neutral-500">Descrição atrativa para marketing.</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors border-neutral-200 shadow-sm"
            onClick={handleGenerateNotice}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900">Aviso de Cobrança</h4>
                <p className="text-xs text-neutral-500">Mensagem cordial para rendas em atraso.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[600px] border-none shadow-sm bg-white flex flex-col">
            <CardHeader className="border-bottom border-neutral-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Resultado da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-6">
                {result ? (
                  <div className="prose prose-neutral max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                    <Sparkles size={48} className="opacity-20" />
                    <p>Selecione uma tarefa à esquerda para gerar conteúdo.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
