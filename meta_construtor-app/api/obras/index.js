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

function adaptObraRow(row) {
	if (!row) return row;
	return {
		id: row.id,
		titulo: row.titulo,
		descricao: row.descricao,
		endereco: row.endereco || null,
		cliente_id: row.cliente_id || null,
		status: row.status,
		criado_em: row.criado_em,
		atualizado_em: row.atualizado_em,
		attachments: row.attachments || [],
	};
}

export default async function handler(req) {
	const { method } = req;
	const url = new URL(req.url);
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Math.min(Number(url.searchParams.get('pageSize') || '20'), 100);
	const offset = (page - 1) * pageSize;

	if (method === 'GET') {
		if (isDemoMode()) {
			return json([]);
		}
		const supabase = await getSupabase();
		const { data, error } = await supabase
			.from('obras')
			.select('*')
			.order('criado_em', { ascending: false })
			.range(offset, offset + pageSize - 1);
		if (error) return badRequest(error.message);
		return json((data || []).map(adaptObraRow));
	}

	if (method === 'POST') {
		const body = await req.json().catch(() => null);
		if (!body || !body.titulo) return badRequest('titulo é obrigatório');
		if (isDemoMode()) {
			return json(adaptObraRow({ id: crypto.randomUUID(), ...body, status: body.status || 'ativo', criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), attachments: [] }), 201);
		}
		const supabase = await getSupabase();
		const insert = {
			titulo: body.titulo,
			descricao: body.descricao ?? null,
			endereco: body.endereco ?? null,
			cliente_id: body.cliente_id ?? null,
			status: body.status ?? 'ativo',
		};
		const { data, error } = await supabase.from('obras').insert(insert).select('*').single();
		if (error) return badRequest(error.message);
		return json(adaptObraRow(data), 201);
	}

	return methodNotAllowed(['GET', 'POST']);
}


