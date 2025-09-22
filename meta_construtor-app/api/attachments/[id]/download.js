export const config = { runtime: 'edge' };
// Inline response helpers
function json(data, init = 200, headers = {}) {
	const status = typeof init === 'number' ? init : init?.status ?? 200;
	const baseHeaders = { 'content-type': 'application/json; charset=utf-8', ...headers };
	return new Response(JSON.stringify(data), { status, headers: baseHeaders });
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

export default async function handler(req) {
	const { method } = req;
	if (method !== 'GET') {
		return json({ error: 'Method Not Allowed' }, 405);
	}

	const url = new URL(req.url);
	const id = url.pathname.split('/')[3];
	if (!id) return badRequest('id obrigatório');

	if (isDemoMode()) {
		return json({ 
			signed_url: 'https://example.com/demo-download.pdf',
			expires_in: 3600 
		});
	}

	const supabase = await getSupabase();
	const { data: attachment, error } = await supabase
		.from('attachments')
		.select('*')
		.eq('id', id)
		.single();

	if (error || !attachment) return notFound('Anexo não encontrado');

	// Gerar signed URL para download
	const { data: signedUrl, error: urlError } = await supabase.storage
		.from('attachments')
		.createSignedUrl(attachment.bucket_path, 3600); // 1 hora

	if (urlError) return badRequest('Erro ao gerar URL de download');

	return json({ 
		signed_url: signedUrl.signedUrl,
		expires_in: 3600,
		filename: attachment.filename,
		content_type: attachment.content_type,
		size: attachment.size
	});
}
