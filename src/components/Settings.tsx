import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Moon,
  ChevronRight,
  LogOut,
  Camera
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function Settings() {
  const sections = [
    { id: 'profile', label: 'Perfil do Utilizador', icon: User, description: 'Gerir informações pessoais e avatar.' },
    { id: 'notifications', label: 'Notificações', icon: Bell, description: 'Configurar alertas de rendas e despesas.' },
    { id: 'security', label: 'Segurança', icon: Shield, description: 'Palavra-passe e autenticação de dois fatores.' },
    { id: 'billing', label: 'Faturação', icon: CreditCard, description: 'Gerir plano e métodos de pagamento.' },
    { id: 'language', label: 'Idioma e Região', icon: Globe, description: 'Português (Portugal), Moeda: EUR.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1E293B]">Definições</h2>
        <p className="text-neutral-500">Personalize a sua experiência e gira a sua conta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-8 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-24 w-24 border-4 border-neutral-50 shadow-sm">
                  <AvatarImage src={''} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-50 text-blue-600">
                    {''}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md bg-white hover:bg-neutral-50 border border-neutral-100">
                  <Camera size={14} className="text-[#1E293B]" />
                </Button>
              </div>
              <h3 className="text-xl font-bold text-[#1E293B]"></h3>
              <p className="text-sm text-neutral-500 mb-6"></p>
              <Badge className="bg-blue-50 text-blue-600 border-none rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-6">PLANO PREMIUM</Badge>
              <Button variant="outline" className="w-full rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-50">
                <LogOut size={16} className="mr-2" />
                Terminar Sessão
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <h4 className="font-bold text-[#1E293B] mb-4">Preferências Rápidas</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600">
                      <Moon size={16} />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Modo Escuro</span>
                  </div>
                  <div className="w-10 h-5 bg-neutral-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600">
                      <Bell size={16} />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Notificações Push</span>
                  </div>
                  <div className="w-10 h-5 bg-[#1E293B] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-50">
                {sections.map((section) => (
                  <div key={section.id} className="p-6 flex items-center justify-between hover:bg-neutral-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-neutral-50 text-neutral-400 group-hover:bg-white group-hover:text-[#1E293B] group-hover:shadow-sm transition-all duration-300">
                        <section.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E293B]">{section.label}</h4>
                        <p className="text-xs text-neutral-400">{section.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-neutral-300 group-hover:text-[#1E293B] transition-colors" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" className="rounded-xl px-6 text-neutral-400 hover:text-neutral-600">Cancelar</Button>
            <Button className="bg-[#1E293B] hover:bg-[#334155] rounded-xl px-8 shadow-lg shadow-neutral-200">Guardar Alterações</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
