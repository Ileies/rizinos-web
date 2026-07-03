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

export async function apiPost<T = never>(path: string, payload?: unknown): Promise<ApiResult<T>> {
	try {
		const res = await apiFetch(path, {
			method: 'POST',
			body: payload !== undefined ? JSON.stringify(payload) : undefined
		});
		let responseData: T | undefined;
		try {
			responseData = (await res.json()) as T;
		} catch {
			/* no body */
		}
		if (res.ok) {
			return { ok: true, status: res.status, data: responseData };
		}
		const d = responseData as Record<string, unknown> | undefined;
		const error = (d?.message ?? d?.error ?? `Request failed (${res.status})`) as string;
		return { ok: false, status: res.status, data: responseData, error };
	} catch {
		return { ok: false, status: 0, error: 'Network error' };
	}
}
