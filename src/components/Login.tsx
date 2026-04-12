import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { LogIn, UserPlus, KeyRound, Mail, Zap } from 'lucide-react';

const QUICK_EMAIL = 'admin@immoflow.pt';
const QUICK_PASS = 'admin123';
const QUICK_NAME = 'Admin';

export default function Login() {
  const { login, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handleQuickAccess = async () => {
    setLoading(true);
    try {
      await loginWithEmail(QUICK_EMAIL, QUICK_PASS);
      toast.success('Bem-vindo, Admin!');
    } catch {
      try {
        await registerWithEmail(QUICK_EMAIL, QUICK_PASS, QUICK_NAME);
        toast.success('Conta admin criada e sessão iniciada!');
      } catch (regErr: any) {
        toast.error('Erro no acesso rápido: ' + regErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Preencha todos os campos');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Bem-vindo de volta!');
    } catch (error: any) {
      toast.error('Erro ao entrar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return toast.error('Preencha todos os campos');
    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar conta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return toast.error('Introduza o seu email');
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success('Email de recuperação enviado!');
      setShowReset(false);
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-lg border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Recuperar Palavra-passe</CardTitle>
            <CardDescription className="text-center">
              Introduza o seu email para receber instruções de recuperação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <Input 
                    id="reset-email" 
                    type="email" 
                    placeholder="exemplo@email.com" 
                    className="pl-10 rounded-xl"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#1E293B] rounded-xl h-11" disabled={loading}>
                {loading ? 'A enviar...' : 'Enviar Instruções'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-neutral-500" onClick={() => setShowReset(false)}>
              Voltar ao Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1E293B] rounded-2xl text-white font-black text-2xl mb-4 shadow-xl shadow-neutral-200">
            IF
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#1E293B]">IMMOFLOW</h1>
          <p className="text-neutral-500 font-medium">Gestão inteligente de propriedades simplificada.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-neutral-100 mb-6">
            <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Registar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
                <CardDescription>Introduza as suas credenciais para aceder à sua conta.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="exemplo@email.com" 
                        className="pl-10 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Palavra-passe</Label>
                      <button 
                        type="button"
                        onClick={() => setShowReset(true)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Esqueceu-se?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#1E293B] rounded-xl h-11 gap-2" disabled={loading}>
                    {loading ? 'A entrar...' : <><LogIn size={18} /> Entrar</>}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl h-11 gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800" 
                  onClick={handleQuickAccess}
                  disabled={loading}
                >
                  <Zap size={18} />
                  {loading ? 'A entrar...' : 'Acesso Rápido (Admin)'}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-100" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-neutral-400">Ou continue com</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-11 gap-2" onClick={login}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Criar conta</CardTitle>
                <CardDescription>Comece a gerir as suas propriedades hoje mesmo.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nome Completo</Label>
                    <Input 
                      id="reg-name" 
                      placeholder="Joel Fonseca" 
                      className="rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder="exemplo@email.com" 
                      className="rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Palavra-passe</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#1E293B] rounded-xl h-11 gap-2" disabled={loading}>
                    {loading ? 'A criar...' : <><UserPlus size={18} /> Criar Conta</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
