
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Plus } from "lucide-react";

export interface Activity {
  id: string;
  name: string;
  percentage: number;
  startDate: string | null;
  endDate: string | null;
}

interface PreRegisteredActivity {
  id: string;
  name: string;
}

interface ActivityListProps {
  preRegisteredActivities: PreRegisteredActivity[];
  onActivitiesChange?: (activities: Activity[]) => void;
  isExtra?: boolean;
}

export function ActivityList({ preRegisteredActivities, onActivitiesChange, isExtra = false }: ActivityListProps) {
  const { resolvedTheme } = useTheme();
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [currentExtraActivity, setCurrentExtraActivity] = useState("");
  
  const percentageOptions = Array.from({ length: 11 }, (_, i) => i * 10);
  const today = new Date().toISOString().split('T')[0];
  
  const handleActivitySelect = (activityId: string) => {
    const activity = preRegisteredActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    const isAlreadySelected = selectedActivities.some(a => a.name === activity.name);
    if (isAlreadySelected) return;
    
    const newActivity: Activity = {
      id: activity.id,
      name: activity.name,
      percentage: 0,
      startDate: today,
      endDate: null
    };
    
    const updatedActivities = [...selectedActivities, newActivity];
    setSelectedActivities(updatedActivities);
    onActivitiesChange?.(updatedActivities);
  };
  
  const handlePercentageChange = (activityId: string, percentage: number) => {
    const updatedActivities = selectedActivities.map(activity => {
      if (activity.id === activityId) {
        // If percentage reaches 100%, set end date to today
        const endDate = percentage === 100 ? today : activity.endDate;
        return { ...activity, percentage, endDate };
      }
      return activity;
    });
    
    setSelectedActivities(updatedActivities);
    onActivitiesChange?.(updatedActivities);
  };
  
  const addExtraActivity = () => {
    if (!currentExtraActivity.trim()) return;
    
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: currentExtraActivity,
      percentage: 0,
      startDate: today,
      endDate: null
    };
    
    const updatedActivities = [...selectedActivities, newActivity];
    setSelectedActivities(updatedActivities);
    onActivitiesChange?.(updatedActivities);
    setCurrentExtraActivity("");
  };

  return (
    <div className="space-y-4">
      {isExtra ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Descrição da atividade extra"
            value={currentExtraActivity}
            onChange={(e) => setCurrentExtraActivity(e.target.value)}
            className={cn(
              "flex-1",
              resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
            )}
          />
          <Button
            type="button"
            onClick={addExtraActivity}
            variant="default"
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap"
          >
            <Plus className="mr-1 h-4 w-4" />
            Adicionar Atividade Extra
          </Button>
        </div>
      ) : (
        <Select onValueChange={handleActivitySelect}>
          <SelectTrigger className={cn(
            "w-full",
            resolvedTheme === "dark" 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-300"
          )}>
            <SelectValue placeholder="Selecionar Atividade" />
          </SelectTrigger>
          <SelectContent>
            {preRegisteredActivities.map((activity) => (
              <SelectItem key={activity.id} value={activity.id}>
                {activity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {selectedActivities.length > 0 && (
        <div className="space-y-2">
          {selectedActivities.map((activity) => (
            <div
              key={activity.id}
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-2 items-center p-2 rounded-md",
                resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
              )}
            >
              <div className="flex flex-col">
                <div className="font-medium">{activity.name}</div>
                <div className="text-xs text-gray-500">
                  {activity.startDate && `Início: ${activity.startDate}`}
                  {activity.endDate && ` | Fim: ${activity.endDate}`}
                </div>
              </div>
              <div className="flex justify-end">
                <Select
                  value={activity.percentage.toString()}
                  onValueChange={(value) => handlePercentageChange(activity.id, parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="0%" />
                  </SelectTrigger>
                  <SelectContent>
                    {percentageOptions.map((percent) => (
                      <SelectItem key={percent} value={percent.toString()}>
                        {percent}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
