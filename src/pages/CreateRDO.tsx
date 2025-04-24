import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/useTheme";
import { TeamMemberForm, TeamMember } from "@/components/TeamMemberForm";
import { ActivityList, Activity } from "@/components/ActivityList";
import { PhotoUploader, uploadPhotosToStorage } from "@/components/PhotoUploader";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";

// Tipo para Obras
type Obra = {
  id: string;
  name: string;
};

// Tipo para Membros de Equipe
type MembroEquipe = {
  id: string;
  nome: string;
  funcao: string;
};

export default function CreateRDO() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams(); // Capturar ID da URL para modo de edição
  const isEditMode = !!id; // Verifica se está no modo de edição
  
  // Get theme information
  const { resolvedTheme } = useTheme();

  // Form states
  const [obraId, setObraId] = useState("");
  const [obras, setObras] = useState<Obra[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [responsavelId, setResponsavelId] = useState("");
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipe[]>([]);
  const [workDay, setWorkDay] = useState("morning");
  const [morningWeather, setMorningWeather] = useState("");
  const [afternoonWeather, setAfternoonWeather] = useState("");
  const [nightWeather, setNightWeather] = useState("");
  
  // Weather forecast
  const [location, setLocation] = useState("");
  const [temperature, setTemperature] = useState("24°C");
  const [condition, setCondition] = useState("Ensolarado");
  const [precipitation, setPrecipitation] = useState("0%");
  const [wind, setWind] = useState("10 km/h");
  const [isTeamIdle, setIsTeamIdle] = useState(false);
  const [idleHours, setIdleHours] = useState(0);
  
  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [atividadesObra, setAtividadesObra] = useState<{id: string, name: string}[]>([]);
  
  // Extra activities
  const [extraActivities, setExtraActivities] = useState<Activity[]>([]);
  
  // Accident and equipment registers
  const [hasAccident, setHasAccident] = useState(false);
  const [accidentDetails, setAccidentDetails] = useState("");
  const [peopleInvolved, setPeopleInvolved] = useState(0);
  const [involvedRole, setInvolvedRole] = useState("");
  
  const [hasEquipmentIssue, setHasEquipmentIssue] = useState(false);
  const [equipmentIssueDetails, setEquipmentIssueDetails] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [equipmentQuantity, setEquipmentQuantity] = useState(0);
  
  // Observations
  const [observations, setObservations] = useState("");
  
  // Photos
  const [photos, setPhotos] = useState<any[]>([]);
  
  // Loading states
  const [loadingObras, setLoadingObras] = useState(true);
  const [loadingMembros, setLoadingMembros] = useState(true);
  const [loadingRDO, setLoadingRDO] = useState(false);

  // Background style based on theme
  const cardBgStyle = resolvedTheme === "dark" 
    ? "bg-[#1A2A44] text-white border-gray-700" 
    : "bg-white text-gray-800 border-gray-200";
  
  // Content background style based on theme
  const contentBgStyle = resolvedTheme === "dark"
    ? "bg-gray-800" 
    : "bg-gray-50";

  // Buscar obras do usuário
  useEffect(() => {
    const fetchObras = async () => {
      setLoadingObras(true);
      try {
        const { data, error } = await supabase
          .from('obras')
          .select('id, name')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setObras(data || []);
      } catch (error) {
        console.error("Erro ao buscar obras:", error);
      toast({
          title: "Erro",
          description: "Não foi possível carregar as obras",
          variant: "destructive"
        });
      } finally {
        setLoadingObras(false);
      }
    };
    
    fetchObras();
  }, [toast]);
  
  // Buscar membros da equipe do usuário
  useEffect(() => {
    const fetchMembrosEquipe = async () => {
      setLoadingMembros(true);
      try {
        const { data, error } = await supabase
          .from('membros_equipe')
          .select('id, nome, funcao')
          .order('nome');
          
        if (error) throw error;
        
        setMembrosEquipe(data || []);
      } catch (error) {
        console.error("Erro ao buscar membros da equipe:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os membros da equipe",
          variant: "destructive"
        });
      } finally {
        setLoadingMembros(false);
      }
    };
    
    fetchMembrosEquipe();
  }, [toast]);

  // Load previous RDO data when obra changes
  useEffect(() => {
    if (obraId) {
      const fetchObraInfo = async () => {
        try {
          // Buscar dados da obra selecionada
          const { data, error } = await supabase
            .from('obras')
            .select('*')
            .eq('id', obraId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            // Extrair localização dos metadados se existir
            if (data.description) {
              try {
                const metaRegex = /<!-- META_INFO: (.*?) -->/;
                const match = data.description.match(metaRegex);
                
                if (match && match[1]) {
                  const metadata = JSON.parse(match[1]);
                  setLocation(metadata.location || "");
                }
              } catch (e) {
                console.error("Erro ao processar metadados:", e);
              }
            }
            
            // Buscar atividades da obra
            const { data: atividadesData, error: atividadesError } = await supabase
              .from('atividades')
              .select('*')
              .eq('obra_id', obraId);
              
            if (atividadesError) {
              console.error("Erro ao buscar atividades:", atividadesError);
            } else if (atividadesData && atividadesData.length > 0) {
              // Converter atividades do formato do banco para o formato usado no componente
              const formattedActivities: Activity[] = atividadesData.map(atividade => ({
                id: atividade.id,
                name: atividade.nome,
                percentage: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: null
              }));
              
              // Atualizar o array de atividades pré-registradas para o selector
              const atividadesSelector = atividadesData.map(atividade => ({
                id: atividade.id,
                name: atividade.nome
              }));
              
              setAtividadesObra(atividadesSelector);
              
              // Limpar o estado de atividades selecionadas quando mudar de obra
              setActivities([]);
              
              toast({
                title: "Atividades carregadas",
                description: `${formattedActivities.length} atividades encontradas para esta obra.`
              });
            } else {
              // Se não encontrar atividades, tentar buscar na tabela tasks (para compatibilidade)
              const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('obra_id', obraId);
                
              if (!tasksError && tasksData && tasksData.length > 0) {
                const formattedTasks: Activity[] = tasksData.map(task => ({
                  id: task.id,
                  name: task.name || task.description,
                  percentage: 0,
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: null
                }));
                
                // Atualizar o array de atividades pré-registradas para o selector
                const tasksSelector = tasksData.map(task => ({
                  id: task.id,
                  name: task.name || task.description
                }));
                
                setAtividadesObra(tasksSelector);
                
                // Limpar o estado de atividades selecionadas quando mudar de obra
                setActivities([]);
                
                toast({
                  title: "Tarefas carregadas",
                  description: `${formattedTasks.length} tarefas encontradas para esta obra.`
                });
              } else {
                // Se não encontrar nenhuma atividade, limpar o array de atividades
                setAtividadesObra([]);
                setActivities([]);
              }
            }
            
            toast({
              title: "Obra selecionada",
              description: `Dados da obra "${data.name}" carregados.`
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados da obra:", error);
        }
      };
      
      fetchObraInfo();
    }
  }, [obraId, toast]);

  // Efeito para carregar os dados do RDO se estiver no modo de edição
  useEffect(() => {
    if (isEditMode && id) {
      const fetchRDO = async () => {
        setLoadingRDO(true);
        try {
          // Buscar dados do RDO
          const { data: rdoData, error: rdoError } = await supabase
            .from('rdos')
            .select(`
              *,
              obra:obra_id(id, name),
              responsavel:responsavel_id(id, nome, funcao)
            `)
            .eq('id', id)
            .single();
            
          if (rdoError) {
            throw rdoError;
          }
          
          if (rdoData) {
            // Atualizar estados com os dados do RDO
            setObraId(rdoData.obra_id || "");
            setDate(rdoData.data || new Date().toISOString().split("T")[0]);
            setResponsavelId(rdoData.responsavel_id || "");
            setObservations(rdoData.observacoes || "");
            
            // Extrair metadados
            let metadata = {};
            try {
              if (rdoData.metadata) {
                metadata = JSON.parse(rdoData.metadata);
              } else if (rdoData.metadados) {
                metadata = JSON.parse(rdoData.metadados);
              }
              
              // Atualizar estados com os metadados
              setLocation(metadata.location || "");
              setTemperature(metadata.temperatura || "24°C");
              setCondition(metadata.condicao || "Ensolarado");
              setPrecipitation(metadata.precipitacao || "0%");
              setWind(metadata.vento || "10 km/h");
              setIsTeamIdle(metadata.equipe_ociosa || false);
              setIdleHours(metadata.horas_ociosas || 0);
              
              // Clima
              if (metadata.clima_tarde) {
                setAfternoonWeather(
                  metadata.clima_tarde === "Ensolarado" ? "sunny" :
                  metadata.clima_tarde === "Nublado" ? "cloudy" :
                  metadata.clima_tarde === "Chuvoso" ? "rainy" : ""
                );
              }
              
              if (metadata.clima_noite) {
                setNightWeather(
                  metadata.clima_noite === "Céu Limpo" ? "clear" :
                  metadata.clima_noite === "Nublado" ? "cloudy" :
                  metadata.clima_noite === "Chuvoso" ? "rainy" : ""
                );
              }
              
              // Jornada de trabalho
              setWorkDay(metadata.jornada_trabalho || "morning");
              
              // Acidentes
              setHasAccident(metadata.ocorreu_acidente || false);
              setAccidentDetails(metadata.detalhes_acidente || "");
              setPeopleInvolved(metadata.pessoas_envolvidas || 0);
              setInvolvedRole(metadata.cargo_envolvidos || "");
              
              // Equipamentos
              setHasEquipmentIssue(metadata.problema_equipamento || false);
              setEquipmentIssueDetails(metadata.detalhes_equipamento || "");
              setEquipmentType(metadata.tipo_equipamento || "");
              setEquipmentQuantity(metadata.quantidade_equipamento || 0);
              
              // Clima da manhã (direto do RDO, não do metadata)
              if (rdoData.clima) {
                setMorningWeather(
                  rdoData.clima === "Ensolarado" ? "sunny" :
                  rdoData.clima === "Nublado" ? "cloudy" :
                  rdoData.clima === "Chuvoso" ? "rainy" : ""
                );
              }
            } catch (error) {
              console.error("Erro ao processar metadados:", error);
            }
            
            // Buscar atividades relacionadas ao RDO
            const { data: atividadesRDO, error: atividadesRDOError } = await supabase
              .from('atividades_rdo')
              .select('*')
              .eq('rdo_id', id)
              .order('created_at');
              
            if (!atividadesRDOError && atividadesRDO) {
              // Separar atividades normais e extras
              const regularActivities = [];
              const extraActivitiesData = [];
              
              for (const atividade of atividadesRDO) {
                const activityData = {
                  id: atividade.id,
                  name: atividade.nome,
                  percentage: atividade.porcentagem || atividade.progresso || 0,
                  startDate: atividade.data_inicio || atividade.inicio || null,
                  endDate: atividade.data_fim || atividade.fim || null
                };
                
                if (atividade.extra) {
                  extraActivitiesData.push(activityData);
                } else {
                  regularActivities.push(activityData);
                }
              }
              
              setActivities(regularActivities);
              setExtraActivities(extraActivitiesData);
            }
            
            // Buscar membros de equipe
            const { data: membrosRDO, error: membrosRDOError } = await supabase
              .from('membros_equipe_rdo')
              .select('*')
              .eq('rdo_id', id)
              .order('created_at');
              
            if (!membrosRDOError && membrosRDO) {
              const teamMembersData = membrosRDO.map(membro => ({
                id: membro.id,
                role: membro.funcao || membro.cargo,
                quantity: membro.quantidade
              }));
              
              setTeamMembers(teamMembersData);
            }
            
            toast({
              title: "RDO carregado",
              description: "Os dados do RDO foram carregados para edição."
            });
          }
        } catch (error) {
          console.error("Erro ao carregar RDO:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do RDO para edição.",
            variant: "destructive"
          });
        } finally {
          setLoadingRDO(false);
        }
      };
      
      fetchRDO();
    }
  }, [id, isEditMode, toast]);

  // Gerar numero de RDO apenas em modo de criação
  const generateRDONumber = async () => {
    if (isEditMode) return undefined;
    
    // Formato da data: anoMêsDia
    const dataFormatada = date.replace(/-/g, '');
    
    try {
      // Buscar total de RDOs do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");
      
      // Contar RDOs existentes para este usuário
      const { count, error } = await supabase
        .from('rdos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Número sequencial formatado com 3 dígitos
      const numeroSequencial = (count !== null ? count + 1 : 1).toString().padStart(3, '0');
      
      // Formato final: RDO nº - AAAAMMDD - 001
      return `RDO nº - ${dataFormatada} - ${numeroSequencial}`;
    } catch (error) {
      console.error("Erro ao gerar número do RDO:", error);
      // Fallback: usar número aleatório se não conseguir contar
      return `RDO nº - ${dataFormatada} - ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Referência local para o toast de carregamento
    let loadingToastId: string | number | undefined;
    
    // Variável para mensagem de sucesso
    let mensagemSucesso = isEditMode ? "RDO atualizado com sucesso!" : "RDO salvo com sucesso!";
    
    try {
      // Validar campos obrigatórios
      if (!obraId) {
        toast({
          title: "Campo obrigatório",
          description: "Selecione uma obra para continuar.",
          variant: "destructive"
        });
        return;
      }
      
      if (!date) {
        toast({
          title: "Campo obrigatório",
          description: "Informe a data do RDO.",
          variant: "destructive"
        });
        return;
      }
      
      // Mostrar toast de carregamento
      const loadingToast = toast({
        title: isEditMode ? "Atualizando RDO" : "Salvando RDO",
        description: isEditMode ? "Aguarde enquanto atualizamos o RDO..." : "Aguarde enquanto salvamos o RDO...",
      });
      
      // Salvar o ID do toast para referência posterior
      loadingToastId = loadingToast.id;
      
      // Verificar se a tabela rdos existe
      try {
        const { count, error: countError } = await supabase
          .from('rdos')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          if (countError.message.includes('relation "public.rdos" does not exist')) {
            // A tabela não existe, precisamos informar ao usuário
            if (loadingToastId) toast.dismiss(loadingToastId);
            toast({
              title: "Erro de configuração",
              description: "A tabela de RDOs ainda não foi criada no banco de dados. Por favor, entre em contato com o suporte técnico.",
              variant: "destructive"
            });
            return;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar tabela RDOs:", error);
      }
      
      // Gerar numero de RDO apenas em modo de criação
      const numeroRDO = isEditMode ? undefined : await generateRDONumber();
      
      // Preparar dados para inserção/atualização
      const rdoData: any = {
        obra_id: obraId,
        data: date,
        status: "ativo"
      };
      
      // Adicionar numero apenas para novos RDOs
      if (numeroRDO) {
        rdoData.numero = numeroRDO;
      }
      
      // Adicionar campos opcionais apenas se existirem
      if (responsavelId) {
        rdoData.responsavel_id = responsavelId;
      }
      
      if (morningWeather) {
        rdoData.clima = morningWeather === "sunny" ? "Ensolarado" : 
                        morningWeather === "cloudy" ? "Nublado" : 
                        morningWeather === "rainy" ? "Chuvoso" : "";
      }
      
      if (observations) {
        rdoData.observacoes = observations;
      }
      
      // Calcular progresso se necessário
      const progresso = activities.length > 0 ? 
        activities.reduce((sum, act) => sum + (act.percentage || 0), 0) / activities.length : 0;
      rdoData.progresso = progresso;
      
      // Calcular quantidade de equipe se houver membros
      if (teamMembers.length > 0) {
        rdoData.equipe_quantidade = teamMembers.reduce((total, member) => total + member.quantity, 0);
      }
      
      // Criar objeto de metadados para salvar todos os detalhes extras
      const metadataObj = {
        clima_tarde: afternoonWeather === "sunny" ? "Ensolarado" : 
                    afternoonWeather === "cloudy" ? "Nublado" : 
                    afternoonWeather === "rainy" ? "Chuvoso" : "",
        clima_noite: nightWeather === "clear" ? "Céu Limpo" : 
                    nightWeather === "cloudy" ? "Nublado" : 
                    nightWeather === "rainy" ? "Chuvoso" : "",
        location: location,
        temperatura: temperature,
        condicao: condition,
        precipitacao: precipitation,
        vento: wind,
        jornada_trabalho: workDay,
        equipe_ociosa: isTeamIdle,
        horas_ociosas: isTeamIdle ? idleHours : 0,
        ocorreu_acidente: hasAccident,
        detalhes_acidente: hasAccident ? accidentDetails : "",
        pessoas_envolvidas: hasAccident ? peopleInvolved : 0,
        cargo_envolvidos: hasAccident ? involvedRole : "",
        problema_equipamento: hasEquipmentIssue,
        detalhes_equipamento: hasEquipmentIssue ? equipmentIssueDetails : "",
        tipo_equipamento: hasEquipmentIssue ? equipmentType : "",
        quantidade_equipamento: hasEquipmentIssue ? equipmentQuantity : 0
      };
      
      // Converter metadados para string
      const metadataString = JSON.stringify(metadataObj);
      
      // Adicionar diretamente os metadados ao objeto rdoData para maior probabilidade de sucesso
      rdoData.metadata = metadataString;
      rdoData.metadados = metadataString; // Adicionar ambos os campos para compatibilidade
      
      // Se estiver em modo de edição, atualiza o RDO. Caso contrário, insere um novo
      let rdoId = isEditMode ? id : null;
      
      if (isEditMode) {
        // Atualizar RDO existente com ambas as versões do campo de metadados
        try {
          const { error } = await supabase
            .from('rdos')
            .update(rdoData)
            .eq('id', id);
            
          if (error) {
            throw error;
          }
        } catch (error: any) {
          console.error("Erro ao atualizar RDO:", error);
          
          // Se falhar, tentar atualizar sem o campo metadata
          try {
            const { error } = await supabase
              .from('rdos')
              .update({
                ...rdoData,
                metadata: null
              })
              .eq('id', id);
              
            if (error) {
              throw error;
            }
          } catch (basicError: any) {
            console.error("Erro ao atualizar RDO com dados básicos:", basicError);
            throw basicError;
          }
        }
      } else {
        // Inserir novo RDO com ambas as versões do campo de metadados
        try {
          const { data, error } = await supabase
            .from('rdos')
            .insert(rdoData)
            .select()
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            rdoId = data.id;
            console.log("RDO salvo com sucesso:", data);
          }
        } catch (error: any) {
          console.error("Erro ao inserir RDO:", error);
          
          // Se falhar, tentar inserir sem o campo metadata
          try {
            const { data, error } = await supabase
              .from('rdos')
              .insert({
                ...rdoData,
                metadata: null
              })
              .select()
              .single();
              
            if (error) {
              throw error;
            }
            
            if (data) {
              rdoId = data.id;
              console.log("RDO salvo com campo metadados:", data);
            }
          } catch (metadataError: any) {
            // Última tentativa: apenas com dados básicos e nenhum metadado
            try {
              const basicData = { ...rdoData };
              delete basicData.metadata;
              delete basicData.metadados;
              
              const { data, error } = await supabase
                .from('rdos')
                .insert(basicData)
                .select()
                .single();
                
              if (error) {
                throw error;
              }
              
              if (data) {
                rdoId = data.id;
                console.log("RDO salvo apenas com dados básicos:", data);
              }
            } catch (basicError: any) {
              console.error("Erro ao inserir RDO com dados básicos:", basicError);
              throw basicError;
            }
          }
        }
      }
      
      // Após salvar o RDO, se houver fotos, fazer o upload
      let fotosUploadadas = [];
      if (photos && photos.length > 0) {
        try {
          // Verificar se temos um ID válido de RDO antes de fazer upload
          if (!rdoId) {
            throw new Error("ID do RDO não disponível para associar fotos");
          }

          console.log("Iniciando upload de fotos para o RDO ID:", rdoId);
          fotosUploadadas = await uploadPhotosToStorage(photos, rdoId);
          console.log("Fotos enviadas para o storage:", fotosUploadadas);
          
          // Inserir registros das fotos na tabela rdo_photos
          if (fotosUploadadas && fotosUploadadas.length > 0) {
            const fotosData = fotosUploadadas.map(foto => ({
              rdo_id: rdoId,
              url: foto.url,
              descricao: foto.descricao || null,
              created_at: new Date().toISOString()
            }));
            
            console.log("Dados das fotos a serem inseridos:", fotosData);
            
            // Tentar primeiro na tabela padrão
            let fotosSalvas = false;
            try {
              const { data: photoData, error: photoError } = await supabase
                .from('rdo_photos')
                .insert(fotosData)
                .select();
                
              if (!photoError) {
                fotosSalvas = true;
                console.log("Fotos salvas com sucesso na tabela rdo_photos:", photoData);
              } else {
                console.error("Erro ao salvar fotos na tabela rdo_photos:", photoError);
              }
            } catch (photoError) {
              console.error("Erro ao salvar fotos na tabela rdo_photos:", photoError);
            }
            
            // Se falhar na tabela principal, tentar na tabela alternativa
            if (!fotosSalvas) {
              try {
                const { data: photoAltData, error: photoAltError } = await supabase
                  .from('imagens_rdo')
                  .insert(fotosData)
                  .select();
                  
                if (!photoAltError) {
                  fotosSalvas = true;
                  console.log("Fotos salvas com sucesso na tabela imagens_rdo:", photoAltData);
                } else {
                  console.error("Erro ao salvar fotos na tabela imagens_rdo:", photoAltError);
                }
              } catch (photoAltError) {
                console.error("Erro ao salvar fotos na tabela imagens_rdo:", photoAltError);
              }
            }
            
            // Se ainda não conseguiu salvar, tentar em uma terceira tabela
            if (!fotosSalvas) {
              try {
                const { data: photoLegacyData, error: photoLegacyError } = await supabase
                  .from('imagens')
                  .insert(fotosData)
                  .select();
                  
                if (!photoLegacyError) {
                  fotosSalvas = true;
                  console.log("Fotos salvas com sucesso na tabela imagens:", photoLegacyData);
                } else {
                  console.error("Erro ao salvar fotos na tabela imagens:", photoLegacyError);
                }
              } catch (photoLegacyError) {
                console.error("Erro ao salvar fotos na tabela imagens:", photoLegacyError);
              }
            }
            
            if (fotosSalvas) {
              mensagemSucesso += ` ${fotosUploadadas.length} foto(s) anexada(s) ao RDO.`;
            } else {
              mensagemSucesso += " Algumas fotos podem não ter sido salvas corretamente.";
            }
          }
        } catch (photoUploadError) {
          console.error("Erro ao fazer upload das fotos:", photoUploadError);
          mensagemSucesso += " Houve um erro ao enviar as fotos.";
        }
      }
      
      // Salvar membros da equipe
      let membrosEquipeSalvos = true;
      if (teamMembers.length > 0) {
        try {
          const { error } = await supabase
            .from('membros_equipe_rdo')
            .insert(
              teamMembers.map(membro => ({
                rdo_id: rdoId,
                funcao: membro.role,
                quantidade: membro.quantity,
                created_at: new Date().toISOString()
              }))
            );
            
          if (error) {
            console.error("Erro ao salvar membros da equipe:", error);
            membrosEquipeSalvos = false;
          }
        } catch (error) {
          console.error("Erro ao salvar membros da equipe:", error);
          membrosEquipeSalvos = false;
        }
      }
      
      // Salvar atividades
      let atividadesSalvas = true;
      if (activities.length > 0) {
        try {
          const { error } = await supabase
            .from('atividades_rdo')
            .insert(
              activities.map(atividade => ({
                rdo_id: rdoId,
                nome: atividade.name,
                porcentagem: atividade.percentage,
                data_inicio: atividade.startDate,
                data_fim: atividade.endDate,
                extra: false,
                created_at: new Date().toISOString()
              }))
            );
            
          if (error) {
            console.error("Erro ao salvar atividades:", error);
            atividadesSalvas = false;
          }
        } catch (error) {
          console.error("Erro ao salvar atividades:", error);
          atividadesSalvas = false;
        }
      }
      
      // Salvar atividades extras
      let atividadesExtrasSalvas = true;
      if (extraActivities.length > 0) {
        try {
          const { error } = await supabase
            .from('atividades_rdo')
            .insert(
              extraActivities.map(atividade => ({
                rdo_id: rdoId,
                nome: atividade.name,
                porcentagem: atividade.percentage,
                data_inicio: atividade.startDate,
                data_fim: atividade.endDate,
                extra: true,
                created_at: new Date().toISOString()
              }))
            );
            
          if (error) {
            console.error("Erro ao salvar atividades extras:", error);
            atividadesExtrasSalvas = false;
          }
        } catch (error) {
          console.error("Erro ao salvar atividades extras:", error);
          atividadesExtrasSalvas = false;
        }
      }
      
      // Determinar mensagem de sucesso com base no que foi salvo
      if (!membrosEquipeSalvos && teamMembers.length > 0) {
        mensagemSucesso += " Alguns detalhes da equipe não puderam ser salvos.";
      }
      if (!atividadesSalvas && activities.length > 0) {
        mensagemSucesso += " Algumas atividades não puderam ser salvas.";
      }
      if (!atividadesExtrasSalvas && extraActivities.length > 0) {
        mensagemSucesso += " Algumas atividades extras não puderam ser salvas.";
      }
      
      // Mostrar mensagem de sucesso
      toast({
        title: isEditMode ? "RDO Atualizado" : "RDO Salvo",
        description: mensagemSucesso,
        variant: "success"
      });
      
      // Redirecionar para a página de detalhes do RDO
      navigate(`/rdos/${rdoId}`);
      
    } catch (error: any) {
      console.error(isEditMode ? "Erro ao atualizar RDO:" : "Erro ao salvar RDO:", error);
      toast({
        title: isEditMode ? "Erro ao atualizar" : "Erro ao salvar",
        description: `Não foi possível ${isEditMode ? 'atualizar' : 'salvar'} o RDO. Erro: ${error?.message || "Desconhecido"}`,
        variant: "destructive"
      });
    } finally {
      // Fechar toast de carregamento se ainda existir
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
    }
  };

  return (
    <div className={cn(
      "container mx-auto py-6 space-y-6",
      resolvedTheme === "dark" ? "bg-[#121928]" : "bg-[#F5F7FA]"
    )}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={cn(
          "text-2xl font-bold",
          resolvedTheme === "dark" ? "text-white" : "text-gray-800"
        )}>
          {isEditMode ? "Editar RDO" : "Novo RDO"}
        </h1>
      </div>

      {loadingRDO ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-12 h-12 border-4 border-meta-orange border-t-meta-blue rounded-full animate-spin"></div>
        </div>
      ) : (
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="obraId">Obra</Label>
                  <Select value={obraId} onValueChange={setObraId}>
                  <SelectTrigger 
                      id="obraId" 
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  >
                      <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                      {loadingObras ? (
                        <SelectItem value="loading" disabled>Carregando obras...</SelectItem>
                      ) : obras.length > 0 ? (
                        obras.map(obra => (
                          <SelectItem key={obra.id} value={obra.id}>
                            {obra.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>Nenhuma obra encontrada</SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
              
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  />
                </div>
                <div>
                    <Label htmlFor="responsavelId">Responsável pelo RDO</Label>
                    <Select value={responsavelId} onValueChange={setResponsavelId}>
                    <SelectTrigger 
                        id="responsavelId"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        {loadingMembros ? (
                          <SelectItem value="loading" disabled>Carregando membros...</SelectItem>
                        ) : membrosEquipe.length > 0 ? (
                          membrosEquipe.map(membro => (
                            <SelectItem key={membro.id} value={membro.id}>
                              {membro.nome} ({membro.funcao})
                          </SelectItem>
                        ))
                      ) : (
                          <SelectItem value="empty" disabled>Nenhum membro cadastrado</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="workDay">Jornada de Trabalho</Label>
                <Select value={workDay} onValueChange={setWorkDay}>
                  <SelectTrigger 
                    id="workDay"
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  >
                    <SelectValue placeholder="Selecione a jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Apenas Manhã</SelectItem>
                    <SelectItem value="morning_afternoon">Manhã e Tarde</SelectItem>
                    <SelectItem value="full_day">Manhã, Tarde e Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(workDay === "morning" || workDay === "morning_afternoon" || workDay === "full_day") && (
                <div>
                  <Label htmlFor="morningWeather">Clima - Manhã</Label>
                  <Select value={morningWeather} onValueChange={setMorningWeather}>
                    <SelectTrigger 
                      id="morningWeather"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunny">Ensolarado</SelectItem>
                      <SelectItem value="cloudy">Nublado</SelectItem>
                      <SelectItem value="rainy">Chuvoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {(workDay === "morning_afternoon" || workDay === "full_day") && (
                <div>
                  <Label htmlFor="afternoonWeather">Clima - Tarde</Label>
                  <Select value={afternoonWeather} onValueChange={setAfternoonWeather}>
                    <SelectTrigger 
                      id="afternoonWeather"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunny">Ensolarado</SelectItem>
                      <SelectItem value="cloudy">Nublado</SelectItem>
                      <SelectItem value="rainy">Chuvoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {workDay === "full_day" && (
                <div>
                  <Label htmlFor="nightWeather">Clima - Noite</Label>
                  <Select value={nightWeather} onValueChange={setNightWeather}>
                    <SelectTrigger 
                      id="nightWeather"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="clear">Céu Limpo</SelectItem>
                      <SelectItem value="cloudy">Nublado</SelectItem>
                      <SelectItem value="rainy">Chuvoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

          {/* Weather Information */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Previsão do Tempo</CardTitle>
          </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="location">Localização</Label>
                <Input 
                  id="location" 
                    placeholder="Ex: São Paulo, SP" 
                  value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                  className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                />
              </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md">
                      {temperature}
            </div>
                    <div className="px-3 py-2 bg-green-100 text-green-800 rounded-md">
                      {condition}
              </div>
                    <div className="px-3 py-2 bg-orange-100 text-orange-800 rounded-md">
                      Precip: {precipitation}
              </div>
                    <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded-md">
                      Vento: {wind}
                    </div>
                  </div>
              </div>
            </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                <Switch
                    id="teamIdle" 
                  checked={isTeamIdle}
                  onCheckedChange={setIsTeamIdle}
                />
                  <Label htmlFor="teamIdle">Equipe ociosa devido ao clima</Label>
              </div>
              
              {isTeamIdle && (
                  <div className="ml-4 w-24">
                    <Label htmlFor="idleHours">Horas</Label>
                  <Input 
                      id="idleHours" 
                    type="number" 
                    value={idleHours} 
                      onChange={(e) => setIdleHours(parseInt(e.target.value))}
                      min="0"
                      max="24"
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

          {/* Team Information */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Equipe</CardTitle>
          </CardHeader>
          <CardContent>
              <TeamMemberForm 
                onAdd={(member) => setTeamMembers([...teamMembers, member])}
                teamMembers={teamMembers}
                onRemove={(id) => setTeamMembers(teamMembers.filter(m => m.id !== id))}
                themeStyle={resolvedTheme === "dark" ? "dark" : "light"}
              />
          </CardContent>
        </Card>

        {/* Activities */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
              <CardTitle className="text-lg">Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList 
                activities={activities}
                setActivities={setActivities}
                preRegisteredActivities={atividadesObra}
                themeStyle={resolvedTheme === "dark" ? "dark" : "light"}
            />
          </CardContent>
        </Card>

        {/* Extra Activities */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Atividades Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList 
                activities={extraActivities}
                setActivities={setExtraActivities}
              isExtra={true}
                themeStyle={resolvedTheme === "dark" ? "dark" : "light"}
            />
          </CardContent>
        </Card>

          {/* Accidents */}
          <Card className={cardBgStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Registro de Acidentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasAccident" 
                  checked={hasAccident}
                  onCheckedChange={setHasAccident}
                />
                <Label htmlFor="hasAccident">Ocorreram acidentes hoje?</Label>
              </div>
              
              {hasAccident && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accidentDetails">Detalhes do Acidente</Label>
                    <Textarea
                      id="accidentDetails"
                      placeholder="Descreva o acidente ocorrido..."
                      value={accidentDetails}
                      onChange={(e) => setAccidentDetails(e.target.value)}
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="peopleInvolved">Pessoas Envolvidas</Label>
                    <Input
                        id="peopleInvolved" 
                      type="number"
                      value={peopleInvolved}
                        onChange={(e) => setPeopleInvolved(parseInt(e.target.value))}
                        min="0"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    />
                  </div>
                  <div>
                      <Label htmlFor="involvedRole">Cargo das Pessoas</Label>
                      <Input 
                        id="involvedRole" 
                        placeholder="Ex: Pedreiro, Ajudante" 
                        value={involvedRole} 
                        onChange={(e) => setInvolvedRole(e.target.value)}
                    className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                  />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Equipment Issues */}
          <Card className={cardBgStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Problemas com Equipamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasEquipmentIssue" 
                  checked={hasEquipmentIssue}
                  onCheckedChange={setHasEquipmentIssue}
                />
                <Label htmlFor="hasEquipmentIssue">Ocorreram problemas com equipamentos?</Label>
              </div>
              
              {hasEquipmentIssue && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="equipmentIssueDetails">Detalhes do Problema</Label>
                    <Textarea
                      id="equipmentIssueDetails"
                      placeholder="Descreva o problema ocorrido..."
                      value={equipmentIssueDetails}
                      onChange={(e) => setEquipmentIssueDetails(e.target.value)}
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="equipmentType">Tipo de Equipamento</Label>
                    <Input
                        id="equipmentType" 
                        placeholder="Ex: Betoneira, Furadeira" 
                      value={equipmentType}
                      onChange={(e) => setEquipmentType(e.target.value)}
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    />
                  </div>
                  <div>
                      <Label htmlFor="equipmentQuantity">Quantidade</Label>
                    <Input
                        id="equipmentQuantity" 
                      type="number"
                      value={equipmentQuantity}
                        onChange={(e) => setEquipmentQuantity(parseInt(e.target.value))}
                        min="0"
                      className={resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    />
                  </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        {/* Observations */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Adicione observações gerais sobre o andamento da obra..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className={cn(
                "min-h-24",
                resolvedTheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
              )}
            />
          </CardContent>
        </Card>

        {/* Photo Records */}
        <Card className={cardBgStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Registros Fotográficos</CardTitle>
          </CardHeader>
          <CardContent>
              <PhotoUploader 
                onPhotosChange={setPhotos}
                initialPhotos={photos}
                themeStyle={resolvedTheme === "dark" ? "dark" : "light"}
              />
          </CardContent>
        </Card>

        {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button
            type="button"
            variant="outline"
              className={resolvedTheme === "dark" ? "bg-gray-700 hover:bg-gray-600 w-full sm:w-auto" : "bg-gray-200 hover:bg-gray-300 w-full sm:w-auto"}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
              className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
          >
            Salvar RDO
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
