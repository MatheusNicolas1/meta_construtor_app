import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from "@/locales/translations";

type Obra = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress?: number;
  location?: string;
  start_date?: string;
};

const Obras = () => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = useTranslation(locale);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Listen for localStorage events for new works (mock for demonstration)
  useEffect(() => {
    const handleStorageChange = () => {
      const newObra = localStorage.getItem('newObra');
      if (newObra) {
        try {
          const obraData = JSON.parse(newObra);
          setObras(prevObras => [
            {
              id: `obra-${Date.now()}`,
              name: obraData.name,
              description: obraData.description || null,
              status: 'active',
              progress: 0,
              location: obraData.location,
              start_date: obraData.startDate
            },
            ...prevObras
          ]);
          localStorage.removeItem('newObra');
        } catch (error) {
          console.error('Erro ao processar nova obra:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const fetchObras = async () => {
    try {
      setLoading(true);
      let query = supabase.from('obras').select('*');
      
      // We'll handle filtering in JS after getting data
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Add mock progress for now - in real app this would come from RDOs or tasks
        const obrasWithProgress = data.map(obra => ({
          ...obra,
          progress: Math.floor(Math.random() * 100) // Mock progress
        }));
        
        // Add some mock works for testing
        if (obrasWithProgress.length === 0) {
          const mockObras = [
            {
              id: 'obra-1',
              name: 'Residencial Vista Mar',
              description: 'Edifício residencial de alto padrão à beira-mar',
              status: 'active',
              progress: 60,
              location: 'Santos, SP',
              start_date: '2024-12-01'
            },
            {
              id: 'obra-2',
              name: 'Centro Empresarial NexTech',
              description: 'Complexo empresarial com 5 torres',
              status: 'active',
              progress: 30,
              location: 'São Paulo, SP',
              start_date: '2024-10-15'
            },
            {
              id: 'obra-3',
              name: 'Edifício Solaris',
              description: 'Edifício residencial com 15 andares',
              status: 'completed',
              progress: 100,
              location: 'Campinas, SP',
              start_date: '2024-08-20'
            },
            {
              id: 'obra-4',
              name: 'Residencial Mar Azul',
              description: 'Condomínio de casas de luxo',
              status: 'completed',
              progress: 100,
              location: 'Florianópolis, SC',
              start_date: '2023-05-10'
            }
          ];
          setObras(mockObras);
        } else {
          setObras(obrasWithProgress);
        }
      }
    } catch (error) {
      console.error("Error fetching obras:", error);
      // Add mock works in case of error
      const mockObras = [
        {
          id: 'obra-1',
          name: 'Residencial Vista Mar',
          description: 'Edifício residencial de alto padrão à beira-mar',
          status: 'active',
          progress: 60,
          location: 'Santos, SP',
          start_date: '2024-12-01'
        },
        {
          id: 'obra-2',
          name: 'Centro Empresarial NexTech',
          description: 'Complexo empresarial com 5 torres',
          status: 'active',
          progress: 30,
          location: 'São Paulo, SP',
          start_date: '2024-10-15'
        },
        {
          id: 'obra-3',
          name: 'Edifício Solaris',
          description: 'Edifício residencial com 15 andares',
          status: 'completed',
          progress: 100,
          location: 'Campinas, SP',
          start_date: '2024-08-20'
        },
        {
          id: 'obra-4',
          name: 'Residencial Mar Azul',
          description: 'Condomínio de casas de luxo',
          status: 'completed',
          progress: 100,
          location: 'Florianópolis, SC',
          start_date: '2023-05-10'
        }
      ];
      setObras(mockObras);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchObras();
    
    // Setup subscription for real-time updates
    const subscription = supabase
      .channel('obras-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'obras' }, 
        fetchObras
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Filter works based on search term and status filter
  const filteredObras = obras.filter(obra => {
    // Text search filter
    const matchesSearch = 
      obra.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (obra.description && obra.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = obra.status === "active" || obra.progress! < 100;
    } else if (statusFilter === "completed") {
      matchesStatus = obra.status === "completed" || obra.progress === 100;
    }
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status: string, progress?: number) => {
    // Consider work completed if progress is 100%
    const isCompleted = status === 'completed' || progress === 100;
    
    if (!isCompleted) {
      return <Badge className="bg-green-500">{locale === 'pt-BR' ? 'Ativa' : locale === 'en-US' ? 'Active' : 'Activa'}</Badge>;
    } else {
      return <Badge className="bg-blue-500">{locale === 'pt-BR' ? 'Finalizada' : locale === 'en-US' ? 'Completed' : 'Finalizada'}</Badge>;
    }
  };
  
  // Mock handling of new work when user returns from registration page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const newObraFromStorage = sessionStorage.getItem('newObraCadastrada');
        if (newObraFromStorage === 'true') {
          toast.success(locale === 'pt-BR' ? 'Obra cadastrada com sucesso!' : 
                       locale === 'en-US' ? 'Work registered successfully!' : 
                       '¡Obra registrada con éxito!');
          sessionStorage.removeItem('newObraCadastrada');
          fetchObras(); // Reload works to show the new one (in a real environment, this would be done via supabase subscription)
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [locale]);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.workPage.title}</h1>
          <p className="text-meta-gray-dark dark:text-meta-gray mt-1">{t.workPage.subtitle}</p>
        </div>
        <Button 
          onClick={() => navigate('/obras/cadastrar')} 
          className="bg-meta-orange hover:bg-meta-orange/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t.workPage.newWork}
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-meta-gray-dark" />
          <Input
            placeholder={t.workPage.search}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className={statusFilter === "all" ? "bg-meta-blue hover:bg-meta-blue/90" : ""}
          >
            {t.workPage.all}
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            className={statusFilter === "active" ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {t.workPage.active}
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
            className={statusFilter === "completed" ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            {t.workPage.completed}
          </Button>
        </div>
      </div>
      
      {/* Obras list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-meta-orange mx-auto" />
        </div>
      ) : filteredObras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObras.map((obra) => (
            <Card 
              key={obra.id} 
              className="cursor-pointer hover:border-meta-orange transition-colors"
              onClick={() => navigate(`/obras/${obra.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{obra.name}</h3>
                  {getStatusBadge(obra.status, obra.progress)}
                </div>
                
                {obra.description && (
                  <p className="text-sm text-meta-gray-dark dark:text-meta-gray mb-4 line-clamp-2">
                    {obra.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{locale === 'pt-BR' ? 'Progresso' : locale === 'en-US' ? 'Progress' : 'Progreso'}</span>
                    <span className="font-medium">{obra.progress}%</span>
                  </div>
                  <Progress value={obra.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-meta-gray rounded-lg p-8 text-center flex flex-col items-center justify-center">
          <p className="text-meta-gray-dark mb-4">{t.workPage.noWorks}</p>
          <Button 
            onClick={() => navigate('/obras/cadastrar')} 
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t.workPage.addWork}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Obras;
