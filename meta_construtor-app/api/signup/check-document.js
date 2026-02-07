import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

function normalize(document) {
  return (document || '').toString().replace(/\D/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  const type = (req.query.type || '').toString();
  const value = normalize(req.query.value || '');
  if (!type || !value) {
    return res.status(400).json({ error: 'Parâmetros type e value são obrigatórios' });
  }

  try {
    const column = type === 'cnpj' ? 'cnpj' : 'cpf';
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq(column, value)
      .limit(1);

    if (error) {
      return res.status(200).json({ exists: false });
    }

    return res.status(200).json({ exists: !!(data && data.length) });
  } catch (e) {
    console.error('check-document error', e);
    return res.status(200).json({ exists: false });
  }
}




