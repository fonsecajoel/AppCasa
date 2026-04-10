import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
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
  Sparkles,
  PiggyBank,
  Wrench
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    signInAnonymously(auth).then(() => setReady(true)).catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

