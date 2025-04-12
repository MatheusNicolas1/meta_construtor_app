
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://jchnjeihrutgmfjwnfyo.supabase.co";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaG5qZWlocnV0Z21manduZnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTk2ODIsImV4cCI6MjA1OTE3NTY4Mn0.Mkn0XWEwElTiFWNLjm58PfSoj6QT-zUMisaCQxqtqHs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchRDOData(supabase: any, rdoId: string) {
  try {
    // Fetch the RDO data
    const { data: rdo, error: rdoError } = await supabase
      .from('rdos')
      .select(`
        id,
        date,
        jobSchedule,
        morningWeather,
        afternoonWeather,
        eveningWeather,
        obras:obra_id (
          name,
          description
        ),
        activities:rdo_activities (
          activity_name,
          percentage,
          start_date,
          end_date
        ),
        extraActivities:rdo_extra_activities (
          activity_name,
          percentage,
          start_date,
          end_date
        ),
        teamMembers:rdo_team_members (
          role,
          quantity
        ),
        hasAccidents,
        accidentDetails:rdo_accident_details (
          people_involved,
          role
        ),
        hasEquipmentIssues,
        equipmentIssueDetails:rdo_equipment_issues (
          equipment_type,
          quantity
        ),
        weatherIdle,
        idleHours,
        observations,
        photos:rdo_photos (
          url
        ),
        responsible
      `)
      .eq('id', rdoId)
      .single();
      
    if (rdoError) throw rdoError;
    if (!rdo) throw new Error(`RDO with ID ${rdoId} not found`);
    
    return rdo;
  } catch (error) {
    console.error("Error fetching RDO data:", error);
    throw error;
  }
}

async function analyzeRDOWithGPT(rdoData: any) {
  try {
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Format the RDO data as context for the GPT prompt
    const formattedData = `
      Obra: ${rdoData.obras?.name || 'Não especificada'}
      Data: ${new Date(rdoData.date).toLocaleDateString('pt-BR')}
      Jornada de Trabalho: ${rdoData.jobSchedule || 'Não especificada'}
      Clima - Manhã: ${rdoData.morningWeather || 'Não especificado'}
      ${rdoData.afternoonWeather ? `Clima - Tarde: ${rdoData.afternoonWeather}` : ''}
      ${rdoData.eveningWeather ? `Clima - Noite: ${rdoData.eveningWeather}` : ''}
      
      Equipe:
      ${rdoData.teamMembers?.map((member: any) => `${member.role}: ${member.quantity}`).join('\n') || 'Nenhuma equipe registrada'}
      
      Atividades Realizadas:
      ${rdoData.activities?.map((activity: any) => `${activity.activity_name}: ${activity.percentage}% (Início: ${new Date(activity.start_date).toLocaleDateString('pt-BR')}${activity.end_date ? `, Fim: ${new Date(activity.end_date).toLocaleDateString('pt-BR')}` : ''})`).join('\n') || 'Nenhuma atividade registrada'}
      
      Atividades Extras:
      ${rdoData.extraActivities?.map((activity: any) => `${activity.activity_name}: ${activity.percentage}% (Início: ${new Date(activity.start_date).toLocaleDateString('pt-BR')}${activity.end_date ? `, Fim: ${new Date(activity.end_date).toLocaleDateString('pt-BR')}` : ''})`).join('\n') || 'Nenhuma atividade extra registrada'}
      
      ${rdoData.hasAccidents ? `Acidentes: Sim\nDetalhes: ${rdoData.accidentDetails?.map((detail: any) => `${detail.role}: ${detail.people_involved} pessoas envolvidas`).join('\n') || 'Sem detalhes'}` : 'Acidentes: Não'}
      
      ${rdoData.hasEquipmentIssues ? `Problemas com Equipamentos: Sim\nDetalhes: ${rdoData.equipmentIssueDetails?.map((detail: any) => `${detail.equipment_type}: ${detail.quantity} unidades`).join('\n') || 'Sem detalhes'}` : 'Problemas com Equipamentos: Não'}
      
      ${rdoData.weatherIdle ? `Ociosidade por Clima: Sim (${rdoData.idleHours} horas)` : 'Ociosidade por Clima: Não'}
      
      Observações: ${rdoData.observations || 'Nenhuma observação'}
      
      Responsável: ${rdoData.responsible || 'Não especificado'}
    `;

    // Send the data to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em análise de Relatórios Diários de Obra (RDOs). Sua tarefa é analisar os dados do RDO e fornecer insights úteis sobre o progresso da obra, problemas encontrados e sugestões para melhorar a eficiência."
          },
          {
            role: "user",
            content: `Analise os seguintes dados do RDO e forneça um resumo do progresso da obra, destacando pontos importantes como atrasos, acidentes, problemas com equipamentos e impacto do clima:\n${formattedData}`
          }
        ],
        max_tokens: 800,
        temperature: 0.5
      })
    });

    const data = await response.json();
    return {
      analysis: data.choices?.[0]?.message?.content || "Não foi possível gerar uma análise.",
      rawRDOData: rdoData
    };
  } catch (error) {
    console.error("Error analyzing RDO with GPT:", error);
    throw error;
  }
}

