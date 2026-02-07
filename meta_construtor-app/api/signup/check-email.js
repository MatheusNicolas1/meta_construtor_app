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

  const email = (req.query.email || '').toString().trim();
  if (!email) {
    return res.status(400).json({ error: 'Parâmetro email é obrigatório' });
  }

  try {
    // Primeiro tenta na tabela de autenticação pública (auth.users não é acessível via PostgREST)
    // Então verificamos em 'profiles' (espelho comum com campo email)
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .limit(1);

    if (error) {
      return res.status(200).json({ exists: false });
    }

    return res.status(200).json({ exists: !!(data && data.length) });
  } catch (e) {
    console.error('check-email error', e);
    return res.status(200).json({ exists: false });
  }
}




