import { supabase } from "@/integrations/supabase/client";

// Função para testar a conexão com o Supabase e verificar se o usuário existe
export async function testSupabaseConnectionAndUser() {
  try {
    // Testar a conexão com o Supabase
    const { data: connData, error: connError } = await supabase.from('profiles').select('count').single();
    
    if (connError) {
      console.error("Erro na conexão com o Supabase:", connError.message);
      return { 
        success: false, 
        connectionValid: false,
        userExists: false,
        message: `Erro na conexão: ${connError.message}` 
      };
    }
    
    console.log("Conexão com o Supabase estabelecida com sucesso!");
    
    // Verificar se o usuário matheusnicolas.org@gmail.com existe
    // Primeiro, procuramos pelo email diretamente
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'matheusnicolas.org@gmail.com')
      .maybeSingle();
      
    if (userError) {
      console.error("Erro ao verificar usuário por email:", userError.message);
      return { 
        success: false, 
        connectionValid: true,
        userExists: false,
        message: `Conexão válida, mas erro ao verificar usuário: ${userError.message}` 
      };
    }
    
    // Se não encontramos diretamente por email, podemos tentar outro método
    // Alguns sistemas Supabase armazenam emails na tabela auth.users, não em profiles
    if (!userData) {
      const { data: authUserData, error: authUserError } = await supabase.auth.admin.listUsers();
      
      // Se não temos acesso admin, vamos tentar ver se o usuário atual tem o email
      if (authUserError) {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session?.user.email === 'matheusnicolas.org@gmail.com') {
          return { 
            success: true, 
            connectionValid: true,
            userExists: true,
            message: "Conexão válida e usuário encontrado (usuário atual)" 
          };
        }
        
        // Tente procurar usando o método de autenticação direta
        try {
          // Esta é uma forma indireta de verificar - verificamos se existe um usuário com este email
          // Isso é apenas uma verificação aproximada e pode não funcionar em todos os casos
          const { error: signInError } = await supabase.auth.signInWithOtp({
            email: 'matheusnicolas.org@gmail.com',
            shouldCreateUser: false
          });
          
          // Se não houve erro ao solicitar OTP, o usuário provavelmente existe
          if (!signInError) {
            return { 
              success: true, 
              connectionValid: true,
              userExists: true,
              message: "Conexão válida e o usuário parece existir (verificação por OTP)" 
            };
          }
          
          if (signInError.message.includes("not found") || signInError.message.includes("not exist")) {
            return { 
              success: true, 
              connectionValid: true,
              userExists: false,
              message: "Conexão válida, mas usuário não encontrado" 
            };
          }
        } catch (e) {
          // Ignore erros aqui, pois isso é apenas uma tentativa alternativa
        }
      } else if (authUserData) {
        // Se temos acesso admin, verificamos a lista de usuários
        const userExists = authUserData.users.some(
          user => user.email === 'matheusnicolas.org@gmail.com'
        );
        
        return { 
          success: true, 
          connectionValid: true,
          userExists,
          message: userExists 
            ? "Conexão válida e usuário encontrado na lista de usuários" 
            : "Conexão válida, mas usuário não encontrado na lista de usuários" 
        };
      }
    }
    
    return { 
      success: true, 
      connectionValid: true,
      userExists: !!userData,
      message: userData 
        ? "Conexão válida e usuário encontrado" 
        : "Conexão válida, mas usuário não encontrado" 
    };
  } catch (error) {
    console.error("Erro ao testar conexão com o Supabase:", error);
    return { 
      success: false, 
      connectionValid: false,
      userExists: false,
      message: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}

// Função para verificar e validar a chave do Supabase
export async function validateSupabaseKey() {
  try {
    // Extraia as partes do token JWT
    const token = supabase.supabaseKey;
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return {
        success: false,
        message: "Formato de token inválido (não é um JWT válido)",
        details: null
      };
    }
    
    // Decodificar a parte do payload (segunda parte)
    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar dados importantes no token
    return {
      success: true,
      message: "Analisando token JWT",
      details: {
        issuer: payload.iss,
        reference: payload.ref,
        role: payload.role,
        expirationDate: new Date(payload.exp * 1000).toLocaleString(),
        issuedDate: new Date(payload.iat * 1000).toLocaleString(),
        isExpired: Date.now() > payload.exp * 1000,
        timeUntilExpiration: payload.exp * 1000 > Date.now() 
          ? `${Math.floor((payload.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} dias` 
          : "Expirado"
      }
    };
  } catch (error) {
    console.error("Erro ao validar chave Supabase:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
      details: null
    };
  }
} 