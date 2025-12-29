import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { notifyActivityChange } from '@/utils/notificationService';

export interface Activity {
  id: string;
  user_id: string;
  obra_id?: string;
  titulo: string;
  descricao?: string;
  data: string;
  hora: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta';
  categoria?: string;
  unidade_medida?: string;
  quantidade_prevista?: number;
  responsavel?: string;
  notificado?: boolean;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for compatibility
  title?: string;
  description?: string;
  obra?: string;
  date?: string;
  time?: string;
  priority?: 'baixa' | 'media' | 'alta';
}

export function useActivitiesSupabase() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Carregar atividades do Supabase
  const loadActivities = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .order('data', { ascending: true })
        .order('hora', { ascending: true })
        .limit(50);

      if (error) throw error;

      // Cast the data to Activity type
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as Activity['status'],
        prioridade: item.prioridade as Activity['prioridade'],
      })) as Activity[];

      setActivities(typedData);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast({
        title: 'Erro ao carregar atividades',
        description: 'Não foi possível carregar as atividades do servidor.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, toast]);

  // Salvar ou atualizar atividade
  const saveActivity = useCallback(async (activity: Partial<Activity>) => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar atividades.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Normalizar dados para o formato do banco
      const activityData = {
        user_id: user.id,
        obra_id: activity.obra_id || null,
        titulo: activity.titulo || activity.title || '',
        descricao: activity.descricao || activity.description || '',
        data: activity.data || activity.date || new Date().toISOString().split('T')[0],
        hora: activity.hora || activity.time || '09:00',
        status: activity.status || 'agendada',
        prioridade: activity.prioridade || activity.priority || 'media',
        categoria: activity.categoria || null,
        unidade_medida: activity.unidade_medida || null,
        quantidade_prevista: activity.quantidade_prevista || null,
        responsavel: activity.responsavel || null,
        notificado: activity.notificado || false,
      };

      let result;
      const isUpdate = activity.id && !activity.id.toString().match(/^\d+$/);

      if (isUpdate) {
        // Atualizar atividade existente
        const { data, error } = await supabase
          .from('atividades')
          .update(activityData)
          .eq('id', activity.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        // Enviar notificação de atualização
        await notifyActivityChange(user.id, activityData.titulo, 'updated', activityData.obra_id || undefined);

        toast({
          title: 'Atividade atualizada',
          description: `${activityData.titulo} foi atualizada com sucesso.`,
        });
      } else {
        // Criar nova atividade
        const { data, error } = await supabase
          .from('atividades')
          .insert(activityData)
          .select()
          .single();

        if (error) throw error;
        result = data;

        // Enviar notificação de criação
        await notifyActivityChange(user.id, activityData.titulo, 'created', activityData.obra_id || undefined);

        toast({
          title: 'Atividade criada',
          description: `${activityData.titulo} foi criada com sucesso.`,
        });
      }

      // Recarregar atividades
      await loadActivities();
      return result;
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: 'Erro ao salvar atividade',
        description: 'Não foi possível salvar a atividade.',
        variant: 'destructive',
      });
      return null;
    }
  }, [isAuthenticated, user?.id, toast, loadActivities]);

  // Deletar atividade
  const deleteActivity = useCallback(async (activityId: string) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      // Buscar dados da atividade antes de deletar
      const activityToDelete = activities.find(a => a.id === activityId);

      const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      // Enviar notificação de deleção
      if (activityToDelete) {
        await notifyActivityChange(user.id, activityToDelete.titulo, 'deleted', activityToDelete.obra_id);
      }

      toast({
        title: 'Atividade excluída',
        description: 'A atividade foi removida com sucesso.',
      });

      // Recarregar atividades
      await loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: 'Erro ao excluir atividade',
        description: 'Não foi possível excluir a atividade.',
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, user?.id, activities, toast, loadActivities]);

  // Obter atividades para uma data específica
  const getActivitiesForDate = useCallback((date: string): Activity[] => {
    return activities.filter(a => a.data === date);
  }, [activities]);

  // Verificar se há atividades em uma data
  const hasActivitiesOnDate = useCallback((date: string): boolean => {
    return activities.some(a => a.data === date);
  }, [activities]);

  // Agrupar atividades por data (para compatibilidade com o código existente)
  const activitiesByDate = useCallback((): Record<string, Activity[]> => {
    return activities.reduce((acc, activity) => {
      const date = activity.data;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
  }, [activities]);

  // Carregar atividades ao montar
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Real-time subscription
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const channel = supabase
      .channel('atividades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'atividades'
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id, loadActivities]);

  return {
    activities: activitiesByDate(),
    activitiesList: activities,
    isLoading,
    saveActivity,
    deleteActivity,
    getActivitiesForDate,
    hasActivitiesOnDate,
    refetch: loadActivities,
  };
}
