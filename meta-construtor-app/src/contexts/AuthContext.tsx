
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseUtils, type Profile, type Empresa } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  empresa: Empresa | null;
  session: Session | null;
  loading: boolean;
  canViewFinancialData: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData: {
    nome: string;
    cargo?: string;
    telefone?: string;
  }) => Promise<{ error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>;
  updatePassword: (password: string) => Promise<{ error?: any }>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  checkPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isDirector: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [canViewFinancialData, setCanViewFinancialData] = useState(false);

  // Carregar dados iniciais do usuário
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Erro ao obter sessão:', error);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              await loadUserData(session.user.id);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão inicial:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserData(session.user.id);
          } else {
            setProfile(null);
            setEmpresa(null);
            setCanViewFinancialData(false);
          }
          
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Carregar dados do perfil e empresa do usuário
  async function loadUserData(userId: string) {
    try {
      // Carregar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError);
        return;
      }

      setProfile(profileData);

      // Carregar dados da empresa se o usuário tem empresa vinculada
      if (profileData?.empresa_id) {
        const { data: empresaData, error: empresaError } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', profileData.empresa_id)
          .single();

        if (empresaError) {
          console.error('Erro ao carregar empresa:', empresaError);
        } else {
          setEmpresa(empresaData);
        }
      }

      // Verificar permissões financeiras
      try {
        const canView = await supabaseUtils.canViewFinancialData();
        setCanViewFinancialData(canView);
      } catch (error) {
        console.error('Erro ao verificar permissões financeiras:', error);
        setCanViewFinancialData(false);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Dados serão carregados automaticamente pelo listener onAuthStateChange
      return { error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Função de cadastro
  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      nome: string;
      cargo?: string;
      telefone?: string;
    }
  ) => {
    try {
      setLoading(true);
      
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: userData.nome,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Se o usuário foi criado com sucesso, criar o perfil
      if (data.user) {
        // Buscar empresa padrão (primeira empresa ativa)
        const { data: empresaPadrao } = await supabase
          .from('empresas')
          .select('id')
          .eq('status', 'ativa')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        // Criar perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            nome: userData.nome,
            cargo: userData.cargo || 'colaborador',
            telefone: userData.telefone,
            empresa_id: empresaPadrao?.id || null,
            nivel_acesso: 'colaborador',
            status: 'ativo',
          }]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
    setUser(null);
        setProfile(null);
        setEmpresa(null);
        setSession(null);
        setCanViewFinancialData(false);
      }
      
      return { error };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil do usuário
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        
        // Recarregar permissões se o nível de acesso foi alterado
        if (updates.nivel_acesso) {
          const canView = await supabaseUtils.canViewFinancialData();
          setCanViewFinancialData(canView);
        }
      }

      return { error };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { error };
    }
  };

  // Atualizar senha
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { error };
    }
  };

  // Reset de senha
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { error };
    }
  };

  // Verificar permissão específica
  const checkPermission = (permission: string): boolean => {
    if (!profile) return false;

    // Verificar permissões no objeto JSON do perfil
    const permissions = profile.permissoes as any || {};
    
    // Permissões automáticas baseadas no nível de acesso
    const autoPermissions = {
      diretor: ['all'], // Diretores têm todas as permissões
      gerente: ['view_financial', 'manage_projects', 'manage_teams', 'view_reports'],
      colaborador: ['view_basic', 'create_rdo']
    };

    const userLevel = profile.nivel_acesso || 'colaborador';
    const levelPermissions = autoPermissions[userLevel] || [];

    // Verificar se tem a permissão específica ou 'all'
    return (
      levelPermissions.includes('all') ||
      levelPermissions.includes(permission) ||
      permissions[permission] === true
    );
  };

  // Verificar se é administrador (diretor)
  const isAdmin = (): boolean => {
    return profile?.nivel_acesso === 'diretor';
  };

  // Verificar se é gerente
  const isManager = (): boolean => {
    return profile?.nivel_acesso === 'gerente';
  };

  // Verificar se é diretor
  const isDirector = (): boolean => {
    return profile?.nivel_acesso === 'diretor';
  };

  const value: AuthContextType = {
    user,
    profile,
    empresa,
    session,
    loading,
    canViewFinancialData,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
    resetPassword,
    checkPermission,
    isAdmin,
    isManager,
    isDirector,
  };

  return (
    <AuthContext.Provider value={value}>
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

// Hook para verificar se o usuário tem uma permissão específica
export function usePermission(permission: string): boolean {
  const { checkPermission } = useAuth();
  return checkPermission(permission);
}

// Hook para verificar se pode visualizar dados financeiros
export function useCanViewFinancial(): boolean {
  const { canViewFinancialData } = useAuth();
  return canViewFinancialData;
}

// Hook para obter informações da empresa atual
export function useEmpresa(): Empresa | null {
  const { empresa } = useAuth();
  return empresa;
}
