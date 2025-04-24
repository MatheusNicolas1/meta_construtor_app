import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, CloudRain, Users, Clipboard, Camera, Download, FileText, Clock, AlertTriangle, Tool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Tipo para RDO
type RDO = {
  id: string;
  obra_id: string;
  data: string;
  numero: string;
  clima?: string;
  equipe_quantidade?: number;
  progresso?: number;
  observacoes?: string;
  status?: string;
  responsavel_id?: string;
  created_at: string;
  obra?: {
    name: string;
  };
  responsavel?: {
    nome: string;
    funcao: string;
  };
  metadata?: string | Record<string, any>;
  metadados?: string | Record<string, any>;
};

// Tipo para Atividades
type Atividade = {
  id: string;
  rdo_id: string;
  nome: string;
  porcentagem: number;
  created_at: string;
};

// Tipo para Imagens
type Imagem = {
  id: string;
  rdo_id: string;
  url: string;
  descricao?: string;
  created_at: string;
};

// Tipo para Membros da Equipe
type MembroEquipe = {
  id: string;
  rdo_id: string;
  funcao: string;
  quantidade: number;
  created_at: string;
};

const RDODetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  
  // State
  const [rdo, setRDO] = useState<RDO | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadados, setMetadados] = useState<Record<string, any>>({});
  
  // Estilo do tema
  const cardBgStyle = resolvedTheme === "dark" 
    ? "bg-[#1A2A44] text-white border-gray-700" 
    : "bg-white text-gray-800 border-gray-200";
  
  // Verificar parâmetro de download na URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const shouldDownload = queryParams.get('download') === 'true';
    
    if (shouldDownload && rdo) {
      // Remover o parâmetro download da URL para evitar downloads repetidos ao atualizar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      // Iniciar o download
      downloadRDO();
    }
  }, [rdo]); // Executar quando o RDO for carregado
  
  // Função para buscar os dados do RDO
  const fetchRDO = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar dados do RDO
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obra:obra_id(name),
          responsavel:responsavel_id(nome, funcao)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setRDO(data);
        
        // Processar metadados
        try {
          let metadata = {};
          if (data.metadata) {
            metadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
          } else if (data.metadados) {
            metadata = typeof data.metadados === 'string' ? JSON.parse(data.metadados) : data.metadados;
          }
          setMetadados(metadata);
          console.log("Metadados processados:", metadata);
        } catch (error) {
          console.error("Erro ao processar metadados:", error);
        }
        
        // Buscar atividades do RDO - tentar várias tabelas possíveis
        let atividadesData = [];
        let atividadesError = null;
        
        // Tentar primeiro a tabela atividades_rdo
        const atividadesResult = await supabase
          .from('atividades_rdo')
          .select('*')
          .eq('rdo_id', id);
          
        if (!atividadesResult.error) {
          atividadesData = atividadesResult.data || [];
        } else {
          console.log('Erro ao buscar em atividades_rdo, tentando tabela alternativa:', atividadesResult.error);
          
          // Tentar a tabela tasks como alternativa para atividades
          const tasksResult = await supabase
            .from('tasks')
            .select('*')
            .eq('rdo_id', id);
            
          if (!tasksResult.error) {
            // Mapear dados de tasks para o formato esperado de atividades
            atividadesData = (tasksResult.data || []).map(task => ({
              id: task.id,
              rdo_id: task.rdo_id || id,
              nome: task.nome || task.name,
              porcentagem: task.porcentagem || task.progress || 0,
              created_at: task.created_at
            }));
          } else {
            console.log('Erro ao buscar em tasks, tentando outra tabela:', tasksResult.error);
            atividadesError = tasksResult.error;
          }
        }
        
        setAtividades(atividadesData || []);
        
        // Buscar imagens do RDO - usar todas as tabelas possíveis em paralelo
        let todasImagens = [];
        
        // 1. Tentar buscar na tabela rdo_photos (padrão)
        const imagensResult = await supabase
          .from('rdo_photos')
          .select('*')
          .eq('rdo_id', id);
        
        if (!imagensResult.error && imagensResult.data && imagensResult.data.length > 0) {
          todasImagens = [...todasImagens, ...imagensResult.data];
          console.log('Imagens encontradas na tabela rdo_photos:', imagensResult.data.length);
        } else {
          console.log('Sem imagens na tabela rdo_photos ou erro:', imagensResult.error);
        }
        
        // 2. Tentar buscar na tabela imagens_rdo
        const imagensAltResult = await supabase
          .from('imagens_rdo')
          .select('*')
          .eq('rdo_id', id);
          
        if (!imagensAltResult.error && imagensAltResult.data && imagensAltResult.data.length > 0) {
          todasImagens = [...todasImagens, ...imagensAltResult.data];
          console.log('Imagens encontradas na tabela imagens_rdo:', imagensAltResult.data.length);
        } else {
          console.log('Sem imagens na tabela imagens_rdo ou erro:', imagensAltResult.error);
        }
        
        // 3. Tentar buscar na tabela imagens
        const imagensLegacyResult = await supabase
          .from('imagens')
          .select('*')
          .eq('rdo_id', id);
          
        if (!imagensLegacyResult.error && imagensLegacyResult.data && imagensLegacyResult.data.length > 0) {
          todasImagens = [...todasImagens, ...imagensLegacyResult.data];
          console.log('Imagens encontradas na tabela imagens:', imagensLegacyResult.data.length);
        } else {
          console.log('Sem imagens na tabela imagens ou erro:', imagensLegacyResult.error);
        }
        
        // Definir as imagens encontradas
        console.log('Total de imagens encontradas:', todasImagens.length);
        setImagens(todasImagens);
        
        // Buscar membros da equipe do RDO - tentar várias tabelas possíveis em paralelo
        let todosMembros = [];
        
        // 1. Tentar buscar na tabela membros_equipe_rdo (padrão)
        const membrosResult = await supabase
          .from('membros_equipe_rdo')
          .select('*')
          .eq('rdo_id', id);
          
        if (!membrosResult.error && membrosResult.data && membrosResult.data.length > 0) {
          todosMembros = [...todosMembros, ...membrosResult.data];
          console.log('Membros encontrados na tabela membros_equipe_rdo:', membrosResult.data.length);
        } else {
          console.log('Sem membros na tabela membros_equipe_rdo ou erro:', membrosResult.error);
        }
        
        // 2. Tentar buscar na tabela membros_equipe
        const membrosAltResult = await supabase
          .from('membros_equipe')
          .select('*')
          .eq('rdo_id', id);
          
        if (!membrosAltResult.error && membrosAltResult.data && membrosAltResult.data.length > 0) {
          todosMembros = [...todosMembros, ...membrosAltResult.data];
          console.log('Membros encontrados na tabela membros_equipe:', membrosAltResult.data.length);
        } else {
          console.log('Sem membros na tabela membros_equipe ou erro:', membrosAltResult.error);
        }
        
        // Definir os membros encontrados
        console.log('Total de membros encontrados:', todosMembros.length);
        setMembrosEquipe(todosMembros);
      }
    } catch (error: any) {
      console.error('Erro ao buscar RDO:', error);
      setError(error.message || 'Erro ao carregar o RDO');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do RDO",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para carregar os dados quando o componente montar
  useEffect(() => {
    fetchRDO();
  }, [id, toast]);
  
  // Renderiza o estado de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Carregando detalhes do RDO...</p>
        </div>
      </div>
    );
  }
  
  // Renderiza mensagem de erro
  if (error || !rdo) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Erro</h1>
          </div>
        </div>
        
        <Card className={cardBgStyle}>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg mb-4">Não foi possível carregar os detalhes do RDO</p>
              <p className="text-meta-gray-dark mb-6">
                {error || "Erro desconhecido ao carregar dados"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate(-1)}>Voltar</Button>
                <Button 
                  variant="outline" 
                  onClick={fetchRDO}
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Garantir que metadados é um objeto válido
  const metadadosValidos = metadados && typeof metadados === 'object' ? metadados : {};
  
  // Formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Função para renderizar uma lista vazia
  const renderEmptyList = (mensagem: string) => (
    <p className="text-center py-3 text-meta-gray-dark">
      {mensagem}
    </p>
  );
  
  // Função para gerar e baixar o RDO em PDF
  const downloadRDO = async () => {
    if (!rdo) return;

    try {
      toast({
        title: "Gerando PDF",
        description: "O RDO está sendo preparado para download...",
      });
      
      // Criar um elemento temporário para o conteúdo do PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm'; // Largura A4
      document.body.appendChild(tempDiv);
      
      // Data formatada
      const dataFormatada = formatarData(rdo.data || rdo.created_at);
      
      // Buscar informações da empresa (perfil do usuário)
      let companyName = "Meta Construtor";
      let companyLogo = ""; // URL do logo padrão se necessário
      
      try {
        if (rdo.obra?.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', rdo.obra.user_id)
            .single();
          
          if (!userError && userData) {
            companyName = userData.company || "Meta Construtor";
            companyLogo = userData.avatar_url || "";
          }
        }
      } catch (profileError) {
        console.error("Erro ao buscar informações da empresa:", profileError);
      }
      
      // Formatar o número do RDO para exibição no cabeçalho
      let rdoNumeroFormatado = rdo.numero || `RDO #${id}`;
      
      // Verificar se o número já está no formato novo, caso contrário, tentar formatar
      if (!rdoNumeroFormatado.startsWith("RDO nº")) {
        try {
          // Extrair data do RDO
          const dataRDO = new Date(rdo.data || rdo.created_at);
          const anoMesDia = `${dataRDO.getFullYear()}${(dataRDO.getMonth() + 1).toString().padStart(2, '0')}${dataRDO.getDate().toString().padStart(2, '0')}`;
          
          // Tenta extrair o número sequencial do número existente ou usa "001"
          const match = rdoNumeroFormatado.match(/\d{3}$/);
          const sequencial = match ? match[0] : "001";
          
          // Aplicar o novo formato
          rdoNumeroFormatado = `RDO nº - ${anoMesDia} - ${sequencial}`;
        } catch (e) {
          // Manter o formato original em caso de erro
          console.error("Erro ao reformatar número do RDO:", e);
        }
      }
      
      // Conteúdo HTML para o PDF
      let membrosEquipeHTML = '';
      if (membrosEquipe.length > 0) {
        membrosEquipe.forEach(membro => {
          membrosEquipeHTML += `
            <div class="item">
              <span>${membro.funcao}</span>
              <span>${membro.quantidade} ${membro.quantidade === 1 ? 'pessoa' : 'pessoas'}</span>
            </div>
          `;
        });
      } else {
        membrosEquipeHTML = '<p class="empty-message">Nenhum membro de equipe registrado</p>';
      }

      let atividadesHTML = '';
      if (atividades.length > 0) {
        atividades.forEach(atividade => {
          atividadesHTML += `
            <div class="item">
              <span>${atividade.nome}</span>
              <span class="progress-badge">${atividade.porcentagem}% concluído</span>
            </div>
          `;
        });
      } else {
        atividadesHTML = '<p class="empty-message">Nenhuma atividade registrada</p>';
      }

      let observacoesHTML = '';
      if (rdo.observacoes) {
        observacoesHTML = `
          <div class="divider"></div>
          <div>
            <h3 class="section-title">Observações</h3>
            <div class="section" style="background-color: #f0f0f0;">
              <p style="white-space: pre-wrap;">${rdo.observacoes}</p>
            </div>
          </div>
        `;
      }

      let imagensHTML = '';
      if (imagens.length > 0) {
        imagensHTML += '<div class="image-grid">';
        imagens.forEach(imagem => {
          imagensHTML += `
            <div class="image-container">
              <img class="image" src="${imagem.url}" alt="Imagem do RDO" />
              ${imagem.descricao ? `<div style="padding: 5px; font-size: 12px;">${imagem.descricao}</div>` : ''}
            </div>
          `;
        });
        imagensHTML += '</div>';
      } else {
        imagensHTML = '<p class="empty-message">Nenhuma imagem registrada para este RDO</p>';
      }
      
      // Estilo para o HTML
      const style = `
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 0;
            margin: 0;
            font-size: 12px;
          }
          .container {
            padding: 15px;
            max-width: 100%;
            box-sizing: border-box;
          }
          .header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #ff6f00;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .company-header {
            width: 100%;
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            justify-content: space-between;
          }
          .company-logo {
            max-width: 100px;
            max-height: 100px;
            margin-right: 20px;
          }
          .company-info {
            flex: 1;
          }
          .company-name {
            font-size: 22px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0 0 5px 0;
          }
          .company-subtitle {
            font-family: Arial, sans-serif;
            font-size: 14px;
          }
          .rdo-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .rdo-number {
            font-size: 16px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            color: #ff6f00;
            margin: 0;
          }
          .rdo-date {
            font-size: 14px;
            font-family: Arial, sans-serif;
            color: #666;
            margin: 3px 0 0 0;
          }
          .obra-name {
            font-size: 18px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            color: #1e40af;
            margin: 0;
            text-align: center;
            width: 100%;
            padding-top: 10px;
          }
          .section {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 5px;
            background-color: #f9fafb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .section-title {
            color: #ff6f00;
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
            font-family: Arial, sans-serif;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 15px;
          }
          @media print {
            .info-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          .info-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #666;
          }
          .info-value {
            font-family: Arial, sans-serif;
            font-size: 14px;
          }
          .divider {
            border-top: 1px solid #eee;
            margin: 15px 0;
          }
          .item-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .item {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            font-family: Arial, sans-serif;
          }
          .progress-badge {
            background-color: #1e40af;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-family: Arial, sans-serif;
          }
          .image-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          @media print {
            .image-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          .image-container {
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
          }
          .image {
            width: 100%;
            height: 150px;
            object-fit: cover;
          }
          .empty-message {
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 15px;
            font-family: Arial, sans-serif;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 15px;
            font-family: Arial, sans-serif;
          }
          h3 {
            margin: 10px 0;
            font-family: Arial, sans-serif;
          }
          p {
            font-family: Arial, sans-serif;
          }
          .weather-section {
            margin: 10px 0;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 4px;
          }
          .weather-title {
            font-weight: bold;
            font-family: Arial, sans-serif;
            margin-bottom: 5px;
          }
          .weather-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .weather-item {
            display: flex;
            flex-direction: column;
          }
          .idle-info {
            margin-top: 10px;
            padding: 8px;
            background-color: #fff4e5;
            border-radius: 4px;
            border-left: 3px solid #ff6f00;
          }
          .accident-info, .equipment-info {
            margin-top: 10px;
            padding: 8px;
            background-color: #fee2e2;
            border-radius: 4px;
            border-left: 3px solid #dc2626;
          }
        </style>
      `;
      
      // Informações sobre jornada de trabalho
      let jornadaHTML = '';
      if (metadadosValidos.jornada_trabalho) {
        const jornadaTexto = 
          metadadosValidos.jornada_trabalho === 'morning' ? 'Manhã (06:00 - 14:00)' :
          metadadosValidos.jornada_trabalho === 'afternoon' ? 'Tarde (14:00 - 22:00)' :
          metadadosValidos.jornada_trabalho === 'night' ? 'Noite (22:00 - 06:00)' :
          metadadosValidos.jornada_trabalho === 'full' ? 'Integral (08:00 - 18:00)' :
          metadadosValidos.jornada_trabalho;
          
        jornadaHTML = `
          <div class="info-item">
            <span class="info-label">Jornada de Trabalho</span>
            <span class="info-value">${jornadaTexto}</span>
          </div>
        `;
      }
      
      // Informações sobre ociosidade
      let ociosidadeHTML = '';
      if (metadadosValidos.equipe_ociosa) {
        ociosidadeHTML = `
          <div class="idle-info">
            <strong>Ociosidade por condições climáticas:</strong> Sim
            ${metadadosValidos.horas_ociosas ? `<div>Horas ociosas: ${metadadosValidos.horas_ociosas}</div>` : ''}
          </div>
        `;
      }
      
      // Informações sobre acidentes
      let acidentesHTML = '';
      if (metadadosValidos.ocorreu_acidente) {
        acidentesHTML = `
          <div class="accident-info">
            <strong>Acidente registrado:</strong> Sim
            ${metadadosValidos.detalhes_acidente ? `<div>Detalhes: ${metadadosValidos.detalhes_acidente}</div>` : ''}
            ${metadadosValidos.pessoas_envolvidas ? `<div>Pessoas envolvidas: ${metadadosValidos.pessoas_envolvidas}</div>` : ''}
            ${metadadosValidos.cargo_envolvidos ? `<div>Cargo: ${metadadosValidos.cargo_envolvidos}</div>` : ''}
          </div>
        `;
      }
      
      // Informações sobre problemas com equipamentos
      let equipamentosHTML = '';
      if (metadadosValidos.problema_equipamento) {
        equipamentosHTML = `
          <div class="equipment-info">
            <strong>Problema com equipamentos:</strong> Sim
            ${metadadosValidos.detalhes_equipamento ? `<div>Detalhes: ${metadadosValidos.detalhes_equipamento}</div>` : ''}
            ${metadadosValidos.tipo_equipamento ? `<div>Tipo: ${metadadosValidos.tipo_equipamento}</div>` : ''}
            ${metadadosValidos.quantidade_equipamento ? `<div>Quantidade: ${metadadosValidos.quantidade_equipamento}</div>` : ''}
          </div>
        `;
      }
      
      // Construir o HTML completo
      tempDiv.innerHTML = `
        ${style}
        <div class="container">
          <div class="header">
            <div class="company-header">
              ${companyLogo ? `<img src="${companyLogo}" class="company-logo" alt="${companyName}" />` : ''}
              <div class="company-info">
                <h1 class="company-name">${companyName}</h1>
                <p class="company-subtitle">Relatório Diário de Obra</p>
              </div>
              <div class="rdo-info">
                <p class="rdo-number">${rdoNumeroFormatado}</p>
                <p class="rdo-date">${dataFormatada}</p>
              </div>
            </div>
            <h2 class="obra-name">${rdo.obra?.name || 'Obra não especificada'}</h2>
          </div>
          
          <div class="section">
            <h2 class="section-title">Informações do RDO</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Data</span>
                <span class="info-value">${dataFormatada}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">Responsável</span>
                <span class="info-value">${rdo.responsavel ? `${rdo.responsavel.nome} (${rdo.responsavel.funcao})` : 'Não especificado'}</span>
              </div>
              
              ${jornadaHTML}
            </div>
            
            <div class="divider"></div>
            
            <h3 class="section-title">Equipe</h3>
            <div class="item-list">
              ${membrosEquipeHTML}
            </div>
            
            <div class="divider"></div>
            
            <h3 class="section-title">Atividades</h3>
            <div class="item-list">
              ${atividadesHTML}
            </div>
            
            ${observacoesHTML}
          </div>
          
          <div class="section">
            <h2 class="section-title">Registros Fotográficos</h2>
            ${imagensHTML}
          </div>
          
          <div class="footer">
            <p>Meta Construtor © ${new Date().getFullYear()} - RDO gerado em ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;
      
      // Converter o HTML para uma imagem usando html2canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Aumenta a qualidade da renderização
        useCORS: true, // Permite carregar imagens de outros domínios
        logging: false, // Desabilita logs
      });
      
      // Criar o PDF com jsPDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasRatio = canvas.height / canvas.width;
      const imgWidth = pdfWidth;
      const imgHeight = pdfWidth * canvasRatio;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Adicionar a primeira página
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // Se o conteúdo for maior que uma página, adicionar mais páginas
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      // Salvar o PDF com o nome formatado
      pdf.save(`${rdoNumeroFormatado.replace(/\s/g, '_')}.pdf`);
      
      // Remover o elemento temporário
      document.body.removeChild(tempDiv);
      
      toast({
        title: "Download concluído",
        description: "O PDF do RDO foi gerado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF do RDO.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl print:max-w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold">{rdo.numero || `RDO #${rdo.id}`}</h1>
            <Badge 
              className={cn(
                rdo.status === 'finalizado' ? 'bg-green-500' : 'bg-orange-500',
                'text-white'
              )}
            >
              {rdo.status === 'finalizado' ? 'Finalizado' : 'Em andamento'}
            </Badge>
          </div>
          <p className="text-meta-gray-dark dark:text-meta-gray mt-1">
            {rdo.obra?.name || 'Obra não especificada'} • {formatarData(rdo.data || rdo.created_at)}
          </p>
        </div>
      </div>
      
      {/* Informações Básicas */}
      <Card className={cardBgStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-meta-orange" />
            Informações do RDO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data */}
            <div className="flex items-start gap-3">
              <div className="bg-meta-orange/20 p-2 rounded-full shrink-0">
                <Calendar className="h-5 w-5 text-meta-orange" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-meta-gray-dark dark:text-meta-gray">Data</h3>
                <p className="font-semibold">{formatarData(rdo.data || rdo.created_at)}</p>
              </div>
            </div>
            
            {/* Responsável */}
            <div className="flex items-start gap-3">
              <div className="bg-meta-blue/20 p-2 rounded-full shrink-0">
                <User className="h-5 w-5 text-meta-blue" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-meta-gray-dark dark:text-meta-gray">Responsável</h3>
                <p className="font-semibold">
                  {rdo.responsavel ? `${rdo.responsavel.nome} (${rdo.responsavel.funcao})` : 'Não especificado'}
                </p>
              </div>
            </div>
            
            {/* Clima */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-400/20 p-2 rounded-full shrink-0">
                <CloudRain className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-meta-gray-dark dark:text-meta-gray">Condição Climática</h3>
                <p className="font-semibold">{rdo.clima || 'Não especificado'}</p>
              </div>
            </div>
          </div>
          
          {/* Horas Ociosas por Clima */}
          {metadadosValidos.equipe_ociosa && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-amber-500">Horas Ociosas por Clima</h3>
                </div>
                <div 
                  className={cn(
                    "p-3 rounded-md border-l-4 border-amber-500",
                    resolvedTheme === "dark" ? "bg-gray-800" : "bg-amber-50"
                  )}
                >
                  <p className="font-medium">
                    A equipe registrou {metadadosValidos.horas_ociosas || 0} horas ociosas devido a condições climáticas.
                  </p>
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          {/* Equipe */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-meta-blue" />
              <h3 className="font-semibold">Equipe</h3>
              {rdo.equipe_quantidade && rdo.equipe_quantidade > 0 && (
                <Badge variant="outline" className="ml-auto">
                  {rdo.equipe_quantidade} pessoas
                </Badge>
              )}
            </div>
            
            {membrosEquipe.length > 0 ? (
              <div className="space-y-2">
                {membrosEquipe.map((membro) => (
                  <div 
                    key={membro.id}
                    className={cn(
                      "p-3 rounded-md",
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{membro.funcao}</p>
                      <Badge variant="secondary">
                        {membro.quantidade} {membro.quantidade === 1 ? 'pessoa' : 'pessoas'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderEmptyList("Nenhum membro de equipe registrado")
            )}
          </div>
          
          <Separator />
          
          {/* Atividades */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clipboard className="h-5 w-5 text-meta-orange" />
              <h3 className="font-semibold">Atividades</h3>
            </div>
            
            {atividades.length > 0 ? (
              <div className="space-y-2">
                {atividades.map((atividade) => (
                  <div 
                    key={atividade.id}
                    className={cn(
                      "p-3 rounded-md",
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{atividade.nome}</p>
                      <Badge className="bg-meta-blue">
                        {atividade.porcentagem}% concluído
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderEmptyList("Nenhuma atividade registrada")
            )}
          </div>
          
          {/* Informações sobre Acidentes */}
          {metadadosValidos.ocorreu_acidente && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold text-red-500">Registro de Acidentes</h3>
                </div>
                <div 
                  className={cn(
                    "p-3 rounded-md border-l-4 border-red-500",
                    resolvedTheme === "dark" ? "bg-gray-800" : "bg-red-50"
                  )}
                >
                  {metadadosValidos.detalhes_acidente && (
                    <div className="mb-2">
                      <p className="font-medium">Detalhes:</p>
                      <p>{metadadosValidos.detalhes_acidente}</p>
                    </div>
                  )}
                  {(metadadosValidos.pessoas_envolvidas && metadadosValidos.pessoas_envolvidas > 0) && (
                    <div className="mb-2">
                      <p className="font-medium">Pessoas envolvidas: {metadadosValidos.pessoas_envolvidas}</p>
                    </div>
                  )}
                  {metadadosValidos.cargo_envolvidos && (
                    <div>
                      <p className="font-medium">Cargo: {metadadosValidos.cargo_envolvidos}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Informações sobre Problemas com Equipamentos */}
          {metadadosValidos.problema_equipamento && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tool className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold text-orange-500">Problemas com Equipamentos</h3>
                </div>
                <div 
                  className={cn(
                    "p-3 rounded-md border-l-4 border-orange-500",
                    resolvedTheme === "dark" ? "bg-gray-800" : "bg-orange-50"
                  )}
                >
                  {metadadosValidos.detalhes_equipamento && (
                    <div className="mb-2">
                      <p className="font-medium">Detalhes:</p>
                      <p>{metadadosValidos.detalhes_equipamento}</p>
                    </div>
                  )}
                  {metadadosValidos.tipo_equipamento && (
                    <div className="mb-2">
                      <p className="font-medium">Tipo: {metadadosValidos.tipo_equipamento}</p>
                    </div>
                  )}
                  {(metadadosValidos.quantidade_equipamento && metadadosValidos.quantidade_equipamento > 0) && (
                    <div>
                      <p className="font-medium">Quantidade: {metadadosValidos.quantidade_equipamento}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Observações */}
          {rdo.observacoes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <div 
                  className={cn(
                    "p-3 rounded-md",
                    resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <p className="whitespace-pre-wrap">{rdo.observacoes}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Imagens */}
      <Card className={cardBgStyle}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-meta-orange" />
            Registros Fotográficos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {imagens.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {imagens.map((imagem) => (
                <div 
                  key={imagem.id}
                  className="overflow-hidden rounded-md border"
                >
                  <img 
                    src={imagem.url} 
                    alt={imagem.descricao || "Imagem do RDO"}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://placehold.co/400x300/orange/white?text=Imagem+indisponível';
                    }}
                  />
                  {imagem.descricao && (
                    <div className="p-2">
                      <p className="text-sm">{imagem.descricao}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-meta-gray-dark">
              Nenhuma imagem registrada para este RDO
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Botões de Ação */}
      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline"
          onClick={downloadRDO}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Baixar RDO
        </Button>
        <Button 
          className="bg-meta-orange hover:bg-meta-orange/90"
          onClick={() => navigate(`/rdos/${id}/edit`)}
        >
          Editar RDO
        </Button>
      </div>
    </div>
  );
};

export default RDODetalhe;
