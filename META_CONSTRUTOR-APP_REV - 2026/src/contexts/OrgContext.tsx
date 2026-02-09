import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import {
    listMembershipsActive,
    listMyOrgsByMembership,
    type OrgMembership,
    type Org,
} from '@/helpers/orgs';
import {
    setActiveOrgIdLocal,
    getActiveOrgIdLocal,
    clearActiveOrgIdLocal,
} from '@/helpers/storage';

interface OrgContextValue {
    orgs: Org[];
    activeOrgId: string | null;
    activeRole: 'Administrador' | 'Gerente' | 'Colaborador' | null;
    setActiveOrgId: (orgId: string) => void;
    isLoading: boolean;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const authContext = useAuth();
    const { user } = authContext;
    const updateAuthRoles = authContext.updateRoles;
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [memberships, setMemberships] = useState<OrgMembership[]>([]);
    const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
    const [activeRole, setActiveRole] = useState<
        'Administrador' | 'Gerente' | 'Colaborador' | null
    >(null);
    const [isLoading, setIsLoading] = useState(true);

    // Boot: carregar orgs ao logar
    useEffect(() => {
        const loadOrgs = async () => {
            if (!user) {
                // Logout: limpar tudo
                setOrgs([]);
                setMemberships([]);
                setActiveOrgIdState(null);
                setActiveRole(null);
                clearActiveOrgIdLocal();
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            // 1. Buscar memberships ativas
            const membershipsData = await listMembershipsActive();
            setMemberships(membershipsData);

            if (membershipsData.length === 0) {
                console.warn('Usuário sem organizações ativas');
                setIsLoading(false);
                return;
            }

            // 2. Buscar dados das orgs
            const orgsData = await listMyOrgsByMembership(membershipsData);
            setOrgs(orgsData);

            // 3. Escolher org ativa
            const saved = getActiveOrgIdLocal();
            const validSaved = membershipsData.find((m) => m.org_id === saved);

            const chosenOrgId = validSaved
                ? validSaved.org_id
                : membershipsData[0].org_id;

            setActiveOrgIdState(chosenOrgId);
            setActiveOrgIdLocal(chosenOrgId);

            // 4. Setar role
            const membership = membershipsData.find((m) => m.org_id === chosenOrgId);
            const role = membership?.role || null;
            setActiveRole(role);

            // 5. Sincronizar com AuthContext
            if (role) {
                updateAuthRoles([role]);
            }

            setIsLoading(false);
        };

        loadOrgs();
    }, [user, updateAuthRoles]);

    // Atualizar role ao trocar org ativa
    useEffect(() => {
        if (activeOrgId) {
            const membership = memberships.find((m) => m.org_id === activeOrgId);
            const role = membership?.role || null;
            setActiveRole(role);

            // Sincronizar com AuthContext
            if (role) {
                updateAuthRoles([role]);
            }
        }
    }, [activeOrgId, memberships, updateAuthRoles]);

    const setActiveOrgId = (orgId: string) => {
        const membership = memberships.find((m) => m.org_id === orgId);
        if (!membership) {
            console.error('Org não encontrada nas memberships do usuário');
            return;
        }
        setActiveOrgIdState(orgId);
        setActiveOrgIdLocal(orgId);
        const role = membership.role;
        setActiveRole(role);

        // Sincronizar com AuthContext
        updateAuthRoles([role]);
    };

    return (
        <OrgContext.Provider
            value={{ orgs, activeOrgId, activeRole, setActiveOrgId, isLoading }}
        >
            {children}
        </OrgContext.Provider>
    );
};

export const useOrg = (): OrgContextValue => {
    const context = useContext(OrgContext);
    if (!context) {
        throw new Error('useOrg deve ser usado dentro de OrgProvider');
    }
    return context;
};
