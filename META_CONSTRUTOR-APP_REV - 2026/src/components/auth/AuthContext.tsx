import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User as AuthUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { User, UserRole } from "@/types/user";
import { toast } from "sonner";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  roles: UserRole[];
  attributes: Record<string, any>;
  mfaEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  refreshSession: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário e roles
  const loadUserData = useCallback(async (authUser: AuthUser) => {
    try {
      // Buscar perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) throw profileError;

      // Buscar roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id);

      if (rolesError) throw rolesError;

      const rolesList = (userRoles || []).map((r: any) => r.role as UserRole);

      setUser({
        id: authUser.id,
        name: profile?.name || authUser.email || "Usuário",
        email: authUser.email || "",
        role: rolesList[0] || "Colaborador",
        createdAt: authUser.created_at,
        updatedAt: profile?.updated_at || authUser.created_at,
      });

      setRoles(rolesList.length > 0 ? rolesList : ["Colaborador"]);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setUser(null);
      setRoles([]);
    }
  }, []);

  // Configurar listener de autenticação
  useEffect(() => {
    // Listener para mudanças de autenticação (deve ser síncrono)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        // Evitar deadlock: chamar Supabase fora do callback, de forma assíncrona
        setTimeout(() => {
          loadUserData(newSession.user).catch((error) => {
            console.error("Erro ao carregar dados do usuário no onAuthStateChange:", error);
          });
        }, 0);
      } else {
        setUser(null);
        setRoles([]);
      }

      setLoading(false);
    });

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        loadUserData(existingSession.user).catch((error) => {
          console.error("Erro ao carregar dados do usuário na sessão existente:", error);
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = useCallback(async (emailOrPhone: string, password: string) => {
    try {
      let email = emailOrPhone;
      
      // Se não parece ser email, buscar email pelo telefone
      if (!emailOrPhone.includes('@')) {
        const cleanPhone = emailOrPhone.replace(/\D/g, '');
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', cleanPhone)
          .maybeSingle();
        
        if (profileError || !profile) {
          toast.error("Telefone não encontrado. Verifique e tente novamente.");
          throw new Error("Telefone não cadastrado");
        }
        
        email = profile.email;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error("E-mail/telefone ou senha inválidos. Verifique suas credenciais e tente novamente.");
        } else {
          toast.error("Erro ao fazer login. Tente novamente.");
        }
        throw error;
      }

      if (data.session) {
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }, [navigate]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setRoles([]);
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  }, [navigate]);

  const hasRole = useCallback((role: UserRole) => {
    return roles.includes(role);
  }, [roles]);

  const hasAnyRole = useCallback((rolesList: UserRole[]) => {
    return rolesList.some(role => roles.includes(role));
  }, [roles]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        if (data.user) {
          await loadUserData(data.user);
        }
        toast.success("Sessão renovada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao renovar sessão:", error);
      toast.error("Sessão expirada. Faça login novamente.");
      navigate("/login");
    }
  }, [loadUserData, navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: !!session,
    user,
    session,
    roles,
    attributes: {},
    mfaEnabled: false,
    signIn,
    signOut,
    hasRole,
    hasAnyRole,
    refreshSession,
    loading,
  }), [session, user, roles, signIn, signOut, hasRole, hasAnyRole, refreshSession, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
};