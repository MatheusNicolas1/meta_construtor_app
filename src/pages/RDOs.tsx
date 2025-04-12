
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, Download, Eye, Cloud, Users, BarChart2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";

// Generate mock data for demonstration
const generateMockRDOs = () => {
  const rdos = [];
  const startDate = new Date('2025-04-05');
  
  for (let i = 1; i <= 25; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - (i - 1));
    
    rdos.push({
      id: i,
      name: `RDO #${String(i).padStart(3, '0')}`,
      date: date.toLocaleDateString('pt-BR'),
      weather: `${Math.floor(Math.random() * 10) + 15}°C - ${i % 3 === 0 ? 'Chuvoso' : i % 3 === 1 ? 'Nublado' : 'Ensolarado'}`,
      teamCount: Math.floor(Math.random() * 5) + 1,
      progress: Math.floor(Math.random() * 70) + 20,
      obraName: `Obra ${i % 3 === 0 ? 'Residencial XYZ' : i % 3 === 1 ? 'Comercial ABC' : 'Industrial DEF'}`
    });
  }
  
  return rdos;
};

const RDOs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mockRDOs] = useState(generateMockRDOs());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 20;
  
  // Filter RDOs based on search query
  const filteredRDOs = mockRDOs.filter(rdo => {
    const searchLower = searchQuery.toLowerCase();
    return (
      rdo.name.toLowerCase().includes(searchLower) ||
      rdo.obraName.toLowerCase().includes(searchLower) ||
      rdo.date.toLowerCase().includes(searchLower)
    );
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredRDOs.length / itemsPerPage);
  const currentRDOs = filteredRDOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleDownload = (id: number) => {
    toast({
      title: "Download iniciado",
      description: `O RDO #${String(id).padStart(3, '0')} está sendo baixado.`
    });
  };
  
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RDOs</h1>
          <p className="text-meta-gray-dark dark:text-meta-gray mt-1">Relatórios Diários de Obra</p>
        </div>
        <Button 
          onClick={() => navigate('/app/rdos/new')} 
          className="bg-meta-orange hover:bg-meta-orange/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo RDO
        </Button>
      </div>
      
      {/* Search field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar RDO por projeto ou data"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="pl-9"
        />
      </div>
      
      {currentRDOs.length > 0 ? (
        <>
          {/* Desktop view: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Data</th>
                  <th className="text-left py-3 px-4">Clima</th>
                  <th className="text-left py-3 px-4">Equipe</th>
                  <th className="text-left py-3 px-4">Progresso</th>
                  <th className="text-right py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentRDOs.map((rdo) => (
                  <tr key={rdo.id} className="border-b border-border hover:bg-background/50">
                    <td className="py-3 px-4">{rdo.name} <span className="text-sm text-meta-gray-dark dark:text-meta-gray">({rdo.obraName})</span></td>
                    <td className="py-3 px-4">{rdo.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-blue-400" />
                        {rdo.weather}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        {rdo.teamCount} colaboradores
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-meta-orange" />
                        {rdo.progress}% concluído
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          className="bg-meta-orange hover:bg-meta-orange/90"
                          onClick={() => navigate(`/app/rdos/${rdo.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Acessar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(rdo.id)}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Baixar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile view: Cards */}
          <div className="md:hidden space-y-4">
            {currentRDOs.map((rdo) => (
              <Card key={rdo.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{rdo.name}</h3>
                      <p className="text-sm text-meta-gray-dark dark:text-meta-gray">{rdo.obraName}</p>
                    </div>
                    <span className="text-sm bg-primary/10 px-2 py-0.5 rounded-full">
                      {rdo.date}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-blue-400" />
                      <span>{rdo.weather}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>{rdo.teamCount} colaboradores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-meta-orange" />
                      <span>{rdo.progress}% concluído</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      size="sm" 
                      className="bg-meta-orange hover:bg-meta-orange/90 w-full"
                      onClick={() => navigate(`/app/rdos/${rdo.id}`)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Acessar RDO
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDownload(rdo.id)}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Baixar RDO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination for both views */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  // Only show current page, first, last, and pages close to current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            goToPage(pageNumber);
                          }}
                          isActive={pageNumber === currentPage}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <PaginationItem key={pageNumber}>...</PaginationItem>;
                  } else {
                    return null;
                  }
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="border border-dashed border-meta-gray rounded-lg p-8 text-center">
          {searchQuery ? (
            <p className="text-meta-gray-dark mb-4">Nenhum RDO encontrado para "{searchQuery}"</p>
          ) : (
            <p className="text-meta-gray-dark mb-4">Nenhum RDO cadastrado</p>
          )}
          <Button 
            onClick={() => navigate('/app/rdos/new')} 
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar RDO
          </Button>
        </div>
      )}
    </div>
  );
};

export default RDOs;
