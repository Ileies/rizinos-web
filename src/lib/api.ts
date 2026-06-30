import { API_BASE } from '$lib/config';

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
	return fetch(`${API_BASE}${path}`, {
		credentials: 'include',
		...init,
		headers: {
			...(init?.body !== undefined ? { 'content-type': 'application/json' } : {}),
			...init?.headers
		}
	});
}

export async function apiGet<T>(path: string): Promise<T> {
	const res = await apiFetch(path);
	if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
	return res.json() as Promise<T>;
}

export interface ApiResult<T = never> {
	ok: boolean;
	status: number;
	data?: T;
	error?: string;
}

export async function apiPost<T = never>(path: string, body?: unknown): Promise<ApiResult<T>> {
	try {
		const res = await apiFetch(path, {
			method: 'POST',
			body: body !== undefined ? JSON.stringify(body) : undefined
		});
		if (res.ok) {
			try {
				const data = (await res.json()) as T;
				return { ok: true, status: res.status, data };
			} catch {
				return { ok: true, status: res.status };
			}
		}
		let error = `Request failed (${res.status})`;
		try {
			const d = await res.json();
			error = d.message ?? d.error ?? error;
		} catch {
			/* no body */
		}
		return { ok: false, status: res.status, error };
	} catch {
		return { ok: false, status: 0, error: 'Network error' };
	}
}
