import { useMemo } from 'react';
import { UserRole, getUserPermissions, UserPermissions } from '@/types/user';

// Hook para gerenciar permissões do usuário
// TODO: Integrar com Supabase para obter dados reais do usuário
export const useUserPermissions = () => {
  // Mock - substituir pela integração real com Supabase
  const currentUser = {
    id: 'mock-user-id',
    name: 'Usuário Mock',
    email: 'usuario@mock.com',
    role: 'Colaborador' as UserRole, // Alterar conforme necessário para testes
  };

  const permissions = useMemo(
    () => getUserPermissions(currentUser.role),
    [currentUser.role]
  );

  const canApproveRDO = (rdoCreatorId: string): boolean => {
    // Não pode aprovar próprio RDO
    if (rdoCreatorId === currentUser.id) return false;
    return permissions.canApproveRDO;
  };

  const canExportRDO = (rdoStatus: string): boolean => {
    // Só pode exportar RDOs aprovados
    if (rdoStatus !== 'Aprovado') return false;
    return permissions.canExportRDO;
  };

  return {
    currentUser,
    permissions,
    canApproveRDO,
    canExportRDO,
    hasPermission: (permission: keyof UserPermissions) => permissions[permission],
  };
};