import { refreshSession } from '$lib/session.svelte';
import { apiFetch } from '$lib/api';

export interface AdminResult<T = never> {
	ok: boolean;
	error?: string;
	data?: T;
}

export async function adminGet<T>(
	path: string,
	params?: Record<string, string | number | undefined>
): Promise<T> {
	let query = '';
	if (params) {
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== '') search.set(key, String(value));
		}
		const s = search.toString();
		if (s) query = `?${s}`;
	}
	const res = await apiFetch(`/admin${path}${query}`);
	if (res.status === 401) await refreshSession();
	if (!res.ok) throw new Error(`GET /admin${path} failed (${res.status})`);
	return res.json() as Promise<T>;
}

export async function adminPost<T = never>(
	path: string,
	body: Record<string, unknown>
): Promise<AdminResult<T>> {
	try {
		const res = await apiFetch(`/admin${path}`, {
			method: 'POST',
			body: JSON.stringify(body)
		});
		if (res.status === 401) await refreshSession();
		if (res.ok) {
			try {
				const data = (await res.json()) as T;
				return { ok: true, data };
			} catch {
				return { ok: true };
			}
		}
		let error = `Request failed (${res.status})`;
		try {
			const d = await res.json();
			error = d.message ?? d.error ?? error;
		} catch {
			/* no body */
		}
		return { ok: false, error };
	} catch {
		return { ok: false, error: 'Network error' };
	}
}
