import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Componente que gerencia o redirecionamento da rota raiz baseado no status de autenticação
 * - Se autenticado: redireciona para /dashboard
 * - Se não autenticado: redireciona para /home
 * Verifica sessão diretamente do Supabase para garantir precisão
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [sessionExists, setSessionExists] = useState(false);

  // Verificar sessão diretamente do Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar se há tokens na URL (callback do OAuth)
        const { data: { session: urlSession } } = await supabase.auth.getSessionFromUrl();
        if (urlSession) {
          console.log('🔗 RootRedirect - Sessão encontrada na URL, processando...');
          setSessionExists(true);
          setHasCheckedSession(true);
          return;
        }

        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 RootRedirect - Verificação de sessão:', session?.user?.email || 'Nenhuma sessão');
        
        setSessionExists(!!session?.user);
        setHasCheckedSession(true);
      } catch (error) {
        console.error('❌ RootRedirect - Erro na verificação de sessão:', error);
        setSessionExists(false);
        setHasCheckedSession(true);
      }
    };

    if (!isLoading) {
      checkSession();
    }
  }, [isLoading]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading || !hasCheckedSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar baseado no status de autenticação
  if (isAuthenticated || sessionExists) {
    console.log('✅ RootRedirect - Usuário autenticado, redirecionando para /dashboard');
    return <Navigate to="/dashboard" replace />;
  } else {
    console.log('🏠 RootRedirect - Usuário não autenticado, redirecionando para /home');
    return <Navigate to="/home" replace />;
  }
};

export default RootRedirect;
