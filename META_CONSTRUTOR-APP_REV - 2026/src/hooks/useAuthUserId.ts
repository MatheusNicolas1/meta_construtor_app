import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Centralized hook for getting the current authenticated user's ID.
 * Uses a long staleTime to avoid frequent refetches since user ID rarely changes during a session.
 */
export const useAuthUserId = () => {
    const { data: userId, isLoading, error } = useQuery({
        queryKey: ['auth-user-id'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user?.id ?? null;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes - user ID doesn't change frequently
        gcTime: 60 * 60 * 1000, // 1 hour garbage collection time
    });

    return { userId, isLoading, error };
};