async function updateAnalyticsData(supabase: any, rdoData: any, analysis: string) {
  try {
    // Extract progress data from activities
    const activities = [...(rdoData.activities || []), ...(rdoData.extraActivities || [])];
    const progressData = activities.reduce((acc: any, activity: any) => {
      if (!acc[activity.activity_name]) {
        acc[activity.activity_name] = activity.percentage;
      }
      return acc;
    }, {});
    
    // Calculate overall progress (simple average of all activities)
    const overallProgress = activities.length > 0 
      ? activities.reduce((sum: number, activity: any) => sum + activity.percentage, 0) / activities.length
      : 0;
    
    // Calculate team distribution
    const teamDistribution = rdoData.teamMembers?.reduce((acc: any, member: any) => {
      acc[member.role] = member.quantity;
      return acc;
    }, {}) || {};
    
    // Store analytics data
    const { error } = await supabase
      .from('obra_analytics')
      .upsert({
        obra_id: rdoData.obras.id,
        last_rdo_id: rdoData.id,
        last_rdo_date: rdoData.date,
        overall_progress: overallProgress,
        activity_progress: progressData,
        team_distribution: teamDistribution,
        weather_idle_hours: rdoData.weatherIdle ? rdoData.idleHours || 0 : 0,
        has_accidents: rdoData.hasAccidents,
        has_equipment_issues: rdoData.hasEquipmentIssues,
        gpt_analysis: analysis,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'obra_id'
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error updating analytics data:", error);
    throw error;
  }
}

async function logWhatsAppMessage(supabase: any, rdoId: string, question: string, response: string) {
  try {
    // Store the simulated WhatsApp interaction in a log
    const { error } = await supabase
      .from('whatsapp_message_log')
      .insert({
        rdo_id: rdoId,
        question,
        response,
        timestamp: new Date().toISOString()
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error logging WhatsApp message:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { rdoId, question } = await req.json();
    
    if (!rdoId) {
      return new Response(
        JSON.stringify({ error: "RDO ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Fetch RDO data
    const rdoData = await fetchRDOData(supabase, rdoId);
    
    // Analyze RDO with GPT
    const { analysis, rawRDOData } = await analyzeRDOWithGPT(rdoData);
    
    // Update analytics data
    await updateAnalyticsData(supabase, rdoData, analysis);
    
    // If there's a question, log it as a simulated WhatsApp interaction
    if (question) {
      await logWhatsAppMessage(supabase, rdoId, question, analysis);
    }
    
    // Return the analysis
    return new Response(
      JSON.stringify({ 
        analysis, 
        rdoData: rawRDOData,
        message: "Analytics updated successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error in analyze-rdo function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
