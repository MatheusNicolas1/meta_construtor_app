export const config = { runtime: 'edge' };
// Inline response helpers
function json(data, init = 200, headers = {}) {
	const status = typeof init === 'number' ? init : init?.status ?? 200;
	const baseHeaders = { 'content-type': 'application/json; charset=utf-8', ...headers };
	return new Response(JSON.stringify(data), { status, headers: baseHeaders });
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
	if (method !== 'POST') {
		return json({ error: 'Method Not Allowed' }, 405);
	}

	const url = new URL(req.url);
	const parent_table = url.searchParams.get('parent_table');
	const parent_id = url.searchParams.get('parent_id');

	if (!parent_table || !parent_id) {
		return badRequest('parent_table e parent_id são obrigatórios');
	}

	// Verificar se é multipart/form-data ou JSON
	const contentType = req.headers.get('content-type') || '';
	
	if (contentType.includes('multipart/form-data')) {
		// Upload de arquivo via multipart
		const formData = await req.formData();
		const file = formData.get('file');
		
		if (!file) return badRequest('Arquivo não encontrado');
		
		// Validar tipo e tamanho
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
		if (!allowedTypes.includes(file.type)) {
			return badRequest('Tipo de arquivo não permitido');
		}
		
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return badRequest('Arquivo muito grande (máximo 10MB)');
		}

		if (isDemoMode()) {
			return json(adaptAttachmentRow({
				id: crypto.randomUUID(),
				parent_table,
				parent_id,
				filename: file.name,
				content_type: file.type,
				size: file.size,
				url: 'https://example.com/demo-upload.pdf',
				criado_em: new Date().toISOString()
			}), 201);
		}

		const supabase = await getSupabase();
		const fileExt = file.name.split('.').pop();
		const fileName = `${crypto.randomUUID()}.${fileExt}`;
		const bucketPath = `${parent_table}/${parent_id}/${fileName}`;

		// Upload para Supabase Storage
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('attachments')
			.upload(bucketPath, file);

		if (uploadError) return badRequest('Erro no upload: ' + uploadError.message);

		// Obter URL pública
		const { data: urlData } = supabase.storage
			.from('attachments')
			.getPublicUrl(bucketPath);

		// Salvar metadados no banco
		const { data, error } = await supabase
			.from('attachments')
			.insert({
				parent_table,
				parent_id,
				bucket_path: bucketPath,
				filename: file.name,
				content_type: file.type,
				size: file.size,
				url: urlData.publicUrl
			})
			.select('*')
			.single();

		if (error) return badRequest('Erro ao salvar metadados: ' + error.message);

		return json(adaptAttachmentRow(data), 201);
	} else {
		// Upload via URL (JSON)
		const body = await req.json().catch(() => null);
		if (!body || !body.file_url) return badRequest('file_url é obrigatório');

		if (isDemoMode()) {
			return json(adaptAttachmentRow({
				id: crypto.randomUUID(),
				parent_table,
				parent_id,
				filename: body.filename || 'arquivo.pdf',
				content_type: body.content_type || 'application/pdf',
				size: body.size || 0,
				url: body.file_url,
				criado_em: new Date().toISOString()
			}), 201);
		}

		const supabase = await getSupabase();
		const { data, error } = await supabase
			.from('attachments')
			.insert({
				parent_table,
				parent_id,
				bucket_path: '', // Não há arquivo no storage
				filename: body.filename || 'arquivo.pdf',
				content_type: body.content_type || 'application/pdf',
				size: body.size || 0,
				url: body.file_url
			})
			.select('*')
			.single();

		if (error) return badRequest('Erro ao salvar: ' + error.message);

		return json(adaptAttachmentRow(data), 201);
	}
}
