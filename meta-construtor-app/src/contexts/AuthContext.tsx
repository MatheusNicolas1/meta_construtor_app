
import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Administrador',
    email: 'admin@metaconstrutor.com',
    role: 'admin'
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simular login
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'Administrador',
        email: email,
        role: 'admin'
      });
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Definir permissões por role - mais permissivas
    const permissions: Record<string, string[]> = {
      admin: ['*'], // todas as permissões
      manager: [
        'dashboard.view',
        'obras.view', 'obras.edit', 'obras.create',
        'teams.view', 'teams.edit', 'teams.create', 'teams.presence',
        'activities.view', 'activities.edit', 'activities.create',
        'equipment.view', 'equipment.edit',
        'rdo.view', 'rdo.edit', 'rdo.create',
        'reports.view'
      ],
      supervisor: [
        'dashboard.view',
        'obras.view',
        'teams.view', 'teams.edit', 'teams.presence',
        'activities.view', 'activities.edit',
        'equipment.view',
        'rdo.view', 'rdo.edit', 'rdo.create'
      ],
      worker: [
        'dashboard.view',
        'teams.view',
        'rdo.view', 'rdo.create',
        'activities.view'
      ]
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
