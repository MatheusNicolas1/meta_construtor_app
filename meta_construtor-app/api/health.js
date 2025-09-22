export const config = { runtime: 'edge' };

export default function handler(_req) {
	return new Response(
		JSON.stringify({ ok: true, status: 'healthy' }),
		{ headers: { 'content-type': 'application/json' } }
	);
}



