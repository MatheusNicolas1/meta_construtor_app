import { supabase } from "@/integrations/supabase/client";

export type ActivityEvent = 
  | 'view_dashboard'
  | 'view_obras'
  | 'view_rdos'
  | 'view_equipes'
  | 'view_equipamentos'
  | 'view_fornecedores'
  | 'view_checklist'
  | 'view_documentos'
  | 'view_relatorios'
  | 'view_integracoes'
  | 'view_configuracoes'
  | 'view_perfil'
  | 'create_rdo'
  | 'create_obra'
  | 'complete_onboarding';

interface TrackActivityOptions {
  eventData?: Record<string, any>;
}

export const trackActivity = async (
  eventName: ActivityEvent,
  options: TrackActivityOptions = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        event_name: eventName,
        event_data: options.eventData || null,
      });
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};
