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

    // Buscar RDOs recentes (últimos 10)
    const { data, error } = await supabase
      .from('rdo')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar RDOs recentes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Erro ao buscar RDOs recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


