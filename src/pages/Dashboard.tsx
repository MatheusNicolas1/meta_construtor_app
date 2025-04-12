
import { PlanDisplay } from "@/components/PlanDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlans } from "@/hooks/usePlans";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react"; 
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// Mock data for active obras
const mockObras = [
  { id: 1, name: "Construção Residencial XYZ", progress: 60 },
  { id: 2, name: "Reforma Comercial ABC", progress: 30 },
  { id: 3, name: "Ampliação Industrial DEF", progress: 85 },
];

// Mock data for recent RDOs
const mockRDOs = [
  { id: 1, name: "RDO #001 - Construção Residencial XYZ", date: "05/04/2025", obraId: 1 },
  { id: 2, name: "RDO #002 - Reforma Comercial ABC", date: "04/04/2025", obraId: 2 },
  { id: 3, name: "RDO #003 - Construção Residencial XYZ", date: "03/04/2025", obraId: 1 },
];

const Dashboard = () => {
  const { userProfile } = usePlans();
  const [obrasStats, setObrasStats] = useState({ active: 0, completed: 0 });
  const [atividadesStats, setAtividadesStats] = useState({ total: 0, completed: 0 });
  
  useEffect(() => {
    // Fetch obras count
    const fetchObrasStats = async () => {
      try {
        const { data: activeObras, error: activeError } = await supabase
          .from('obras')
          .select('id')
          .eq('status', 'active');
          
        const { data: completedObras, error: completedError } = await supabase
          .from('obras')
          .select('id')
          .eq('status', 'completed');
        
        if (!activeError && !completedError) {
          setObrasStats({
            active: activeObras?.length || 0,
            completed: completedObras?.length || 0
          });
        }
      } catch (error) {
        console.error("Error fetching obras stats:", error);
      }
    };
    
    // Simulate fetching atividades stats
    const fetchAtividadesStats = () => {
      setAtividadesStats({
        total: 5,
        completed: 2
      });
    };
    
    fetchObrasStats();
    fetchAtividadesStats();
  }, []);
  
  // Calculate remaining activities percentage
  const remainingActivitiesPercentage = atividadesStats.total > 0 
    ? Math.round((atividadesStats.total - atividadesStats.completed) / atividadesStats.total * 100) 
    : 0;
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plan information card */}
        <PlanDisplay />
        
        {/* Updated Obras card */}
        <Card>
          <CardHeader>
            <CardTitle>Obras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p>
                <span className="text-lg font-bold">Ativas: {obrasStats.active}</span> | 
                <span className="ml-2">Finalizadas: {obrasStats.completed}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Atividades card */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{atividadesStats.total} a fazer</span> | 
              <span className="ml-2">{atividadesStats.completed} executadas</span> | 
              <span className="ml-2 font-medium">{remainingActivitiesPercentage}% restante</span>
            </p>
            <Progress value={100 - remainingActivitiesPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content - Obras Ativas and RDOs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Obras Ativas List */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Obras Ativas</CardTitle>
              <p className="text-sm text-muted-foreground">{mockObras.length} obras em andamento</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockObras.map((obra) => (
                <div key={obra.id} className="border rounded-md p-4 bg-background/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{obra.name}</h3>
                    <span className="text-sm bg-primary/10 px-2 py-0.5 rounded-full">
                      {obra.progress}% concluído
                    </span>
                  </div>
                  <Progress value={obra.progress} className="h-2 mb-3" />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      className="bg-meta-orange hover:bg-meta-orange/90"
                      onClick={() => window.location.href = `/app/obras/${obra.id}`}
                    >
                      Ver Detalhes <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Últimos RDOs Gerados List */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimos RDOs Gerados</CardTitle>
              <p className="text-sm text-muted-foreground">{mockRDOs.length} RDOs recentes</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRDOs.map((rdo) => (
                <div key={rdo.id} className="border rounded-md p-4 bg-background/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{rdo.name}</h3>
                    <span className="text-sm bg-primary/10 px-2 py-0.5 rounded-full">
                      {rdo.date}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      className="bg-meta-orange hover:bg-meta-orange/90"
                      onClick={() => window.location.href = `/app/rdos/${rdo.id}`}
                    >
                      Ver RDO <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Welcome message */}
      <div className="pt-4">
        <p className="text-muted-foreground">
          Bem-vindo(a) {userProfile?.name ? `${userProfile.name}` : ''} ao MetaConstrutor! 
          Utilize o menu lateral para navegar pelas funcionalidades do sistema.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
