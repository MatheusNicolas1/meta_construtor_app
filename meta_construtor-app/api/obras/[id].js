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
	const id = url.pathname.split('/').pop();
	if (!id) return badRequest('id obrigatório');

	if (method === 'GET') {
		if (isDemoMode()) {
			return json(adaptObraRow({ id, titulo: 'Demo', descricao: null, status: 'ativo', criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), attachments: [] }));
		}
		const supabase = await getSupabase();
		const { data, error } = await supabase.from('obras').select('*').eq('id', id).single();
		if (error) return notFound('Obra não encontrada');
		return json(adaptObraRow(data));
	}

	if (method === 'PUT') {
		const body = await req.json().catch(() => null);
		if (!body) return badRequest('Body inválido');
		if (isDemoMode()) {
			return json(adaptObraRow({ id, ...body, atualizado_em: new Date().toISOString() }));
		}
		const supabase = await getSupabase();
		const { data, error } = await supabase.from('obras').update(body).eq('id', id).select('*').single();
		if (error) return badRequest(error.message);
		return json(adaptObraRow(data));
	}

	if (method === 'DELETE') {
		const supabase = await getSupabase();
		const { data, error } = await supabase.from('obras').update({ status: 'inativo' }).eq('id', id).select('*').single();
		if (error) return badRequest(error.message);
		return json(adaptObraRow(data));
	}

	return methodNotAllowed(['GET', 'PUT', 'DELETE']);
}


