import { supabase } from '@/integrations/supabase/client';

// Definição do tipo de perfil
type Profile = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  avatar_url?: string;
  phone?: string;
  company?: string;
  plan_id?: string;
  trial_end?: string;
  is_active?: boolean;
};

// Serviço para gerenciar perfis
export const profileService = {
  // Buscar perfil de usuário pelo ID
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return data;
  },

  // Verificar se o perfil existe
  async profileExists(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  },

  // Criar novo perfil
  async createProfile(profile: Profile): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select();

    return { data, error };
  },

  // Atualizar perfil existente
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    return { data, error };
  },

  // Atualizar avatar do usuário
  async updateAvatar(userId: string, filePath: string): Promise<{ data: any; error: any }> {
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    const avatarUrl = urlData.publicUrl;
    console.log("Profile service - atualizando avatar_url:", avatarUrl);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select();

    if (error) {
      console.error("Erro ao atualizar avatar_url no perfil:", error);
    }

    return { data, error };
  },

  // Definir período de teste
  async setTrialPeriod(userId: string, planId: string, days: number): Promise<{ data: any; error: any }> {
    // Calcular data de término do período de teste
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + days);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        plan_id: planId,
        trial_end: trialEnd.toISOString(),
        is_active: true
      })
      .eq('id', userId)
      .select();

    return { data, error };
  },

  // Verificar status da assinatura
  async checkSubscriptionStatus(userId: string): Promise<{ isActive: boolean; daysLeft: number | null; isPremium: boolean }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_active, trial_end, plan_id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Erro ao verificar status da assinatura:', error);
      return { isActive: false, daysLeft: null, isPremium: false };
    }

    let daysLeft = null;
    let isActive = data.is_active || false;
    let isPremium = false;

    // Verificar se o plano é premium (ID diferente de 1, que é o plano básico/trial)
    if (data.plan_id && data.plan_id !== '1') {
      isPremium = true;
    }

    // Calcular dias restantes se estiver no período de trial
    if (data.trial_end) {
      const trialEndDate = new Date(data.trial_end);
      const today = new Date();
      
      const diffTime = trialEndDate.getTime() - today.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Se o período de trial acabou, atualizar o status
      if (daysLeft <= 0 && data.plan_id === '1') {
        // Trial expirou e o usuário não atualizou para um plano pago
        isActive = false;
        daysLeft = 0;
        
        // Atualizar o status no banco de dados
        await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', userId);
      }
    }

    return { isActive, daysLeft, isPremium };
  }
}; 