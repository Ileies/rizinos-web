import { apiFetch } from '#lib/api.js';
import type { ErrorCode } from '#lib/contact.js';

/** The server rejects submissions less than 3 seconds after the challenge was issued. */
const MIN_AGE_MS = 3300;
const MAX_CHALLENGE_RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ContactPayload {
	topic: string;
	name: string;
	email: string;
	subject: string;
	message: string;
	locale: string;
	details: Record<string, string>;
	/** Honeypot. Real users never fill it. */
	website: string;
}

export type AttachmentIssue = 'too_many' | 'too_large' | 'unsupported_type' | 'empty';

export type SubmitResult =
	| { ok: true; ref: string }
	| { ok: false; kind: 'validation'; issues: { field: string; code: ErrorCode }[] }
	| { ok: false; kind: 'attachment'; issue: AttachmentIssue }
	| { ok: false; kind: 'rate_limited'; retryAfter: number }
	| { ok: false; kind: 'challenge' | 'network' | 'server' };

export interface Challenge {
	/** Fetch a fresh token in the background so the next submit does not have to wait for the network. */
	prepare(): Promise<void>;
	/** Returns a token that is old enough to be accepted, waiting if needed. Each token is single use. */
	take(): Promise<string | null>;
}

export function createChallenge(): Challenge {
	let current: { token: string; at: number } | null = null;
	let inflight: Promise<void> | null = null;

	function prepare(): Promise<void> {
		inflight ??= (async () => {
			try {
				const res = await apiFetch('/contact/challenge', { cache: 'no-store' });
				if (res.ok) current = { token: (await res.json()).token, at: Date.now() };
			} catch {
				/* handled by take() returning null */
			} finally {
				inflight = null;
			}
		})();
		return inflight;
	}

	async function take(): Promise<string | null> {
		if (!current) await prepare();
		const issued = current as { token: string; at: number } | null;
		if (!issued) return null;
		current = null;
		const wait = issued.at + MIN_AGE_MS - Date.now();
		if (wait > 0) await sleep(wait);
		void prepare();
		return issued.token;
	}

	return { prepare, take };
}

export async function sendContact(
	payload: ContactPayload,
	files: File[],
	challenge: Challenge,
	attempt = 0
): Promise<SubmitResult> {
	const token = await challenge.take();
	if (!token) return { ok: false, kind: 'network' };

	const form = new FormData();
	form.set('payload', JSON.stringify({ ...payload, challenge: token }));
	for (const file of files) form.append('attachments', file);

	let res: Response;
	try {
		res = await apiFetch('/contact', { method: 'POST', body: form });
	} catch {
		return { ok: false, kind: 'network' };
	}

	const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

	if (res.ok && typeof body.ref === 'string') return { ok: true, ref: body.ref };

	if (res.status === 422 && body.error === 'validation') {
		return {
			ok: false,
			kind: 'validation',
			issues: (body.issues ?? []) as { field: string; code: ErrorCode }[]
		};
	}
	if (res.status === 422 && body.error === 'attachment') {
		return { ok: false, kind: 'attachment', issue: body.issue as AttachmentIssue };
	}
	if (res.status === 429) {
		const retryAfter = Number(body.retryAfter ?? res.headers.get('retry-after') ?? 60);
		return {
			ok: false,
			kind: 'rate_limited',
			retryAfter: Number.isFinite(retryAfter) ? retryAfter : 60
		};
	}
	if (res.status === 400 && typeof body.error === 'string' && body.error.startsWith('challenge_')) {
		// Expired, replayed after a server restart, or sent too early: get a fresh one and try again.
		if (attempt < MAX_CHALLENGE_RETRIES) return sendContact(payload, files, challenge, attempt + 1);
		return { ok: false, kind: 'challenge' };
	}
	return { ok: false, kind: 'server' };
}
