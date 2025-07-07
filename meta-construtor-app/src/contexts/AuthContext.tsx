
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseUtils } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatar_url?: string;
  cargo?: string;
  empresa?: string;
  telefone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error?: string }>;
  hasPermission: (permission: string) => boolean;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão inicial:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Buscar perfil do usuário na tabela profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Perfil não existe, criar um
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: supabaseUser.id,
            nome: supabaseUser.user_metadata?.nome || supabaseUser.email?.split('@')[0] || 'Usuário',
            cargo: 'Colaborador',
            empresa: 'MetaConstrutor',
          }])
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          return;
        }

        profile.data = newProfile;
      } else if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      // Definir role baseado no cargo ou email
      let role = 'worker'; // padrão
      if (profile?.cargo) {
        const cargo = profile.cargo.toLowerCase();
        if (cargo.includes('admin') || cargo.includes('diretor')) {
          role = 'admin';
        } else if (cargo.includes('gerente') || cargo.includes('coordenador')) {
          role = 'manager';
        } else if (cargo.includes('supervisor') || cargo.includes('mestre')) {
          role = 'supervisor';
        }
      }

      // Verificar se é email de admin
      if (supabaseUser.email?.includes('@metaconstrutor.com') || 
          supabaseUser.email?.includes('admin@')) {
        role = 'admin';
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.nome || supabaseUser.user_metadata?.nome || 'Usuário',
        role,
        avatar_url: profile?.avatar_url,
        cargo: profile?.cargo,
        empresa: profile?.empresa,
        telefone: profile?.telefone,
      });

    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }

      return {};
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro interno do sistema' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData?: any): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: userData?.nome || email.split('@')[0],
            cargo: userData?.cargo || 'Colaborador',
            empresa: userData?.empresa || 'MetaConstrutor',
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      // Se o usuário foi criado e confirmado automaticamente
      if (data.user && !data.user.email_confirmed_at) {
        return { 
          error: 'Verifique seu email para confirmar a conta antes de fazer login.' 
        };
      }

      return {};
    } catch (error) {
      console.error('Erro no signup:', error);
      return { error: 'Erro interno do sistema' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error?: string }> => {
    try {
      if (!user) return { error: 'Usuário não autenticado' };

      const { error } = await supabase
        .from('profiles')
        .update({
          nome: updates.name,
          cargo: updates.cargo,
          empresa: updates.empresa,
          telefone: updates.telefone,
          avatar_url: updates.avatar_url,
        })
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Atualizar estado local
      setUser(prev => prev ? { ...prev, ...updates } : null);

      return {};
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { error: 'Erro interno do sistema' };
    }
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
        'reports.view', 'reports.create'
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

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      signup,
      hasPermission,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
