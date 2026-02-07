import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPlanLimits } from "../utils/planLimits";

export const usePlanLimits = () => {
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile-plan'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('plan_type')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            return data;
        },
    });

    const planType = profile?.plan_type || 'free';
    const limits = getPlanLimits(planType);

    return {
        planType,
        limits,
        isLoading: isProfileLoading,
    };
};
