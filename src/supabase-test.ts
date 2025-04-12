import { supabase } from "@/integrations/supabase/client";

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    // Testar a conexão recuperando a sessão atual
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erro na conexão com o Supabase:", error.message);
      return { success: false, message: error.message };
    }
    
    // Testar se podemos consultar uma tabela pública
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .select('*')
      .limit(1);
      
    if (planError) {
      console.error("Erro ao consultar tabela de planos:", planError.message);
      return { success: false, message: planError.message };
    }
    
    console.log("Conexão com o Supabase bem-sucedida!");
    console.log("Sessão:", data.session ? "Existe" : "Não existe");
    console.log("Planos encontrados:", planData ? planData.length : 0);
    
    return { 
      success: true, 
      message: "Conexão com o Supabase estabelecida com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao testar conexão com o Supabase:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
} 