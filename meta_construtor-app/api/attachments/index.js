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
function adaptAttachmentRow(row) {
	if (!row) return row;
	return {
		id: row.id,
		parent_table: row.parent_table,
		parent_id: row.parent_id,
		filename: row.filename,
		content_type: row.content_type,
		size: row.size,
		url: row.url,
		criado_em: row.criado_em,
	};
}

export default async function handler(req) {
	const { method } = req;
	const url = new URL(req.url);
	const parent_table = url.searchParams.get('parent_table');
	const parent_id = url.searchParams.get('parent_id');

	if (method === 'GET') {
		if (!parent_table || !parent_id) {
			return badRequest('parent_table e parent_id são obrigatórios');
		}
		
		if (isDemoMode()) {
			return json([]);
		}
		
		const supabase = await getSupabase();
		const { data, error } = await supabase
			.from('attachments')
			.select('*')
			.eq('parent_table', parent_table)
			.eq('parent_id', parent_id)
			.order('criado_em', { ascending: false });
		
		if (error) return badRequest(error.message);
		return json((data || []).map(adaptAttachmentRow));
	}

	return methodNotAllowed(['GET']);
}


