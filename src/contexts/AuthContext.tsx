import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'immoflow_user';

async function authViaServer(email: string, password: string, name?: string): Promise<AppUser> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro de autenticação.');
  return {
    uid: data.uid,
    email,
    displayName: name || data.displayName || email.split('@')[0],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  const persist = (u: AppUser | null) => {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
    setUser(u);
  };

  const loginWithEmail = async (email: string, password: string) => {
    const u = await authViaServer(email, password);
    persist(u);
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    const u = await authViaServer(email, password, name);
    persist(u);
  };

  const login = async () => {
    throw new Error('Google login não suportado neste ambiente.');
  };

  const resetPassword = async (_email: string) => {
    throw new Error('Reset de palavra-passe não suportado neste ambiente.');
  };

  const logout = async () => {
    persist(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, registerWithEmail, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
