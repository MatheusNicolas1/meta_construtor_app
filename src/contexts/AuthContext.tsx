import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';

// Definição de tipos para o contexto de autenticação
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
};

// Criação do contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component que envolverá a aplicação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Obter a sessão atual
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escutar por mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Atualizar a sessão do usuário
  const refreshSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao atualizar sessão:', error);
        return;
      }

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
    }
  };

  // Registrar usuário
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        throw error;
      }

      // Criar o perfil se o usuário foi criado com sucesso
      if (data.user) {
        // Cria o perfil com os dados iniciais
        await profileService.createProfile({
          id: data.user.id,
          name: name,
          email: data.user.email || '',
          created_at: new Date().toISOString()
        });

        // Configure um período de teste de 15 dias para o plano básico (ID 1)
        await profileService.setTrialPeriod(data.user.id, '1', 15);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Login de usuário
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Verificar se o perfil existe e criá-lo se não existir
      if (data.user) {
        const profileExists = await profileService.profileExists(data.user.id);
        
        if (!profileExists) {
          // Cria o perfil caso não exista
          await profileService.createProfile({
            id: data.user.id,
            name: data.user.user_metadata?.name || 'Usuário',
            email: data.user.email || '',
            created_at: new Date().toISOString()
          });

          // Configure um período de teste de 15 dias para o plano básico (ID 1)
          await profileService.setTrialPeriod(data.user.id, '1', 15);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Logout de usuário
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Valor do contexto
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para facilitar o uso do contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 