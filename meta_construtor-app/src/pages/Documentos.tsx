import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentoExpandableCard } from "@/components/DocumentoExpandableCard";
import { FileText, Search, Plus, Upload } from "lucide-react";

const Documentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedObra, setSelectedObra] = useState("all");
  const [selectedTipo, setSelectedTipo] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const documentos = [
    {
      id: 1,
      nome: "Projeto Estrutural - Residencial Vista Verde",
      tipo: "Projeto",
      obra: "Residencial Vista Verde",
      arquivo: "projeto_estrutural_vista_verde.pdf",
      tamanho: "15.2 MB",
      dataUpload: "2024-01-10",
      autor: "Eng. João Silva",
      versao: "v2.1",
      status: "Aprovado",
      descricao: "Projeto estrutural completo do empreendimento"
    },
    {
      id: 2,
      nome: "Licença de Construção - Comercial Center Norte",
      tipo: "Licença",
      obra: "Comercial Center Norte",
      arquivo: "licenca_construcao_center_norte.pdf",
      tamanho: "3.8 MB",
      dataUpload: "2024-01-08",
      autor: "Prefeitura Municipal",
      versao: "v1.0",
      status: "Válido",
      descricao: "Licença de construção emitida pela prefeitura"
    },
    {
      id: 3,
      nome: "Relatório de Inspeção - Ponte Rio Azul",
      tipo: "Relatório",
      obra: "Ponte Rio Azul",
      arquivo: "relatorio_inspecao_ponte_azul.pdf",
      tamanho: "8.5 MB",
      dataUpload: "2024-01-12",
      autor: "Eng. Carlos Lima",
      versao: "v1.3",
      status: "Em Revisão",
      descricao: "Relatório de inspeção estrutural mensal"
    },
    {
      id: 4,
      nome: "Memorial Descritivo - Hospital Regional Sul",
      tipo: "Memorial",
      obra: "Hospital Regional Sul",
      arquivo: "memorial_descritivo_hospital_sul.pdf",
      tamanho: "12.1 MB",
      dataUpload: "2024-01-14",
      autor: "Eng. Ana Costa",
      versao: "v1.0",
      status: "Em Elaboração",
      descricao: "Memorial descritivo dos sistemas hospitalares"
    },
    {
      id: 5,
      nome: "Cronograma Físico-Financeiro",
      tipo: "Cronograma",
      obra: "Residencial Vista Verde",
      arquivo: "cronograma_fisico_financeiro.xlsx",
      tamanho: "2.1 MB",
      dataUpload: "2024-01-15",
      autor: "Eng. João Silva",
      versao: "v3.0",
      status: "Atualizado",
      descricao: "Cronograma atualizado com marcos de pagamento"
    }
  ];

  const obras = [
    { id: 1, nome: "Residencial Vista Verde" },
    { id: 2, nome: "Comercial Center Norte" },
    { id: 3, nome: "Ponte Rio Azul" },
    { id: 4, nome: "Hospital Regional Sul" }
  ];

  const tiposDocumento = [
    "Projeto",
    "Licença",
    "Relatório",
    "Memorial",
    "Cronograma",
    "Contrato",
    "Certificado",
    "Laudo"
  ];

  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = documento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObra = !selectedObra || selectedObra === "all" || documento.obra === selectedObra;
    const matchesTipo = !selectedTipo || selectedTipo === "all" || documento.tipo === selectedTipo;
    
    return matchesSearch && matchesObra && matchesTipo;
  });

  const handleEditDocumento = (documento: any) => {
    console.log("Editando documento:", documento);
    // Implementar lógica de edição
  };

  const handleDeleteDocumento = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      console.log("Excluindo documento:", id);
      // Implementar lógica de exclusão
    }
  };

  const handleDownloadDocumento = (documento: any) => {
    console.log("Baixando documento:", documento);
    // Implementar lógica de download
  };

  const handleViewDocumento = (documento: any) => {
    console.log("Visualizando documento:", documento);
    // Implementar lógica de visualização
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestão de Documentos</h1>
          <p className="text-muted-foreground text-sm md:text-base">Centralize e organize todos os documentos das obras</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Upload de Documento</DialogTitle>
              <DialogDescription>
                Faça upload de um novo documento para a obra
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Documento</Label>
                <Input id="nome" placeholder="Ex: Projeto Estrutural - Bloco A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Documento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposDocumento.map((tipo) => (
                        <SelectItem key={tipo} value={tipo.toLowerCase()}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obra">Obra</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                    <SelectContent>
                      {obras.map((obra) => (
                        <SelectItem key={obra.id} value={obra.nome}>
                          {obra.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, XLS, JPG, PNG (máx. 50MB)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input id="descricao" placeholder="Breve descrição do documento" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="versao">Versão</Label>
                <Input id="versao" placeholder="Ex: v1.0" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="gradient-construction border-0" onClick={() => setIsDialogOpen(false)}>
                Fazer Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, tipo ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Obra</Label>
          <Select value={selectedObra} onValueChange={setSelectedObra}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as obras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as obras</SelectItem>
              {obras.map((obra) => (
                <SelectItem key={obra.id} value={obra.nome}>
                  {obra.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo de Documento</Label>
          <Select value={selectedTipo} onValueChange={setSelectedTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {tiposDocumento.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex items-end">
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setSelectedObra("all");
              setSelectedTipo("all");
            }}
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredDocumentos.map((documento) => (
          <DocumentoExpandableCard
            key={documento.id}
            documento={documento}
            onEdit={handleEditDocumento}
            onDelete={handleDeleteDocumento}
            onDownload={handleDownloadDocumento}
            onView={handleViewDocumento}
          />
        ))}
      </div>

      {filteredDocumentos.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-card-foreground">Nenhum documento encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || selectedObra || selectedTipo 
              ? "Tente ajustar os filtros de busca" 
              : "Comece fazendo upload do seu primeiro documento"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Documentos;