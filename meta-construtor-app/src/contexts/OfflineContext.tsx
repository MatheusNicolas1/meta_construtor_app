
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PendingAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  syncData: () => Promise<void>;
  pendingActions: PendingAction[];
  addPendingAction: (action: any) => void;
  removePendingAction: (actionId: string) => void;
  syncQueueSize: number;
  lastSyncTime: Date | null;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(() => {
    const saved = localStorage.getItem('metaconstrutor-pending-actions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão Restaurada",
        description: "Você está novamente online. Sincronizando dados...",
      });
      if (pendingActions.length > 0) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo Offline",
        description: "Você está offline. As alterações serão sincronizadas quando a conexão for restaurada.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conectividade periodicamente
    const checkConnectivity = setInterval(() => {
      const currentOnlineStatus = navigator.onLine;
      if (currentOnlineStatus !== isOnline) {
        setIsOnline(currentOnlineStatus);
      }
    }, 30000); // Verificar a cada 30 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkConnectivity);
    };
  }, [pendingActions.length, isOnline]);

  useEffect(() => {
    localStorage.setItem('metaconstrutor-pending-actions', JSON.stringify(pendingActions));
  }, [pendingActions]);

  const addPendingAction = (action: any) => {
    const pendingAction: PendingAction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: action.type,
      data: action.data || action,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingActions(prev => [...prev, pendingAction]);
    
    if (!isOnline) {
      toast({
        title: "Ação Salva",
        description: "Sua ação foi salva e será sincronizada quando você estiver online.",
      });
    }
  };

  const removePendingAction = (actionId: string) => {
    setPendingActions(prev => prev.filter(action => action.id !== actionId));
  };

  const syncData = async () => {
    if (pendingActions.length === 0 || !isOnline) return;

    setIsSyncing(true);
    console.log('Iniciando sincronização de dados:', pendingActions);
    
    try {
      // Simular sincronização com retry logic
      for (const action of pendingActions) {
        try {
          console.log('Sincronizando ação:', action);
          
          // Simular request para API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simular possível falha (10% de chance)
          if (Math.random() < 0.1 && action.retryCount < 3) {
            throw new Error('Falha na sincronização');
          }
          
          // Remover ação sincronizada com sucesso
          removePendingAction(action.id);
          
        } catch (error) {
          console.error('Erro ao sincronizar ação:', action.id, error);
          
          // Aumentar contador de retry
          setPendingActions(prev => 
            prev.map(a => 
              a.id === action.id 
                ? { ...a, retryCount: a.retryCount + 1 }
                : a
            )
          );
          
          // Se excedeu limite de tentativas, remover da fila
          if (action.retryCount >= 3) {
            removePendingAction(action.id);
            toast({
              title: "Erro de Sincronização",
              description: `Não foi possível sincronizar a ação: ${action.type}`,
              variant: "destructive",
            });
          }
        }
      }
      
      setLastSyncTime(new Date());
      
      if (pendingActions.length > 0) {
        toast({
          title: "Sincronização Concluída",
          description: `${pendingActions.length} ação(ões) foram sincronizadas com sucesso.`,
        });
      }
      
    } catch (error) {
      console.error('Erro geral na sincronização:', error);
      toast({
        title: "Erro de Sincronização",
        description: "Houve um problema na sincronização. Tentaremos novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync quando online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0 && !isSyncing) {
      const autoSyncTimer = setTimeout(() => {
        syncData();
      }, 5000); // Auto-sync após 5 segundos

      return () => clearTimeout(autoSyncTimer);
    }
  }, [isOnline, pendingActions.length, isSyncing]);

  return (
    <OfflineContext.Provider value={{
      isOnline,
      isSyncing,
      syncData,
      pendingActions,
      addPendingAction,
      removePendingAction,
      syncQueueSize: pendingActions.length,
      lastSyncTime
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
