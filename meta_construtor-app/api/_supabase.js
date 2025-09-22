import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
	const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !anon) {
		throw new Error('Supabase env vars missing');
	}
	return createClient(url, anon);
}

export function isDemoMode() {
	return String(process.env.VITE_DEMO_MODE || 'false') === 'true';
}



