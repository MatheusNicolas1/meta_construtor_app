
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserInteraction = () => {
    const location = useLocation();

    // Track Page Views automatically
    useEffect(() => {
        const trackPageView = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('user_interactions' as any).insert({
                user_id: user.id,
                interaction_type: 'page_view',
                target_id: location.pathname,
                metadata: { title: document.title }
            });
        };

        trackPageView();
    }, [location.pathname]);

    // Helper to track manual interactions (clicks)
    const trackAction = async (action: string, targetId: string, metadata?: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            await supabase.from('user_interactions' as any).insert({
                user_id: user.id,
                interaction_type: action,
                target_id: targetId,
                metadata: metadata
            });
        } catch (error) {
            console.error('Error tracking action:', error);
        }
    };

    return { trackAction };
};
