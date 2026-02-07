import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  const phone = (req.query.phone || '').toString().trim();
  if (!phone) {
    return res.status(400).json({ error: 'Parâmetro phone é obrigatório' });
  }

  try {
    // Tenta procurar em uma tabela de perfis comum
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('phone', `%${phone}%`)
      .limit(1);

    if (error) {
      // Se a tabela não existir, retorna como não encontrado (fluxo segue)
      return res.status(200).json({ exists: false });
    }

    return res.status(200).json({ exists: !!(data && data.length) });
  } catch (e) {
    console.error('check-phone error', e);
    return res.status(200).json({ exists: false });
  }
}




