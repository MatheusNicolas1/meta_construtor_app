import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Search, MoreHorizontal, Calendar, Users, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for demonstration
const mockProjects = [
  { 
    id: 1, 
    name: "Residencial Vista Mar", 
    client: "Construtora Oceano",
    location: "Santos, SP",
    startDate: "2023-03-15",
    deadline: "2023-12-10",
    progress: 68, 
    team: 8,
    status: "Em andamento" 
  },
  { 
    id: 2, 
    name: "Comercial Centro Empresarial", 
    client: "Incorporadora Horizonte",
    location: "São Paulo, SP",
    startDate: "2023-04-22",
    deadline: "2024-02-28",
    progress: 42, 
    team: 12,
    status: "Em andamento" 
  },
  { 
    id: 3, 
    name: "Reforma Apto 301", 
    client: "Maria Silva",
    location: "Rio de Janeiro, RJ",
    startDate: "2023-05-08",
    deadline: "2023-07-01",
    progress: 95, 
    team: 4,
    status: "Finalização" 
  },
  { 
    id: 4, 
    name: "Edifício Parque Verde", 
    client: "Construtora Natura",
    location: "Belo Horizonte, MG",
    startDate: "2023-01-10",
    deadline: "2024-06-30",
    progress: 35, 
    team: 15,
    status: "Em andamento" 
  },
];

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter projects based on search query
  const filteredProjects = mockProjects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date to brazilian format (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="text-meta-gray-dark mt-1">Gerencie seus projetos de construção</p>
        </div>
        <Button asChild className="bg-meta-orange hover:bg-meta-orange/90">
          <Link to="/projects/new" className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-meta-gray-dark h-4 w-4" />
          <Input
            placeholder="Buscar projetos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Projects grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Nenhum projeto encontrado</h2>
          <p className="text-meta-gray-dark mt-2">Tente ajustar sua busca ou criar um novo projeto</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{project.name}</h3>
                      <p className="text-meta-gray-dark text-sm">{project.client}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Link to="/rdos/new" className="flex items-center">
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Novo RDO
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-meta-gray-dark" />
                      <span>
                        {formatDate(project.startDate)} - {formatDate(project.deadline)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-meta-gray-dark" />
                      <span>{project.team} pessoas na equipe</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm bg-meta-blue/10 text-meta-blue px-2 py-0.5 rounded-full">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === "Em andamento" 
                        ? "bg-blue-100 text-blue-700"
                        : project.status === "Finalização"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {project.status}
                    </span>

                    <Button asChild size="sm" variant="outline">
                      <Link to={`/projects/${project.id}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
