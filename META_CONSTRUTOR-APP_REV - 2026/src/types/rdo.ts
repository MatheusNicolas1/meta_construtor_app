// Status do RDO para fluxo de aprovação
export type RDOStatus = 'Em elaboração' | 'Aguardando aprovação' | 'Aprovado' | 'Rejeitado';

export interface RDO {
  id: number;
  data: string;
  obraId: number;
  obraNome: string;
  periodo: 'Manhã' | 'Tarde' | 'Noite';
  clima: string;
  equipeOciosa: boolean;
  tempoOcioso?: number; // em horas
  
  // Campos de controle e aprovação
  status: RDOStatus;
  criadoPorId: string;
  criadoPorNome: string;
  aprovadoPorId?: string;
  aprovadoPorNome?: string;
  dataAprovacao?: string;
  motivoRejeicao?: string;
  atividadesRealizadas: AtividadeRDO[];
  atividadesExtras: AtividadeExtraRDO[];
  equipesPresentes: EquipeRDO[];
  equipamentosUtilizados: EquipamentoRDO[];
  equipamentosQuebrados: EquipamentoQuebradoRDO[];
  acidentes: AcidenteRDO[];
  materiaisFalta: MaterialFaltaRDO[];
  estoqueMateriais: EstoqueMaterialRDO[];
  observacoes: string;
  imagens: ImagemRDO[];
  documentos: DocumentoRDO[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface AtividadeRDO {
  id: number;
  nome: string;
  categoria: string;
  quantidade: number;
  unidadeMedida: string;
  percentualConcluido: number; // 0 a 100
  status: 'Iniciada' | 'Em Andamento' | 'Concluída';
  observacoes?: string;
}

export interface AtividadeExtraRDO {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  quantidade: number;
  unidadeMedida: string;
  percentualConcluido: number;
  justificativa: string;
}

export interface EquipeRDO {
  id: number;
  nome: string;
  funcao: string;
  horasTrabalho: number;
  presente: boolean;
  horasOciosas?: number;
}

export interface EquipamentoRDO {
  id: number;
  nome: string;
  categoria: string;
  horasUso: number;
  status: 'Operacional' | 'Manutenção' | 'Parado';
  observacoes?: string;
}

export interface EquipamentoQuebradoRDO {
  id: number;
  nome: string;
  categoria: string;
  descricaoProblema: string;
  causouOciosidade: boolean;
  horasParada?: number;
  impactoProducao: string;
}

export interface AcidenteRDO {
  id: number;
  descricao: string;
  gravidade: 'Leve' | 'Moderado' | 'Grave';
  colaboradoresEnvolvidos: string[];
  horaOcorrencia: string;
  providenciasTomadas: string;
  precisouPararObra: boolean;
}

export interface MaterialFaltaRDO {
  id: number;
  nome: string;
  categoria: string;
  quantidadeNecessaria: number;
  unidadeMedida: string;
  impactoProducao: 'Baixo' | 'Médio' | 'Alto';
  prazoEntregaPrevisto?: string;
}

export interface EstoqueMaterialRDO {
  id: number;
  nome: string;
  categoria: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidadeMedida: string;
  alertaEstoqueMinimo: boolean;
}

export interface ImagemRDO {
  id: number;
  nome: string;
  url: string;
  descricao?: string;
  timestamp: string;
}

export interface DocumentoRDO {
  id: number;
  nome: string;
  tipo: string;
  url: string;
  descricao?: string;
  timestamp: string;
}

export interface CreateRDOData {
  data: string;
  obraId: number;
  periodo: 'Manhã' | 'Tarde' | 'Noite';
  clima: string;
  equipeOciosa: boolean;
  tempoOcioso?: number;
  atividadesRealizadas: Omit<AtividadeRDO, 'id'>[];
  atividadesExtras: Omit<AtividadeExtraRDO, 'id'>[];
  equipesPresentes: Omit<EquipeRDO, 'id'>[];
  equipamentosUtilizados: Omit<EquipamentoRDO, 'id'>[];
  equipamentosQuebrados: Omit<EquipamentoQuebradoRDO, 'id'>[];
  acidentes: Omit<AcidenteRDO, 'id'>[];
  materiaisFalta: Omit<MaterialFaltaRDO, 'id'>[];
  estoqueMateriais: Omit<EstoqueMaterialRDO, 'id'>[];
  observacoes: string;
  // Anexos para futura implementação
  anexos?: Array<{
    id: string;
    name: string;
    type: 'image' | 'document';
    url: string;
    size: number;
  }>;
}

// Interfaces para aprovação e rejeição
export interface ApproveRDOData {
  rdoId: number;
  aprovadoPorId: string;
  observacoes?: string;
}

export interface RejectRDOData {
  rdoId: number;
  rejeitadoPorId: string;
  motivoRejeicao: string;
}

// Interface para exportação
export interface ExportRDOOptions {
  format: 'pdf' | 'excel';
  includeImages: boolean;
  includeDocuments: boolean;
  emailTo?: string[];
}