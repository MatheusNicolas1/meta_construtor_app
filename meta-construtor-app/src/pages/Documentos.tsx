
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, Image, Download, Eye, Trash2, Plus, Search, FolderOpen } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

interface Documento {
  id: number;
  nome: string;
  tipo: 'planta' | 'laudo' | 'contrato' | 'art' | 'imagem' | 'outros';
  obra: string;
  dataUpload: string;
  tamanho: string;
  categoria: string;
  autor: string;
}

export default function Documentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([
    {
      id: 1,
      nome: 'Planta Baixa - Pavimento Térreo.pdf',
      tipo: 'planta',
      obra: 'Shopping Center Norte',
      dataUpload: '2024-01-15',
      tamanho: '2.3 MB',
      categoria: 'Projeto Arquitetônico',
      autor: 'João Silva'
    },
    {
      id: 2,
      nome: 'Laudo Técnico - Fundações.pdf',
      tipo: 'laudo',
      obra: 'Residencial Jardins',
      dataUpload: '2024-01-10',
      tamanho: '1.8 MB',
      categoria: 'Laudos Técnicos',
      autor: 'Maria Santos'
    },
    {
      id: 3,
      nome: 'ART - Responsabilidade Técnica.pdf',
      tipo: 'art',
      obra: 'Torre Empresarial',
      dataUpload: '2024-01-08',
      tamanho: '0.5 MB',
      categoria: 'Documentos Legais',
      autor: 'Carlos Oliveira'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroObra, setFiltroObra] = useState('all');
  const [filtroTipo, setFiltroTipo] = useState('all');
  const [busca, setBusca] = useState('');

  const obras = [
    'Shopping Center Norte',
    'Residencial Jardins',
    'Torre Empresarial'
  ];

  const tiposDocumento = [
    { valor: 'planta', label: 'Plantas', icon: '📐' },
    { valor: 'laudo', label: 'Laudos', icon: '📋' },
    { valor: 'contrato', label: 'Contratos', icon: '📄' },
    { valor: 'art', label: 'ARTs', icon: '🏗️' },
    { valor: 'imagem', label: 'Imagens', icon: '🖼️' },
    { valor: 'outros', label: 'Outros', icon: '📁' }
  ];

  const categorias = [
    'Projeto Arquitetônico',
    'Projeto Estrutural',
    'Projeto Elétrico',
    'Projeto Hidráulico',
    'Laudos Técnicos',
    'Documentos Legais',
    'Contratos',
    'Fotos da Obra',
    'Outros'
  ];

  const documentosFiltrados = documentos.filter(doc => {
    const matchObra = filtroObra === 'all' || doc.obra === filtroObra;
    const matchTipo = filtroTipo === 'all' || doc.tipo === filtroTipo;
    const matchBusca = !busca || doc.nome.toLowerCase().includes(busca.toLowerCase());
    return matchObra && matchTipo && matchBusca;
  });

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUploading(true);
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Adicionar novo documento
    const novoDocumento: Documento = {
      id: documentos.length + 1,
      nome: `Documento-${Date.now()}.pdf`,
      tipo: 'outros',
      obra: obras[0],
      dataUpload: new Date().toISOString().split('T')[0],
      tamanho: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      categoria: 'Outros',
      autor: 'Usuário Atual'
    };
    
    setDocumentos([novoDocumento, ...documentos]);
    setIsUploading(false);
    setIsDialogOpen(false);
  };

  const handleDownload = async (documentoId: number) => {
    setIsLoading(true);
    console.log(`Fazendo download do documento ${documentoId}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleDelete = async (documentoId: number) => {
    setIsLoading(true);
    console.log(`Excluindo documento ${documentoId}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDocumentos(documentos.filter(doc => doc.id !== documentoId));
    setIsLoading(false);
  };

  const getIconByType = (tipo: string) => {
    const tipoObj = tiposDocumento.find(t => t.valor === tipo);
    return tipoObj?.icon || '📄';
  };

  const getTipoLabel = (tipo: string) => {
    const tipoObj = tiposDocumento.find(t => t.valor === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
            <p className="text-muted-foreground">Gerencie todos os documentos das suas obras</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Upload de Documento</DialogTitle>
                <DialogDescription>
                  Faça upload de um novo documento para a obra
                </DialogDescription>
              </DialogHeader>
              {isUploading ? (
                <div className="py-8">
                  <LoadingSpinner size="lg" text="Fazendo upload do documento..." />
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="obra">Obra</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a obra" />
                        </SelectTrigger>
                        <SelectContent>
                          {obras.map((obra) => (
                            <SelectItem key={obra} value={obra}>
                              {obra}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposDocumento.map((tipo) => (
                            <SelectItem key={tipo.valor} value={tipo.valor}>
                              <div className="flex items-center gap-2">
                                <span>{tipo.icon}</span>
                                <span>{tipo.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="arquivo">Arquivo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Clique para selecionar ou arraste o arquivo aqui
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos aceitos: PDF, JPG, PNG, DOC, XLS (máx. 50MB)
                      </p>
                      <Input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Fazer Upload
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="busca">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="busca"
                    placeholder="Nome do documento..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="filtro-obra">Obra</Label>
                <Select value={filtroObra} onValueChange={setFiltroObra}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as obras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as obras</SelectItem>
                    {obras.map((obra) => (
                      <SelectItem key={obra} value={obra}>
                        {obra}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filtro-tipo">Tipo</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {tiposDocumento.map((tipo) => (
                      <SelectItem key={tipo.valor} value={tipo.valor}>
                        <div className="flex items-center gap-2">
                          <span>{tipo.icon}</span>
                          <span>{tipo.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFiltroObra('all');
                    setFiltroTipo('all');
                    setBusca('');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Documentos ({documentosFiltrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentosFiltrados.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-12 w-12" />}
                title="Nenhum documento encontrado"
                description="Não foram encontrados documentos com os filtros aplicados. Tente ajustar os filtros ou faça upload de novos documentos."
                actionLabel="Limpar Filtros"
                onAction={() => {
                  setFiltroObra('all');
                  setFiltroTipo('all');
                  setBusca('');
                }}
              />
            ) : (
              <div className="space-y-4">
                {documentosFiltrados.map((documento) => (
                  <div key={documento.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {getIconByType(documento.tipo)}
                      </div>
                      <div>
                        <h4 className="font-medium">{documento.nome}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <Badge variant="outline">{getTipoLabel(documento.tipo)}</Badge>
                          <span>Obra: {documento.obra}</span>
                          <span>Autor: {documento.autor}</span>
                          <span>Tamanho: {documento.tamanho}</span>
                          <span>Upload: {new Date(documento.dataUpload).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(documento.id)}
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(documento.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
