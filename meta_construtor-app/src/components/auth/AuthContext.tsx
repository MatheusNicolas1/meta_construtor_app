import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User, UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import type { AuthError, Session, User as SupabaseUser } from "@supabase/supabase-js";
import { getRedirectUrl, AUTH_CONFIG } from "@/config/auth";
import { useMobileDetection } from "@/hooks/useMobileDetection";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  roles: UserRole[];
  attributes: Record<string, any>;
  mfaEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  refreshSession: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const isMobile = useMobileDetection();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const isAuthenticated = !!session?.user;
  const roles = ["Administrador"] as UserRole[]; // Default role
  const attributes = {};
  const mfaEnabled = false;

  // Função para converter SupabaseUser para User
  const convertSupabaseUserToUser = useCallback((supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email || '',
      role: "Administrador" as UserRole, // Default role
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
    };
  }, []);

  // Função para inicializar a sessão
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Aguardar um pouco para garantir que o cliente esteja pronto (especialmente em mobile)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verificar sessão atual
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erro ao obter sessão:', error);
        setSession(null);
        setUser(null);
        return;
      }
      
      if (currentSession?.user) {
        console.log('✅ Sessão encontrada:', currentSession.user.email);
        setSession(currentSession);
        setUser(convertSupabaseUserToUser(currentSession.user));
      } else {
        console.log('ℹ️ Nenhuma sessão encontrada');
        // Limpar estado se não há sessão
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar autenticação:', error);
      // Em caso de erro, limpar estado
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [convertSupabaseUserToUser]);

  // Inicializar autenticação ao montar o componente
  useEffect(() => {
    initializeAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setSession(session);
          setUser(convertSupabaseUserToUser(session.user));
          
          // Redirecionar para dashboard após login bem-sucedido
          if (event === 'SIGNED_IN') {
            console.log('✅ Usuário autenticado, redirecionando para dashboard');
            // Verificar se não está já na página de dashboard
            if (window.location.pathname !== '/dashboard') {
              // Aguardar um pouco mais em mobile para garantir que a sessão esteja persistida
              const delay = isMobile ? 1000 : 500;
              setTimeout(() => {
                console.log('🚀 Executando redirecionamento para /dashboard');
                // Usar navigate com replace para evitar histórico indesejado
                navigate('/dashboard', { replace: true });
              }, delay);
            }
          }
        } else {
          console.log('🚪 Sessão removida, limpando estado');
          setSession(null);
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [initializeAuth, convertSupabaseUserToUser, navigate]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        console.log('✅ Login realizado com sucesso');
        // O redirecionamento será feito pelo onAuthStateChange
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const redirectUrl = getRedirectUrl();
      console.log('🔐 Google Login - Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: AUTH_CONFIG.GOOGLE_OAUTH
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('✅ Google Login - Redirecionamento iniciado');
    } catch (error) {
      console.error('❌ Erro no login com Google:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Logout realizado com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const hasRole = useCallback((role: UserRole) => {
    return roles.includes(role);
  }, [roles]);

  const hasAnyRole = useCallback((requiredRoles: UserRole[]) => {
    return requiredRoles.some(role => roles.includes(role));
  }, [roles]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        setSession(data.session);
        if (data.session.user) {
          setUser(convertSupabaseUserToUser(data.session.user));
        }
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      throw error;
    }
  }, [convertSupabaseUserToUser]);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    user,
    roles,
    attributes,
    mfaEnabled,
    signIn,
    signInWithGoogle,
    signOut,
    hasRole,
    hasAnyRole,
    refreshSession,
    isLoading,
  }), [isAuthenticated, user, roles, attributes, mfaEnabled, signIn, signInWithGoogle, signOut, hasRole, hasAnyRole, refreshSession, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};