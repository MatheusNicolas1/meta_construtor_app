import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Permitir apenas métodos GET e HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Para HEAD requests, apenas retornar status 200
    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    // Verificar se há token de autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token de autenticação necessário' });
    }

    // Extrair token do header
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar sessão com o token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Retornar dados do perfil do usuário
    const profile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      avatar: user.user_metadata?.avatar_url || null,
      role: 'Administrador', // Default role
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


