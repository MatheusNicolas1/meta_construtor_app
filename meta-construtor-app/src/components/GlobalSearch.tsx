import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building, FileText, Users, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  id: string;
  tipo: 'obra' | 'rdo' | 'usuario' | 'checklist';
  titulo: string;
  subtitulo: string;
  status?: string;
  data?: string;
  url: string;
  relevancia: number;
}

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className = '' }: GlobalSearchProps) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  
  const navigate = useNavigate();
  const { profile } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar resultados quando termo muda
  useEffect(() => {
    if (termo.length >= 2) {
      const timeoutId = setTimeout(() => {
        buscarResultados();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResultados([]);
      setIsOpen(false);
    }
  }, [termo, filtroTipo]);

  const buscarResultados = async () => {
    if (!termo.trim() || termo.length < 2) return;

    setIsLoading(true);
    try {
      const resultados: SearchResult[] = [];
      const termoLower = termo.toLowerCase();

      // Buscar Obras
      if (filtroTipo === 'todos' || filtroTipo === 'obra') {
        const { data: obras } = await supabase
          .from('obras')
          .select('id, nome, status, data_inicio, endereco')
          .eq('empresa_id', profile?.empresa_id)
          .ilike('nome', `%${termo}%`)
          .limit(5);

        if (obras) {
          obras.forEach(obra => {
            resultados.push({
              id: obra.id,
              tipo: 'obra',
              titulo: obra.nome,
              subtitulo: obra.endereco || 'Sem endereço',
              status: obra.status,
              data: obra.data_inicio,
              url: `/obras/${obra.id}`,
              relevancia: obra.nome.toLowerCase().includes(termoLower) ? 3 : 1
            });
          });
        }
      }

      // Buscar RDOs
      if (filtroTipo === 'todos' || filtroTipo === 'rdo') {
        const { data: rdos } = await supabase
          .from('rdos')
          .select(`
            id, 
            data_rdo, 
            condicoes_climaticas, 
            observacoes,
            obras!inner(nome, id)
          `)
          .eq('obras.empresa_id', profile?.empresa_id)
          .or(`condicoes_climaticas.ilike.%${termo}%,observacoes.ilike.%${termo}%`)
          .limit(5);

        if (rdos) {
          rdos.forEach(rdo => {
            resultados.push({
              id: rdo.id,
              tipo: 'rdo',
              titulo: `RDO - ${rdo.obras.nome}`,
              subtitulo: new Date(rdo.data_rdo).toLocaleDateString(),
              data: rdo.data_rdo,
              url: `/obras/${rdo.obras.id}?tab=rdos&rdo=${rdo.id}`,
              relevancia: 2
            });
          });
        }
      }

      // Buscar Usuários (apenas para gerentes/diretores)
      if (['gerente', 'diretor'].includes(profile?.nivel_acesso || '') && 
          (filtroTipo === 'todos' || filtroTipo === 'usuario')) {
        const { data: usuarios } = await supabase
          .from('profiles')
          .select('id, nome, cargo, email, nivel_acesso')
          .eq('empresa_id', profile?.empresa_id)
          .ilike('nome', `%${termo}%`)
          .limit(5);

        if (usuarios) {
          usuarios.forEach(usuario => {
            resultados.push({
              id: usuario.id,
              tipo: 'usuario',
              titulo: usuario.nome,
              subtitulo: `${usuario.cargo} - ${usuario.email}`,
              status: usuario.nivel_acesso,
              url: `/equipes?usuario=${usuario.id}`,
              relevancia: 1
            });
          });
        }
      }

      // Buscar Checklists
      if (filtroTipo === 'todos' || filtroTipo === 'checklist') {
        const { data: checklists } = await supabase
          .from('checklist_obra')
          .select(`
            id, 
            data_checklist, 
            percentual_conclusao,
            obras!inner(nome, id)
          `)
          .eq('obras.empresa_id', profile?.empresa_id)
          .limit(5);

        if (checklists) {
          checklists.forEach(checklist => {
            resultados.push({
              id: checklist.id,
              tipo: 'checklist',
              titulo: `Checklist - ${checklist.obras.nome}`,
              subtitulo: new Date(checklist.data_checklist).toLocaleDateString(),
              status: `${checklist.percentual_conclusao}%`,
              data: checklist.data_checklist,
              url: `/checklist?obra=${checklist.obras.id}&checklist=${checklist.id}`,
              relevancia: 1
            });
          });
        }
      }

      // Ordenar por relevância
      resultados.sort((a, b) => b.relevancia - a.relevancia);
      
      setResultados(resultados.slice(0, 8));
      setIsOpen(true);
    } catch (error) {
      console.error('Erro na busca global:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (resultado: SearchResult) => {
    navigate(resultado.url);
    setTermo('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setTermo('');
    setResultados([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'obra':
        return <Building className="h-4 w-4" />;
      case 'rdo':
        return <FileText className="h-4 w-4" />;
      case 'usuario':
        return <Users className="h-4 w-4" />;
      case 'checklist':
        return <Clock className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'ativo':
      case 'em_andamento':
        return 'bg-green-100 text-green-800';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluido':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'diretor':
        return 'bg-purple-100 text-purple-800';
      case 'gerente':
        return 'bg-orange-100 text-orange-800';
      case 'colaborador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar obras, RDOs, usuários..."
          className="pl-10 pr-20 bg-background/95 border-border focus:border-primary"
          onFocus={() => {
            if (resultados.length > 0) setIsOpen(true);
          }}
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {termo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-7 w-7 p-0 hover:bg-muted"
          >
            <Filter className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 shadow-lg border-border bg-background/95 backdrop-blur">
          <CardContent className="p-2">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
              <Button
                variant={filtroTipo === 'todos' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFiltroTipo('todos')}
                className="h-7 px-3 text-xs"
              >
                Todos
              </Button>
              <Button
                variant={filtroTipo === 'obra' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFiltroTipo('obra')}
                className="h-7 px-3 text-xs"
              >
                <Building className="h-3 w-3 mr-1" />
                Obras
              </Button>
              <Button
                variant={filtroTipo === 'rdo' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFiltroTipo('rdo')}
                className="h-7 px-3 text-xs"
              >
                <FileText className="h-3 w-3 mr-1" />
                RDOs
              </Button>
              {['gerente', 'diretor'].includes(profile?.nivel_acesso || '') && (
                <Button
                  variant={filtroTipo === 'usuario' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFiltroTipo('usuario')}
                  className="h-7 px-3 text-xs"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Usuários
                </Button>
              )}
              <Button
                variant={filtroTipo === 'checklist' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFiltroTipo('checklist')}
                className="h-7 px-3 text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                Checklists
              </Button>
            </div>

            {/* Resultados */}
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                <Search className="h-6 w-6 mx-auto mb-2 animate-spin" />
                Buscando...
              </div>
            ) : resultados.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {termo.length < 2 ? (
                  'Digite pelo menos 2 caracteres para buscar'
                ) : (
                  'Nenhum resultado encontrado'
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {resultados.map((resultado) => (
                  <div
                    key={`${resultado.tipo}-${resultado.id}`}
                    onClick={() => handleResultClick(resultado)}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 text-muted-foreground">
                        {getIcon(resultado.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {resultado.titulo}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {resultado.subtitulo}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {resultado.status && (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getStatusColor(resultado.status)}`}
                        >
                          {resultado.status}
                        </Badge>
                      )}
                      {resultado.data && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(resultado.data).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 