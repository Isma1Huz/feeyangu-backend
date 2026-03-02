import React, { createContext, useContext } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => true,
  logout: () => {},
  switchRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const login = async (_email: string, _password: string): Promise<boolean> => true;
  const logout = () => { window.location.href = '/logout'; };
  const switchRole = (_role: UserRole) => {};

  // User data is accessed from usePage props in individual components
  return (
    <AuthContext.Provider value={{ user: null, isAuthenticated: false, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
