export interface Obra {
  id: number;
  nome: string;
  localizacao: string;
  responsavel: string;
  cliente: string;
  tipo: 'Residencial' | 'Comercial' | 'Industrial' | 'Infraestrutura' | 'Institucional';
  progresso: number;
  dataInicio: string;
  previsaoTermino: string;
  status: 'Iniciando' | 'Em andamento' | 'Finalizando' | 'Concluída' | 'Pausada';
  atividades: number;
  descricao?: string;
  area?: string;
  categoria?: string;
  prioridade?: 'Baixa' | 'Média' | 'Alta';
  observacoes?: string;
  orcamento_previsto?: number;
}

export interface CreateObraData {
  nome: string;
  localizacao: string;
  responsavel: string;
  cliente: string;
  tipo: 'Residencial' | 'Comercial' | 'Industrial' | 'Infraestrutura' | 'Institucional';
  dataInicio: string;
  previsaoTermino: string;
  descricao?: string;
  area?: string;
  observacoes?: string;
}

export interface UpdateObraData extends Partial<CreateObraData> {
  id: number;
  progresso?: number;
  status?: Obra['status'];
}