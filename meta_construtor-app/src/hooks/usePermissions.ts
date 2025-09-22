import { useMemo } from 'react';
import type { UserRole } from '@/types/user';

// Hook simplificado para desenvolvimento - sempre permite tudo
export const usePermissions = () => {
  
  const permissions = useMemo(() => ({
    canAccessRoute: () => true,
    canPerformAction: () => true,
    allowedActions: ['*'],
    userRole: "Administrador" as UserRole,
  }), []);

  // Permissões específicas sempre retornam true
  const rdoPermissions = useMemo(() => ({
    canCreate: true,
    canEditOwn: true,
    canEditAny: true,
    canApprove: true,
    canExport: true,
    canDelete: true,
    canEdit: () => true,
    canApproveRDO: () => true,
  }), []);

  const obraPermissions = useMemo(() => ({
    canCreate: true,
    canEdit: true,
    canDelete: true,
  }), []);

  const equipePermissions = useMemo(() => ({
    canCreate: true,
    canEdit: true,
    canManageColaboradores: true,
    canDeleteColaboradores: true,
  }), []);

  const relatorioPermissions = useMemo(() => ({
    canView: true,
    canExport: true,
  }), []);

  const sistemaPermissions = useMemo(() => ({
    canConfigure: true,
    canAudit: true,
    canBackup: true,
    canManageIntegrations: true,
  }), []);

  return {
    ...permissions,
    rdo: rdoPermissions,
    obra: obraPermissions,
    equipe: equipePermissions,
    relatorio: relatorioPermissions,
    sistema: sistemaPermissions,
  };
};

// Hook para verificação rápida de role
export const useRole = () => {
  return useMemo(() => ({
    isAdmin: true,
    isGerente: true,
    isColaborador: true,
    role: "Administrador" as UserRole,
  }), []);
};

// Hook para verificação de acesso a rotas específicas
export const useRouteAccess = (path: string) => {
  return useMemo(() => ({
    hasAccess: true,
    path,
  }), [path]);
};