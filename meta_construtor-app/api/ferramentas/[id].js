export const config = { runtime: 'edge' };
// Inline response helpers
function json(data, init = 200, headers = {}) {
	const status = typeof init === 'number' ? init : init?.status ?? 200;
	const baseHeaders = { 'content-type': 'application/json; charset=utf-8', ...headers };
	return new Response(JSON.stringify(data), { status, headers: baseHeaders });
}

function methodNotAllowed(allow = []) {
	return json({ error: 'Method Not Allowed', allow }, 405, { Allow: allow.join(', ') });
}

function notFound(message = 'Not Found') {
	return json({ error: message }, 404);
}

function badRequest(message = 'Bad Request') {
	return json({ error: message }, 400);
}

// Inline Supabase helpers
async function getSupabase() {
	const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !anon) {
		throw new Error('Supabase env vars missing');
	}
	const { createClient } = await import('@supabase/supabase-js');
	return createClient(url, anon);
}

function isDemoMode() {
	return String(process.env.VITE_DEMO_MODE || 'false') === 'true';
}
function adaptFerramentaRow(row) {
	if (!row) return row;
	return {
		id: row.id,
		nome: row.nome,
		patrimonio: row.patrimonio,
		obra_id: row.obra_id,
		status: row.status,
		criado_em: row.criado_em,
		atualizado_em: row.atualizado_em,
	};
}

export default async function handler(req) {
	const { method } = req;
	const url = new URL(req.url);
	const id = url.pathname.split('/').pop();
	if (!id) return badRequest('id obrigatório');

	if (method === 'GET') {
		if (isDemoMode()) {
			return json(adaptFerramentaRow({ 
				id, 
				nome: 'Demo Ferramenta', 
				patrimonio: null,
				obra_id: null,
				status: 'disponivel', 
				criado_em: new Date().toISOString(), 
				atualizado_em: new Date().toISOString()
			}));
		}
		const supabase = await getSupabase();
		const { data, error } = await supabase.from('ferramentas').select('*').eq('id', id).single();
		if (error) return notFound('Ferramenta não encontrada');
		return json(adaptFerramentaRow(data));
	}

	if (method === 'PUT') {
		const body = await req.json().catch(() => null);
		if (!body) return badRequest('Body inválido');
		if (isDemoMode()) {
			return json(adaptFerramentaRow({ id, ...body, atualizado_em: new Date().toISOString() }));
		}
		const supabase = await getSupabase();
		const { data, error } = await supabase.from('ferramentas').update(body).eq('id', id).select('*').single();
		if (error) return badRequest(error.message);
		return json(adaptFerramentaRow(data));
	}

	if (method === 'DELETE') {
		if (isDemoMode()) {
			return json({ success: true });
		}
		const supabase = await getSupabase();
		const { error } = await supabase.from('ferramentas').delete().eq('id', id);
		if (error) return badRequest(error.message);
		return json({ success: true });
	}

	return methodNotAllowed(['GET', 'PUT', 'DELETE']);
}


