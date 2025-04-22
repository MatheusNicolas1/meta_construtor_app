import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Calendar, Users, ChevronRight, BarChart2, Clock, CloudRain, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Mock data for demonstration
const mockData = {
  name: "Construção Residencial XYZ",
  startDate: "01/03/2025",
  progress: 60,
  teamCount: 5,
  rdos: [
    { id: 1, name: "RDO #001", date: "05/04/2025" },
    { id: 2, name: "RDO #002", date: "04/04/2025" },
  ],
  activities: [
    { id: 1, name: "Fundações", progress: 80, date: "05/04/2025" },
    { id: 2, name: "Alvenaria", progress: 50, date: "04/04/2025" },
  ],
  analytics: {
    budget: "R$ 100.000 orçado / R$ 80.000 executado",
    idleHours: "2 horas ociosas hoje",
    weather: "18°C - Chuvoso",
  },
  photos: [
    { 
      id: 1, 
      rdoId: 1, 
      rdoName: "RDO #001", 
      date: "05/04/2025", 
      description: "Fundação concluída", 
      url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000&auto=format&fit=crop" 
    },
    { 
      id: 2, 
      rdoId: 1, 
      rdoName: "RDO #001", 
      date: "05/04/2025", 
      description: "Estrutura metálica", 
      url: "https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?q=80&w=1000&auto=format&fit=crop" 
    },
    { 
      id: 3, 
      rdoId: 2, 
      rdoName: "RDO #002", 
      date: "04/04/2025", 
      description: "Início da alvenaria", 
      url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop" 
    },
    { 
      id: 4, 
      rdoId: 2, 
      rdoName: "RDO #002", 
      date: "04/04/2025", 
      description: "Instalação elétrica", 
      url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1000&auto=format&fit=crop" 
    }
  ]
};

const ObraDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      {/* Header section with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes da Obra</h1>
          <p className="text-meta-gray-dark dark:text-meta-gray mt-1">ID: {id}</p>
        </div>
      </div>
      
      {/* Obra Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Obra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">{mockData.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-meta-orange/20 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-meta-orange" />
                </div>
                <div>
                  <p className="text-sm text-meta-gray-dark dark:text-meta-gray">Data de início</p>
                  <p className="font-medium">{mockData.startDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-meta-blue/20 p-2 rounded-full">
                  <BarChart2 className="h-5 w-5 text-meta-blue" />
                </div>
                <div>
                  <p className="text-sm text-meta-gray-dark dark:text-meta-gray">Progresso</p>
                  <div className="flex items-center gap-2">
                    <Progress value={mockData.progress} className="h-2 w-24" />
                    <span className="font-medium">{mockData.progress}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-meta-gray-dark dark:text-meta-gray">Equipe</p>
                  <p className="font-medium">{mockData.teamCount} colaboradores</p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Main content in 3 columns on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* RDOs Gerados Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">RDOs Gerados</h3>
                <span className="text-sm bg-meta-orange/20 text-meta-orange px-2 py-0.5 rounded-full">
                  {mockData.rdos.length} RDOs
                </span>
              </div>
              
              <div className="space-y-3">
                {mockData.rdos.map(rdo => (
                  <div key={rdo.id} className="p-3 border rounded-md bg-background/50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{rdo.name}</h4>
                      <span className="text-xs text-meta-gray-dark dark:text-meta-gray">{rdo.date}</span>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        className="bg-meta-orange hover:bg-meta-orange/90"
                        onClick={() => navigate(`/rdos/${rdo.id}`)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Ver RDO
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Atividades Executadas Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Atividades Executadas</h3>
                <span className="text-sm bg-meta-blue/20 text-meta-blue px-2 py-0.5 rounded-full">
                  {mockData.activities.length} atividades
                </span>
              </div>
              
              <div className="space-y-3">
                {mockData.activities.map(activity => (
                  <div key={activity.id} className="p-3 border rounded-md bg-background/50">
                    <div className="mb-2">
                      <h4 className="font-medium">{activity.name}</h4>
                      <span className="text-xs text-meta-gray-dark dark:text-meta-gray">Última atualização: {activity.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={activity.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{activity.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Análises da Obra Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Análises da Obra</h3>
                <ChevronRight className="h-5 w-5 text-meta-gray-dark dark:text-meta-gray" />
              </div>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-md bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-meta-orange/20 p-2 rounded-full">
                      <BarChart2 className="h-4 w-4 text-meta-orange" />
                    </div>
                    <div>
                      <p className="text-sm text-meta-gray-dark dark:text-meta-gray">Orçamento</p>
                      <p className="font-medium">{mockData.analytics.budget}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-meta-blue/20 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-meta-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-meta-gray-dark dark:text-meta-gray">Horas Ociosas</p>
                      <p className="font-medium">{mockData.analytics.idleHours}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-400/20 p-2 rounded-full">
                      <CloudRain className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-meta-gray-dark dark:text-meta-gray">Condição Climática</p>
                      <p className="font-medium">{mockData.analytics.weather}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Photos from RDOs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-meta-orange" />
              Fotos dos RDOs
            </CardTitle>
            <span className="text-sm bg-meta-orange/20 text-meta-orange px-2 py-0.5 rounded-full">
              {mockData.photos.length} fotos
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {mockData.photos.map(photo => (
              <div key={photo.id} className="flex flex-col h-full rounded-md border overflow-hidden bg-background/50">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={photo.description} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium line-clamp-1">{photo.description}</p>
                  </div>
                  <div className="mt-auto flex justify-between items-center text-xs text-meta-gray-dark dark:text-meta-gray">
                    <span>{photo.rdoName}</span>
                    <span>{photo.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ObraDetalhe;
