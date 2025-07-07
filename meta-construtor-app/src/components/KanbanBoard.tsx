import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, User, Calendar, Link2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  title: string;
  description: string;
  obra: string;
  responsavel: string;
  prazo: string;
  status: 'pendente' | 'em-andamento' | 'concluida' | 'atrasada';
  prioridade: 'baixa' | 'media' | 'alta';
  progresso: number;
  predecessora?: string;
}

interface KanbanBoardProps {
  activities: Activity[];
  onStatusChange: (activityId: string, newStatus: Activity['status']) => void;
  onActivityClick: (activity: Activity) => void;
  canMoveActivity?: (activityId: string, newStatus: Activity['status']) => boolean;
}

export function KanbanBoard({ activities, onStatusChange, onActivityClick, canMoveActivity }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const { toast } = useToast();

  const columns = [
    { 
      id: 'pendente', 
      title: 'Pendente', 
      icon: Clock, 
      color: 'bg-yellow-100 border-yellow-200 text-yellow-800' 
    },
    { 
      id: 'em-andamento', 
      title: 'Em Andamento', 
      icon: AlertCircle, 
      color: 'bg-blue-100 border-blue-200 text-blue-800' 
    },
    { 
      id: 'concluida', 
      title: 'Concluída', 
      icon: CheckCircle, 
      color: 'bg-green-100 border-green-200 text-green-800' 
    },
    { 
      id: 'atrasada', 
      title: 'Atrasada', 
      icon: AlertTriangle, 
      color: 'bg-red-100 border-red-200 text-red-800' 
    }
  ];

  const handleDragStart = (e: React.DragEvent, activityId: string) => {
    setDraggedItem(activityId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Activity['status']) => {
    e.preventDefault();
    if (draggedItem) {
      // Verificar se a atividade pode ser movida
      if (canMoveActivity && !canMoveActivity(draggedItem, newStatus)) {
        const activity = activities.find(a => a.id === draggedItem);
        const predecessor = activities.find(a => a.id === activity?.predecessora);
        
        toast({
          title: "Movimento Bloqueado",
          description: `Esta atividade depende da conclusão de "${predecessor?.title}".`,
          variant: "destructive",
        });
        
        setDraggedItem(null);
        return;
      }
      
      onStatusChange(draggedItem, newStatus);
      setDraggedItem(null);
    }
  };

  const getActivitiesByStatus = (status: Activity['status']) => {
    return activities.filter(activity => activity.status === status);
  };

  const getPriorityColor = (prioridade: Activity['prioridade']) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'baixa': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPredecessorActivity = (predecessorId?: string) => {
    if (!predecessorId) return null;
    return activities.find(activity => activity.id === predecessorId);
  };

  const isActivityBlocked = (activity: Activity) => {
    if (!activity.predecessora) return false;
    const predecessor = getPredecessorActivity(activity.predecessora);
    return predecessor?.status !== 'concluida';
  };

  return (
    <div className="min-w-max">
      <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full min-w-[800px]">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnActivities = getActivitiesByStatus(column.id as Activity['status']);
          
          return (
            <div
              key={column.id}
              className="flex flex-col h-full min-w-[180px] sm:min-w-[200px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as Activity['status'])}
            >
              <div className={`rounded-t-lg p-3 sm:p-4 border-2 ${column.color}`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base truncate">{column.title}</h3>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {columnActivities.length}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg p-2 sm:p-4 space-y-2 sm:space-y-3 min-h-[400px] bg-gray-50">
                {columnActivities.map((activity) => {
                  const predecessor = getPredecessorActivity(activity.predecessora);
                  const isBlocked = isActivityBlocked(activity);
                  
                  return (
                    <Card
                      key={activity.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow bg-white text-sm ${
                        isBlocked ? 'opacity-70 border-orange-200' : ''
                      }`}
                      draggable={!isBlocked}
                      onDragStart={(e) => handleDragStart(e, activity.id)}
                      onClick={() => onActivityClick(activity)}
                    >
                      <CardHeader className="pb-2 p-3">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 flex-1 min-w-0">
                            <span className="truncate">{activity.title}</span>
                            {predecessor && (
                              <Link2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            )}
                            {isBlocked && (
                              <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                            )}
                          </CardTitle>
                          <Badge className={`${getPriorityColor(activity.prioridade)} text-xs flex-shrink-0`}>
                            {activity.prioridade}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs leading-tight">
                          {activity.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 p-3">
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{activity.responsavel}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{new Date(activity.prazo).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="text-xs font-medium text-primary truncate">
                            {activity.obra}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Progresso</span>
                              <span className="text-xs font-medium">{activity.progresso}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                              <div 
                                className="bg-primary h-1.5 sm:h-2 rounded-full transition-all" 
                                style={{ width: `${activity.progresso}%` }}
                              />
                            </div>
                          </div>
                          
                          {predecessor && (
                            <div className="flex items-center gap-1 p-2 bg-muted rounded text-xs">
                              <Link2 className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">Depende de: {predecessor.title}</span>
                              {isBlocked && (
                                <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">
                                  Bloqueada
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {columnActivities.length === 0 && (
                  <div className="text-center text-muted-foreground py-6 sm:py-8">
                    <Icon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm">Nenhuma atividade {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
