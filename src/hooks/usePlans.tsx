
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useEffect } from "react";

export interface Plan {
  id: string;
  name: string;
  price: number;
  max_collaborators: number;
  max_obras: number;
  description: string;
}

export interface UserProfile {
  id: string;
  plan_id: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  trial_start: string | null;
  trial_end: string | null;
  plan?: Plan;
}

export const usePlans = () => {
  const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price');
      
      if (error) throw error;
      return data as Plan[];
    }
  });

  const { data: userProfile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*, plan:plan_id(*)')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    }
  });

  // Check for trial expiration
  useEffect(() => {
    const checkTrialStatus = async () => {
      if (userProfile?.trial_end) {
        const trialEndDate = new Date(userProfile.trial_end);
        const currentDate = new Date();
        
        if (currentDate > trialEndDate && userProfile.plan?.name === 'Premium') {
          console.log("Trial has expired, downgrading to Basic plan");
          
          // Get Basic plan ID
          const { data: basicPlan } = await supabase
            .from('plans')
            .select('id')
            .eq('name', 'Básico')
            .single();
            
          if (basicPlan) {
            const { error } = await supabase
              .from('profiles')
              .update({
                plan_id: basicPlan.id,
                trial_start: null,
                trial_end: null
              })
              .eq('id', userProfile.id);
              
            if (!error) {
              // Refetch to update UI
              refetchProfile();
            }
          }
        }
      }
    };
    
    checkTrialStatus();
  }, [userProfile]);

  const checkObraLimit = async (): Promise<boolean> => {
    if (!userProfile?.plan) return false;
    
    // Premium plan has no obra limit
    if (userProfile.plan.max_obras === 0) return true;
    
    // For other plans, check current obra count
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { count, error } = await supabase
      .from('obras')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    if (error) return false;
    
    return (count || 0) < userProfile.plan.max_obras;
  };

  const checkCollaboratorLimit = async (): Promise<boolean> => {
    if (!userProfile?.plan) return false;
    
    // Check current collaborator count
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { count, error } = await supabase
      .from('collaborators')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .eq('status', 'active');
    
    if (error) return false;
    
    return (count || 0) < userProfile.plan.max_collaborators;
  };

  const isOnTrialPeriod = (): boolean => {
    if (!userProfile?.trial_end) return false;
    
    const trialEndDate = new Date(userProfile.trial_end);
    const currentDate = new Date();
    
    return currentDate < trialEndDate;
  };
  
  const getDaysLeftInTrial = (): number => {
    if (!userProfile?.trial_end) return 0;
    
    const trialEndDate = new Date(userProfile.trial_end);
    const currentDate = new Date();
    
    if (currentDate > trialEndDate) return 0;
    
    const diffTime = Math.abs(trialEndDate.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return {
    plans,
    userProfile,
    isLoading: plansLoading || profileLoading,
    error: plansError || profileError,
    checkObraLimit,
    checkCollaboratorLimit,
    isOnTrialPeriod,
    getDaysLeftInTrial,
    refetchProfile
  };
};
