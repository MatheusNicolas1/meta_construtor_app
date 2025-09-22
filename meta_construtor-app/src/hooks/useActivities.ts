import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Activity {
  id: string;
  title: string;
  description: string;
  obra: string;
  date: string;
  time: string;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  priority: "baixa" | "media" | "alta";
  notified?: boolean;
}

const ACTIVITIES_STORAGE_KEY = 'construction-activities';

export function useActivities() {
  const [activities, setActivities] = useState<Record<string, Activity[]>>({});
  const { toast } = useToast();

  // Load activities from localStorage
  const loadActivities = useCallback((): Record<string, Activity[]> => {
    try {
      const stored = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load activities from localStorage:', error);
      return {};
    }
  }, []);

  // Save activities to localStorage
  const saveActivities = useCallback((activitiesData: Record<string, Activity[]>) => {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activitiesData));
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to save activities to localStorage:', error);
      toast({
        title: "Erro de Armazenamento",
        description: "Não foi possível salvar as atividades. Verifique o espaço disponível.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Add or update activity
  const saveActivity = useCallback((activity: Activity) => {
    const updatedActivities = { ...activities };
    if (!updatedActivities[activity.date]) {
      updatedActivities[activity.date] = [];
    }

    const existingIndex = updatedActivities[activity.date].findIndex(a => a.id === activity.id);
    if (existingIndex >= 0) {
      updatedActivities[activity.date][existingIndex] = activity;
    } else {
      updatedActivities[activity.date].push(activity);
    }

    saveActivities(updatedActivities);
    
    toast({
      title: existingIndex >= 0 ? "Atividade atualizada" : "Atividade criada",
      description: `${activity.title} foi ${existingIndex >= 0 ? 'atualizada' : 'criada'} com sucesso`,
    });
  }, [activities, saveActivities, toast]);

  // Delete activity
  const deleteActivity = useCallback((activityId: string, date: string) => {
    const updatedActivities = { ...activities };
    if (updatedActivities[date]) {
      updatedActivities[date] = updatedActivities[date].filter(a => a.id !== activityId);
      
      if (updatedActivities[date].length === 0) {
        delete updatedActivities[date];
      }
      
      saveActivities(updatedActivities);
      
      toast({
        title: "Atividade excluída",
        description: "A atividade foi removida com sucesso",
      });
    }
  }, [activities, saveActivities, toast]);

  // Get activities for a specific date
  const getActivitiesForDate = useCallback((date: string): Activity[] => {
    return activities[date] || [];
  }, [activities]);

  // Check if date has activities
  const hasActivitiesOnDate = useCallback((date: string): boolean => {
    return !!(activities[date] && activities[date].length > 0);
  }, [activities]);

  // Load activities on mount
  useEffect(() => {
    setActivities(loadActivities());
  }, [loadActivities]);

  // Check for notifications
  useEffect(() => {
    const checkNotifications = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      const tomorrowActivities = activities[tomorrowString] || [];
      
      tomorrowActivities.forEach(activity => {
        if (!activity.notified && activity.status === 'agendada') {
          // Mark as notified
          const updatedActivities = { ...activities };
          updatedActivities[tomorrowString] = updatedActivities[tomorrowString].map(a => 
            a.id === activity.id ? { ...a, notified: true } : a
          );
          saveActivities(updatedActivities);
          
          // Show notification
          toast({
            title: "Lembrete de Atividade",
            description: `${activity.title} - ${activity.obra} está programada para amanhã às ${activity.time}`,
            duration: 10000,
          });
          
          // Browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('Lembrete de Atividade', {
              body: `${activity.title} - ${activity.obra} está programada para amanhã às ${activity.time}`,
              icon: '/favicon.ico'
            });
          }
        }
      });
    };

    // Request notification permission on first load
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check immediately and then every hour
    checkNotifications();
    const interval = setInterval(checkNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [activities, saveActivities, toast]);

  return {
    activities,
    saveActivity,
    deleteActivity,
    getActivitiesForDate,
    hasActivitiesOnDate,
  };
}