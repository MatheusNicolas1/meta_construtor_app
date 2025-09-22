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
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Math.min(Number(url.searchParams.get('pageSize') || '20'), 100);
	const offset = (page - 1) * pageSize;
	const obra_id = url.searchParams.get('obra_id');
	const status = url.searchParams.get('status');

	if (method === 'GET') {
		if (isDemoMode()) {
			return json([]);
		}
		const supabase = await getSupabase();
		let query = supabase
			.from('ferramentas')
			.select('*')
			.order('criado_em', { ascending: false })
			.range(offset, offset + pageSize - 1);
		
		if (obra_id) query = query.eq('obra_id', obra_id);
		if (status) query = query.eq('status', status);
		
		const { data, error } = await query;
		if (error) return badRequest(error.message);
		return json((data || []).map(adaptFerramentaRow));
	}

	if (method === 'POST') {
		const body = await req.json().catch(() => null);
		if (!body || !body.nome) return badRequest('nome é obrigatório');
		if (isDemoMode()) {
			return json(adaptFerramentaRow({ 
				id: crypto.randomUUID(), 
				...body, 
				status: body.status || 'disponivel',
				criado_em: new Date().toISOString(), 
				atualizado_em: new Date().toISOString()
			}), 201);
		}
		const supabase = await getSupabase();
		const insert = {
			nome: body.nome,
			patrimonio: body.patrimonio ?? null,
			obra_id: body.obra_id ?? null,
			status: body.status ?? 'disponivel',
		};
		const { data, error } = await supabase.from('ferramentas').insert(insert).select('*').single();
		if (error) return badRequest(error.message);
		return json(adaptFerramentaRow(data), 201);
	}

	return methodNotAllowed(['GET', 'POST']);
}


