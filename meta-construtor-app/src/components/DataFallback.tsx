import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, Database, RefreshCw } from 'lucide-react';

interface DataFallbackProps {
  type: 'rdos' | 'checklists' | 'obras';
  onRetry?: () => void;
  showExampleData?: boolean;
}

export function DataFallback({ type, onRetry, showExampleData = true }: DataFallbackProps) {
  const getTitle = () => {
    switch (type) {
      case 'rdos':
        return 'RDOs não encontrados';
      case 'checklists':
        return 'Checklists não encontrados';
      case 'obras':
        return 'Obras não encontradas';
      default:
        return 'Dados não encontrados';
    }
  };

  const getDescription = () => {
    return 'Não foi possível carregar os dados. Verifique se as tabelas do banco de dados estão configuradas corretamente.';
  };

  const getExampleData = () => {
    switch (type) {
      case 'rdos':
        return [
          {
            id: 'example-1',
            obra: 'Shopping Center Norte',
            data: '20/01/2024',
            responsavel: 'João Silva',
            status: 'enviado'
          },
          {
            id: 'example-2',
            obra: 'Residencial Jardins',
            data: '21/01/2024',
            responsavel: 'Maria Santos',
            status: 'aprovado'
          }
        ];
      case 'checklists':
        return [
          {
            id: 'example-1',
            obra: 'Shopping Center Norte',
            data: '20/01/2024',
            responsavel: 'João Silva',
            percentual: 85
          },
          {
            id: 'example-2',
            obra: 'Residencial Jardins',
            data: '21/01/2024',
            responsavel: 'Maria Santos',
            percentual: 92
          }
        ];
      case 'obras':
        return [
          {
            id: 'example-1',
            nome: 'Shopping Center Norte',
            endereco: 'Av. Principal, 1000',
            status: 'ativa'
          },
          {
            id: 'example-2',
            nome: 'Residencial Jardins',
            endereco: 'Rua das Flores, 200',
            status: 'ativa'
          }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Aviso principal */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <AlertCircle className="h-5 w-5" />
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-orange-700 dark:text-orange-300">
            {getDescription()}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-orange-300 text-orange-800 dark:text-orange-200">
              <Database className="h-3 w-3 mr-1" />
              Problema de conectividade
            </Badge>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="border-orange-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dados de exemplo */}
      {showExampleData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Dados de Exemplo</h3>
            <Badge variant="secondary">Preview</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getExampleData().map((item: any) => (
              <Card key={item.id} className="opacity-60">
                <CardContent className="p-4">
                  {type === 'rdos' && (
                    <div className="space-y-2">
                      <div className="font-medium">{item.obra}</div>
                      <div className="text-sm text-muted-foreground">{item.data}</div>
                      <div className="text-sm">Responsável: {item.responsavel}</div>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  )}
                  
                  {type === 'checklists' && (
                    <div className="space-y-2">
                      <div className="font-medium">{item.obra}</div>
                      <div className="text-sm text-muted-foreground">{item.data}</div>
                      <div className="text-sm">Responsável: {item.responsavel}</div>
                      <div className="text-sm">Progresso: {item.percentual}%</div>
                    </div>
                  )}
                  
                  {type === 'obras' && (
                    <div className="space-y-2">
                      <div className="font-medium">{item.nome}</div>
                      <div className="text-sm text-muted-foreground">{item.endereco}</div>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Os dados acima são apenas exemplos. Execute as migrações do banco de dados para ver dados reais.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 