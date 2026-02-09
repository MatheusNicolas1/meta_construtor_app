import { useOrg } from '@/contexts/OrgContext';

interface RequireOrgResult {
    orgId: string;
    role: 'Administrador' | 'Gerente' | 'Colaborador';
    isLoading: boolean;
}

/**
 * Hook que garante activeOrgId antes de queries.
 * Retorna { orgId, role, isLoading }.
 * Se isLoading=true, aguarde. Se orgId for null após loading, lança erro.
 */
export const useRequireOrg = (): RequireOrgResult => {
    const { activeOrgId, activeRole, isLoading } = useOrg();

    if (isLoading) {
        return { orgId: '', role: 'Colaborador', isLoading: true };
    }

    if (!activeOrgId || !activeRole) {
        throw new Error('Usuário sem organização ativa');
    }

    return { orgId: activeOrgId, role: activeRole, isLoading: false };
};
