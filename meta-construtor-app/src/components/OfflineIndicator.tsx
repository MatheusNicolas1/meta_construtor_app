
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wifi, WifiOff, RefreshCw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';

export function OfflineIndicator() {
  const { 
    isOnline, 
    isSyncing, 
    pendingActions, 
    syncData, 
    syncQueueSize, 
    lastSyncTime 
  } = useOffline();

  // Don't show anything when online and no pending actions
  if (isOnline && !isSyncing && pendingActions.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          {!isOnline && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
          
          {isSyncing && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Sincronizando...
            </Badge>
          )}
          
          {pendingActions.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200">
              <Clock className="h-3 w-3" />
              {pendingActions.length} pendente(s)
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Status da Sincronização</h4>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ações pendentes:</span>
              <span className="font-medium">{syncQueueSize}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última sincronização:</span>
              <span className="font-medium">
                {lastSyncTime 
                  ? lastSyncTime.toLocaleTimeString() 
                  : 'Nunca'
                }
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">
                {isSyncing ? 'Sincronizando...' : 
                 !isOnline ? 'Modo Offline' : 
                 'Sincronizado'}
              </span>
            </div>
          </div>
          
          {pendingActions.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Ações Pendentes:</h5>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {pendingActions.slice(0, 10).map((action) => (
                  <div key={action.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                    <span className="truncate">{action.type}</span>
                    <div className="flex items-center gap-1">
                      {action.retryCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Retry: {action.retryCount}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {pendingActions.length > 10 && (
                  <div className="text-xs text-muted-foreground text-center">
                    E mais {pendingActions.length - 10} ação(ões)...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isOnline && pendingActions.length > 0 && (
            <Button 
              onClick={syncData} 
              disabled={isSyncing}
              className="w-full"
              size="sm"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Agora
                </>
              )}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
