import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import type { UserRole } from '@/types/user';
import { getUserPermissions } from '@/types/user';

export const usePermissions = () => {
  const { user, roles } = useAuth();
  
  const userRole = roles[0] || 'Colaborador';
  const basePermissions = getUserPermissions(userRole);

  const permissions = useMemo(() => ({
    canAccessRoute: (requiredRole?: UserRole) => {
      if (!requiredRole) return true;
      return roles.includes(requiredRole);
    },
    canPerformAction: (action: string) => {
      return basePermissions[action as keyof typeof basePermissions] || false;
    },
    allowedActions: Object.keys(basePermissions).filter(
      key => basePermissions[key as keyof typeof basePermissions]
    ),
    userRole,
  }), [roles, userRole, basePermissions]);

  const rdoPermissions = useMemo(() => ({
    canCreate: basePermissions.canCreateRDO,
    canEditOwn: basePermissions.canCreateRDO,
    canEditAny: basePermissions.canApproveRDO,
    canApprove: basePermissions.canApproveRDO,
    canExport: basePermissions.canExportRDO,
    canDelete: basePermissions.canDeleteRDO,
    canEdit: (rdoCreatorId: string) => {
      if (user?.id === rdoCreatorId) return true;
      return basePermissions.canApproveRDO;
    },
    canApproveRDO: (rdoCreatorId: string) => {
      if (user?.id === rdoCreatorId) return false;
      return basePermissions.canApproveRDO;
    },
  }), [basePermissions, user?.id]);

  const obraPermissions = useMemo(() => ({
    canCreate: true,
    canEdit: roles.includes('Administrador') || roles.includes('Gerente'),
    canDelete: roles.includes('Administrador'),
  }), [roles]);

  const equipePermissions = useMemo(() => ({
    canCreate: roles.includes('Administrador') || roles.includes('Gerente'),
    canEdit: roles.includes('Administrador') || roles.includes('Gerente'),
    canManageColaboradores: roles.includes('Administrador') || roles.includes('Gerente'),
    canDeleteColaboradores: roles.includes('Administrador'),
  }), [roles]);

  const relatorioPermissions = useMemo(() => ({
    canView: basePermissions.canViewAllRDOs,
    canExport: basePermissions.canExportRDO,
  }), [basePermissions]);

  const sistemaPermissions = useMemo(() => ({
    canConfigure: roles.includes('Administrador'),
    canAudit: roles.includes('Administrador') || roles.includes('Gerente'),
    canBackup: roles.includes('Administrador'),
    canManageIntegrations: roles.includes('Administrador'),
  }), [roles]);

  return {
    ...permissions,
    rdo: rdoPermissions,
    obra: obraPermissions,
    equipe: equipePermissions,
    relatorio: relatorioPermissions,
    sistema: sistemaPermissions,
  };
};

export const useRole = () => {
  const { roles } = useAuth();
  
  return useMemo(() => ({
    isAdmin: roles.includes('Administrador'),
    isGerente: roles.includes('Gerente'),
    isColaborador: roles.includes('Colaborador'),
    role: roles[0] || 'Colaborador' as UserRole,
  }), [roles]);
};

export const useRouteAccess = (path: string) => {
  const { isAuthenticated } = useAuth();
  
  return useMemo(() => ({
    hasAccess: isAuthenticated,
    path,
  }), [isAuthenticated, path]);
};