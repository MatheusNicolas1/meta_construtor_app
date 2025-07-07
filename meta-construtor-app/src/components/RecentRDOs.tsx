
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RDO {
  id: string;
  nomeObra: string;
  dataEnvio: string;
  horario: string;
  equipeResponsavel: string;
  status: 'em_analise' | 'aprovado' | 'pendente' | 'rejeitado';
}

const rdosRecentes: RDO[] = [
  {
    id: '1',
    nomeObra: 'Shopping Center Norte',
    dataEnvio: '04/07/2025',
    horario: '14:30',
    equipeResponsavel: 'Equipe Alpha',
    status: 'aprovado'
  },
  {
    id: '2',
    nomeObra: 'Residencial Jardins',
    dataEnvio: '04/07/2025',
    horario: '13:15',
    equipeResponsavel: 'Equipe Beta',
    status: 'em_analise'
  },
  {
    id: '3',
    nomeObra: 'Torre Empresarial',
    dataEnvio: '04/07/2025',
    horario: '11:45',
    equipeResponsavel: 'Equipe Gamma',
    status: 'pendente'
  },
  {
    id: '4',
    nomeObra: 'Shopping Center Norte',
    dataEnvio: '03/07/2025',
    horario: '16:20',
    equipeResponsavel: 'Equipe Delta',
    status: 'aprovado'
  },
  {
    id: '5',
    nomeObra: 'Residencial Jardins',
    dataEnvio: '03/07/2025',
    horario: '15:10',
    equipeResponsavel: 'Equipe Alpha',
    status: 'rejeitado'
  }
];

const getStatusBadge = (status: RDO['status']) => {
  const statusConfig = {
    aprovado: { label: 'Aprovado', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
    em_analise: { label: 'Em Análise', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
    pendente: { label: 'Pendente', variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' },
    rejeitado: { label: 'Rejeitado', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
  };

  return statusConfig[status];
};

export function RecentRDOs() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Últimos RDOs Cadastrados
          </CardTitle>
          <button
            onClick={() => navigate('/rdo')}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rdosRecentes.map((rdo) => {
          const statusInfo = getStatusBadge(rdo.status);
          return (
            <div
              key={rdo.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/rdo/${rdo.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-foreground">{rdo.nomeObra}</h4>
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {rdo.dataEnvio} às {rdo.horario}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {rdo.equipeResponsavel}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
