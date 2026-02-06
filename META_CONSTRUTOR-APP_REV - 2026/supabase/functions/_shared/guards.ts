import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// B3: Minimal logging
export const logRequest = (
    requestId: string,
    user_id: string | undefined,
    org_id: string | null,
    endpoint: string,
    result: 'success' | 'denied' | 'error',
    details?: string
) => {
    console.log(JSON.stringify({
        request_id: requestId,
        user_id,
        org_id,
        endpoint,
        result,
        details,
        timestamp: new Date().toISOString()
    }));
}

// Auth Guard
export const requireAuth = async (supabase: SupabaseClient) => {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Unauthorized')
    }

    return user
}

// Org Member Guard
export const requireOrgMember = async (supabase: SupabaseClient, orgId: string) => {
    // Uses the DB helper created in m2.2
    const { data, error } = await supabase.rpc('is_org_member', {
        p_org_id: orgId
    })

    if (error) {
        console.error('RPC is_org_member error:', error)
        throw new Error('Internal Server Error checking permissions')
    }

    if (data !== true) {
        throw new Error('Forbidden: Not an org member')
    }

    return true
}

// Org Role Guard
export const requireOrgRole = async (supabase: SupabaseClient, orgId: string, allowedRoles: string[]) => {
    // Uses the DB helper created in m2.2
    const { data, error } = await supabase.rpc('has_org_role', {
        p_org_id: orgId,
        p_roles: allowedRoles
    })

    if (error) {
        console.error('RPC has_org_role error:', error)
        throw new Error('Internal Server Error checking roles')
    }

    if (data !== true) {
        throw new Error(`Forbidden: Required role not found.`)
    }

    return true
}
