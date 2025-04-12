
import { usePlans } from "@/hooks/usePlans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const PlanDisplay = () => {
  const { userProfile, plans, isOnTrialPeriod, getDaysLeftInTrial, checkObraLimit, checkCollaboratorLimit } = usePlans();
  const [obrasUsage, setObrasUsage] = useState<{ used: number, total: number | null }>({ used: 0, total: null });
  const [collabUsage, setCollabUsage] = useState<{ used: number, total: number | null }>({ used: 0, total: null });
  
  useEffect(() => {
    const fetchUsage = async () => {
      if (userProfile?.plan) {
        // Get collaborators count
        const { count: collabCount } = await supabase
          .from('collaborators')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', userProfile.id)
          .eq('status', 'active');
          
        // Get obras count
        const { count: obrasCount } = await supabase
          .from('obras')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userProfile.id)
          .eq('status', 'active');
          
        setCollabUsage({ 
          used: collabCount || 0, 
          total: userProfile.plan.max_collaborators 
        });
        
        setObrasUsage({ 
          used: obrasCount || 0, 
          total: userProfile.plan.max_obras === 0 ? null : userProfile.plan.max_obras 
        });
      }
    };
    
    if (userProfile) {
      fetchUsage();
    }
  }, [userProfile]);
  
  if (!userProfile || !userProfile.plan) {
    return null;
  }

  const currentPlan = userProfile.plan;
  const daysLeft = getDaysLeftInTrial();
  const isTrialExpiring = daysLeft === 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>
            Plano {currentPlan.name}
            {isOnTrialPeriod() && (
              <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                Teste Grátis
              </Badge>
            )}
          </CardTitle>
          
          {!isOnTrialPeriod() && currentPlan.name !== "Premium" && (
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link to="/app/planos">
                Fazer Upgrade <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
        
        {isOnTrialPeriod() && (
          <CardDescription className="flex items-center mt-1 text-orange-700 dark:text-orange-300">
            {isTrialExpiring ? (
              <AlertTriangle className="mr-1 h-4 w-4" />
            ) : (
              <Clock className="mr-1 h-4 w-4" />
            )}
            {daysLeft === 0 
              ? "Seu período de teste termina hoje!"
              : `${daysLeft} ${daysLeft === 1 ? 'dia restante' : 'dias restantes'}`
            }
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Collaborators usage */}
        <div>
          <div className="flex justify-between text-sm">
            <span>Colaboradores</span>
            <span>{collabUsage.used}/{collabUsage.total || "∞"}</span>
          </div>
          <Progress 
            value={collabUsage.total ? (collabUsage.used / collabUsage.total) * 100 : 0} 
            className="h-2 mt-1"
          />
        </div>
        
        {/* Obras usage */}
        <div>
          <div className="flex justify-between text-sm">
            <span>Obras ativas</span>
            <span>{obrasUsage.used}/{obrasUsage.total || "∞"}</span>
          </div>
          <Progress 
            value={obrasUsage.total ? (obrasUsage.used / obrasUsage.total) * 100 : 0} 
            className="h-2 mt-1"
          />
        </div>
        
        {isOnTrialPeriod() && (
          <div className="pt-2">
            <Button asChild className="w-full" size="sm">
              <Link to="/app/planos">
                Assinar Plano Premium
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
