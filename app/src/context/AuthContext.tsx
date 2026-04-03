import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUser: User = {
  id: 0,
  email: 'demo@civichub.app',
  first_name: 'Demo',
  last_name: 'User',
  is_active: true,
  created_at: new Date().toISOString(),
  roles: [
    {
      id: 0,
      name: 'student',
      description: 'Demo access role',
    },
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(demoUser);
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    void email;
    void password;
    setUser(demoUser);
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    void email;
    void password;
    void firstName;
    void lastName;
    setUser(demoUser);
  };

  const logout = () => {
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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

export default AuthContext;
