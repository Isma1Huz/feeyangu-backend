import React, { createContext, useContext, useState, useCallback } from 'react'; 
import type { User, UserRole } from '@/types';
import { MOCK_USERS } from '@/lib/mock-data';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (_email: string, _password: string): Promise<boolean> => {
    const roleKey = _email.includes('admin@feeyangu') ? 'admin'
      : _email.includes('accountant') ? 'accountant'
      : _email.includes('school') || _email.includes('academy') ? 'school'
      : 'parent';
    setUser(MOCK_USERS[roleKey] || MOCK_USERS.school);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const roleMap: Record<UserRole, string> = {
      super_admin: 'admin',
      school_admin: 'school',
      parent: 'parent',
      accountant: 'accountant',
    };
    setUser(MOCK_USERS[roleMap[role]]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
