const ACTIVE_ORG_KEY = 'activeOrgId';

export const setActiveOrgIdLocal = (orgId: string): void => {
    try {
        localStorage.setItem(ACTIVE_ORG_KEY, orgId);
    } catch (error) {
        console.warn('Failed to save activeOrgId to localStorage:', error);
    }
};

export const getActiveOrgIdLocal = (): string | null => {
    try {
        return localStorage.getItem(ACTIVE_ORG_KEY);
    } catch (error) {
        console.warn('Failed to read activeOrgId from localStorage:', error);
        return null;
    }
};

export const clearActiveOrgIdLocal = (): void => {
    try {
        localStorage.removeItem(ACTIVE_ORG_KEY);
    } catch (error) {
        console.warn('Failed to clear activeOrgId from localStorage:', error);
    }
};
