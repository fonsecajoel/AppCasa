import React, { createContext, useContext } from 'react';

interface AppUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: AppUser;
  loading: false;
}

const DEFAULT_USER: AppUser = {
  uid: 'owner',
  email: 'admin@immoflow.pt',
  displayName: 'Admin',
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  loading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: DEFAULT_USER, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
