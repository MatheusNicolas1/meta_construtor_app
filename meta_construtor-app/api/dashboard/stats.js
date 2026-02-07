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

    // Buscar estatísticas do dashboard
    const [obrasResult, rdosResult, equipamentosResult] = await Promise.all([
      supabase.from('obras').select('*', { count: 'exact' }),
      supabase.from('rdo').select('*', { count: 'exact' }),
      supabase.from('equipamentos').select('*', { count: 'exact' })
    ]);

    const stats = {
      totalObras: obrasResult.count || 0,
      totalRDOs: rdosResult.count || 0,
      totalEquipamentos: equipamentosResult.count || 0,
      obrasEmAndamento: obrasResult.data?.filter(obra => obra.status === 'em_andamento').length || 0,
      rdosHoje: rdosResult.data?.filter(rdo => {
        const hoje = new Date().toISOString().split('T')[0];
        return rdo.data_rdo === hoje;
      }).length || 0
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao buscar stats do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


