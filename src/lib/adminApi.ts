// Thin client for the backend `/api/admin/*` endpoints. The admin dashboard is a
// static SPA, so what used to be SvelteKit form actions + server `load` now go
// over fetch (same origin via the reverse proxy, cookies included automatically).

export async function adminGet<T>(path: string): Promise<T> {
	const res = await fetch(`/api/admin${path}`);
	if (!res.ok) throw new Error(`GET /api/admin${path} failed (${res.status})`);
	return res.json() as Promise<T>;
}

export interface AdminResult {
	ok: boolean;
	error?: string;
}

export async function adminPost(path: string, body: Record<string, unknown>): Promise<AdminResult> {
	const res = await fetch(`/api/admin${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (res.ok) return { ok: true };
	let error = `Request failed (${res.status})`;
	try {
		const data = await res.json();
		error = data.message ?? data.error ?? error;
	} catch {
		/* response had no JSON body */
	}
	return { ok: false, error };
}
