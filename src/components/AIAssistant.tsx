import { useState, useEffect } from 'react';
import { fetchCollection } from '../services/api';
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [props, tns] = await Promise.all([
        fetchCollection('properties'),
        fetchCollection('tenants')
      ]);
      setProperties(props);
      setTenants(tns);
    };
    fetchData();
  }, []);

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
      const [payments, expenses] = await Promise.all([
        fetchCollection('payments'),
        fetchCollection('expenses')
      ]);
      
      const res = await generateMonthlyReport({
        properties,
        payments,
        expenses
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
