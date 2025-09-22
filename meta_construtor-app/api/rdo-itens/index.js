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
function adaptRdoItemRow(row) {
	if (!row) return row;
	return {
		id: row.id,
		rdo_id: row.rdo_id,
		descricao: row.descricao,
		quantidade: row.quantidade,
		unidade: row.unidade,
		criado_em: row.criado_em,
	};
}

export default async function handler(req) {
	const { method } = req;
	const url = new URL(req.url);
	const rdoId = url.searchParams.get('rdo_id');
	if (!rdoId) return badRequest('rdo_id é obrigatório');

	if (method === 'GET') {
		if (isDemoMode()) {
			return json([]);
		}
		const supabase = await getSupabase();
		const { data, error } = await supabase
			.from('rdo_itens')
			.select('*')
			.eq('rdo_id', rdoId)
			.order('criado_em', { ascending: true });
		if (error) return badRequest(error.message);
		return json((data || []).map(adaptRdoItemRow));
	}

	if (method === 'POST') {
		const body = await req.json().catch(() => null);
		if (!body || !body.descricao) return badRequest('descricao é obrigatória');
		if (isDemoMode()) {
			return json(adaptRdoItemRow({ 
				id: crypto.randomUUID(), 
				rdo_id: rdoId,
				...body, 
				criado_em: new Date().toISOString()
			}), 201);
		}
		const supabase = await getSupabase();
		const insert = {
			rdo_id: rdoId,
			descricao: body.descricao,
			quantidade: body.quantidade ?? null,
			unidade: body.unidade ?? null,
		};
		const { data, error } = await supabase.from('rdo_itens').insert(insert).select('*').single();
		if (error) return badRequest(error.message);
		return json(adaptRdoItemRow(data), 201);
	}

	return methodNotAllowed(['GET', 'POST']);
}


