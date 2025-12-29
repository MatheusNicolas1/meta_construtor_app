import { eventManager } from '@/services/eventManager';
import { integrationService } from '@/services/integrationService';
import { IntegrationEvent } from '@/types/integration';

/**
 * Utility functions to help with common integration workflows
 * following the integration blueprint requirements
 */

export class IntegrationHelpers {
  
  /**
   * Fluxo 1: Obra Criada
   * Dispara notificações para WhatsApp, e-mail e sincroniza com Google Drive
   */
  static async handleObraCriada(obraData: any) {
    try {
      // Disparar evento principal
      const result = await eventManager.dispatchObraCreated(obraData.id, obraData);
      
      if (result.success) {
        // Executar integrações específicas em paralelo
        const promises = [
          // WhatsApp: Notificar responsáveis
          integrationService.sendWhatsAppMessage(
            obraData.responsavel?.telefone,
            `🏗️ Nova obra criada: ${obraData.nome}\nResponsável: ${obraData.responsavel?.nome}\nPrazo: ${obraData.prazo}`
          ),
          
          // Gmail: Enviar resumo para gestores
          integrationService.sendEmail(
            obraData.gestores || [],
            `Nova Obra: ${obraData.nome}`,
            `Uma nova obra foi cadastrada no sistema:\n\nNome: ${obraData.nome}\nResponsável: ${obraData.responsavel?.nome}\nData de Início: ${obraData.dataInicio}\nPrazo: ${obraData.prazo}`
          )
        ];

        // Aguardar resultados
        const results = await Promise.allSettled(promises);
        
        // Log dos resultados
        results.forEach((result, index) => {
          const service = index === 0 ? 'WhatsApp' : 'Gmail';
          if (result.status === 'fulfilled') {
            console.log(`✅ ${service} notification sent successfully`);
          } else {
            console.error(`❌ ${service} notification failed:`, result.reason);
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro no fluxo de obra criada:', error);
      throw error;
    }
  }

  /**
   * Fluxo 2: RDO Aprovado
   * Envia relatório por e-mail e notifica equipe via WhatsApp
   */
  static async handleRDOAprovado(rdoData: any) {
    try {
      // Disparar evento
      const result = await eventManager.dispatchRDOApproved(rdoData.id, rdoData);
      
      if (result.success) {
        const promises = [
          // E-mail com relatório detalhado
          integrationService.sendEmail(
            rdoData.supervisores || [],
            `RDO Aprovado - ${rdoData.obra?.nome}`,
            `RDO aprovado com sucesso!\n\nObra: ${rdoData.obra?.nome}\nData: ${rdoData.data}\nAtividades: ${rdoData.atividades?.length || 0}\nEquipe: ${rdoData.equipe?.length || 0} colaboradores`
          ),
          
          // WhatsApp para equipe
          ...(rdoData.equipe || []).map((colaborador: any) => 
            integrationService.sendWhatsAppMessage(
              colaborador.telefone,
              `✅ RDO aprovado para ${rdoData.obra?.nome} em ${rdoData.data}. Bom trabalho!`
            )
          )
        ];

        await Promise.allSettled(promises);
      }
      
      return result;
    } catch (error) {
      console.error('Erro no fluxo de RDO aprovado:', error);
      throw error;
    }
  }

  /**
   * Fluxo 3: Documento Carregado
   * Upload automático para Google Drive
   */
  static async handleDocumentoUpload(file: File, obraId: string, tipo: string) {
    try {
      // Upload para Google Drive
      const driveResult = await integrationService.uploadToGoogleDrive(
        file, 
        `/MetaConstrutor/Obras/${obraId}/${tipo}`
      );
      
      if (driveResult.success) {
        // Disparar evento de documento carregado
        await eventManager.dispatchDocumentoUploaded(driveResult.data.fileId, {
          fileName: file.name,
          obraId,
          tipo,
          url: driveResult.data.url,
          uploadedAt: new Date().toISOString()
        });
        
        // Notificar responsáveis
        await integrationService.sendWhatsAppMessage(
          '+5511999999999', // TODO: Get from obra data
          `📎 Novo documento carregado: ${file.name}\nObra: ${obraId}\nTipo: ${tipo}`
        );
      }
      
      return driveResult;
    } catch (error) {
      console.error('Erro no upload de documento:', error);
      throw error;
    }
  }

  /**
   * Fluxo 4: Atividade Atrasada
   * Notificação urgente para responsáveis
   */
  static async handleAtividadeAtrasada(atividadeData: any) {
    try {
      // Disparar evento urgente
      await eventManager.dispatch({
        event: 'notification.urgent',
        entityId: atividadeData.id,
        entityType: 'atividade',
        data: atividadeData,
        timestamp: new Date().toISOString(),
        metadata: {
          priority: 'high',
          reason: 'overdue'
        }
      });
      
      // Notificações urgentes simultâneas
      const promises = [
        // WhatsApp para responsável
        integrationService.sendWhatsAppMessage(
          atividadeData.responsavel?.telefone,
          `⚠️ ATIVIDADE ATRASADA\n\n${atividadeData.nome}\nObra: ${atividadeData.obra?.nome}\nPrazo: ${atividadeData.prazo}\n\nAção necessária!`
        ),
        
        // E-mail para gestores
        integrationService.sendEmail(
          atividadeData.gestores || [],
          `🚨 Atividade Atrasada: ${atividadeData.nome}`,
          `ALERTA: A atividade "${atividadeData.nome}" da obra "${atividadeData.obra?.nome}" está atrasada.\n\nPrazo original: ${atividadeData.prazo}\nResponsável: ${atividadeData.responsavel?.nome}\n\nAcompanhe o progresso no sistema.`
        )
      ];
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Erro no fluxo de atividade atrasada:', error);
      throw error;
    }
  }

  /**
   * Fluxo 5: Relatório Diário Automático
   */
  static async handleRelatorioDaily(obraId?: string) {
    try {
      // Gerar dados do relatório (mock para exemplo)
      const relatorioData = {
        data: new Date().toISOString(),
        obraId,
        resumo: {
          atividades: 15,
          concluidas: 12,
          atrasadas: 2,
          equipePresente: 25
        }
      };
      
      // Disparar evento
      await eventManager.dispatch({
        event: 'report.daily',
        entityId: `relatorio-${Date.now()}`,
        entityType: 'relatorio',
        data: relatorioData,
        timestamp: new Date().toISOString()
      });
      
      // Enviar relatório por e-mail
      const emailResult = await integrationService.sendEmail(
        ['gestor@empresa.com'], // TODO: Get from configuration
        `Relatório Diário ${obraId ? `- Obra ${obraId}` : '- Geral'}`,
        `Resumo das atividades do dia:\n\n• Atividades: ${relatorioData.resumo.atividades}\n• Concluídas: ${relatorioData.resumo.concluidas}\n• Atrasadas: ${relatorioData.resumo.atrasadas}\n• Equipe presente: ${relatorioData.resumo.equipePresente}\n\nAcesse o sistema para mais detalhes.`
      );
      
      return emailResult;
    } catch (error) {
      console.error('Erro no relatório diário:', error);
      throw error;
    }
  }

  /**
   * Utilitário para testar toda a cadeia de integrações
   */
  static async testIntegrationChain() {
    console.log('🧪 Iniciando teste completo da cadeia de integrações...');
    
    try {
      // Teste 1: Criar obra de teste
      console.log('1️⃣ Testando criação de obra...');
      await this.handleObraCriada({
        id: 'obra-teste-123',
        nome: 'Obra Teste - Integração',
        responsavel: { nome: 'João Silva', telefone: '+5511999999999' },
        gestores: ['gestor@teste.com'],
        prazo: '2025-12-31'
      });
      
      // Teste 2: Aprovar RDO
      console.log('2️⃣ Testando aprovação de RDO...');
      await this.handleRDOAprovado({
        id: 'rdo-teste-456',
        data: new Date().toISOString().split('T')[0],
        obra: { nome: 'Obra Teste' },
        supervisores: ['supervisor@teste.com']
      });
      
      // Teste 3: Relatório diário
      console.log('3️⃣ Testando relatório diário...');
      await this.handleRelatorioDaily('obra-teste-123');
      
      console.log('✅ Teste completo finalizado com sucesso!');
      return { success: true, message: 'Cadeia de integrações testada com sucesso' };
      
    } catch (error) {
      console.error('❌ Falha no teste da cadeia:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
}

export default IntegrationHelpers;