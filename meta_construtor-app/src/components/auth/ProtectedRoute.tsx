import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "@/types/user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = [], 
  requiredPermissions = [] 
}) => {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('❌ Usuário não autenticado, redirecionando para login');
        navigate('/login', { replace: true });
        return;
      }

      if (roles.length > 0 && !hasAnyRole(roles)) {
        console.log('❌ Usuário não tem permissão, redirecionando para dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }

      console.log('✅ ProtectedRoute - Acesso autorizado');
    }
  }, [isAuthenticated, isLoading, user, roles, requiredPermissions, hasAnyRole, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Não renderizar nada se não estiver autenticado (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar roles se especificados
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;