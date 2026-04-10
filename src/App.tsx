import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Wallet, 
  Receipt,
  Droplets,
  ArrowLeftRight,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  PiggyBank,
  Wrench
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import Dashboard from './components/Dashboard';
import PropertyManager from './components/PropertyManager';
import TenantManager from './components/TenantManager';
import Financials from './components/Financials';
import Maintenance from './components/Maintenance';
import AIAssistant from './components/AIAssistant';
import Expenses from './components/Expenses';
import LandlordExpenses from './components/LandlordExpenses';
import Contracts from './components/Contracts';
import Receipts from './components/Receipts';
import Movements from './components/Movements';
import Settings from './components/Settings';

function AppContent() {
  const { user, loading, login, loginWithCredentials, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await loginWithCredentials(username, password);
    } catch (err) {
      // Error handled in context or here
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900">ImmoFlow</h1>
            <p className="text-neutral-500">Gestão inteligente de propriedades simplificada.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 space-y-6">
            <form onSubmit={handleCredentialLogin} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Utilizador</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full h-12 px-4 bg-neutral-50 border-none rounded-xl focus:ring-2 focus:ring-neutral-200 outline-none transition-all"
                  placeholder="admin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Palavra-passe</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-neutral-50 border-none rounded-xl focus:ring-2 focus:ring-neutral-200 outline-none transition-all"
                  placeholder="••••••"
                />
              </div>
              <Button type="submit" disabled={isLoggingIn} className="w-full h-12 bg-[#1E293B] hover:bg-[#334155] rounded-xl text-lg font-bold shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]">
                {isLoggingIn ? 'A entrar...' : 'Entrar'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-neutral-400 font-bold">ou</span></div>
            </div>

            <Button onClick={login} variant="outline" className="w-full h-12 border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600 font-bold transition-all">
              Entrar com Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'properties', label: 'IMÓVEIS', icon: Building2 },
    { id: 'tenants', label: 'INQUILINOS', icon: Users },
    { id: 'contracts', label: 'CONTRATOS', icon: FileText },
    { id: 'payments', label: 'PAGAMENTOS', icon: Wallet },
    { id: 'receipts', label: 'RECIBOS', icon: Receipt },
    { id: 'expenses', label: 'DESPESAS', icon: Droplets },
    { id: 'landlord-expenses', label: 'ENCARGOS', icon: PiggyBank },
    { id: 'movements', label: 'MOVIMENTOS', icon: ArrowLeftRight },
    { id: 'maintenance', label: 'MANUTENÇÃO', icon: Wrench },
    { id: 'ai', label: 'IA', icon: Sparkles },
    { id: 'settings', label: 'DEFINIÇÕES', icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Top Header with User Profile */}
      <header className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1E293B] rounded-lg flex items-center justify-center text-white font-black text-xs">IF</div>
          <span className="text-xl font-black tracking-tighter text-[#1E293B]">IMMOFLOW</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#1E293B]">{user.displayName || 'Joel Fonseca'}</p>
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Proprietário</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-neutral-50 shadow-sm">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{user.displayName?.charAt(0) || 'J'}</AvatarFallback>
            </Avatar>
            <div className="h-8 w-px bg-neutral-100 mx-1" />
            <Button variant="ghost" size="icon" onClick={logout} className="text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24">
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'properties' && <PropertyManager />}
          {activeTab === 'tenants' && <TenantManager />}
          {activeTab === 'payments' && <Financials />}
          {activeTab === 'expenses' && <Expenses />}
          {activeTab === 'landlord-expenses' && <LandlordExpenses />}
          {activeTab === 'contracts' && <Contracts />}
          {activeTab === 'receipts' && <Receipts />}
          {activeTab === 'movements' && <Movements />}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'maintenance' && <Maintenance />}
          {activeTab === 'ai' && <AIAssistant />}
        </div>
      </main>


      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 flex justify-center items-center z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[72px] px-2 py-1.5 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-[#F1F5F9] text-[#1E293B]' 
                  : 'text-[#64748B] hover:bg-neutral-50'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
              <span className={`text-[9px] mt-1 font-bold tracking-wider ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="w-1 h-1 bg-[#1E293B] rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </nav>
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

