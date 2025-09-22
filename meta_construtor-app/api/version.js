export const config = { runtime: 'edge' };

export default function handler(_req) {
	const version = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
	return new Response(
		JSON.stringify({ version }),
		{ headers: { 'content-type': 'application/json' } }
	);
}



