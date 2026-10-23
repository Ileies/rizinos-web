import { browser } from '$app/env';
import { apiGet } from '#lib/api.js';
import type { PublicStatus } from '#lib/status.js';

// Live status for /status. Polls every 30 seconds, pauses while the tab is hidden, backs off
// after errors, and falls back to the last good payload from localStorage so a backend outage
// never leaves the page blank.

const POLL_MS = 30_000;
const MAX_BACKOFF_MS = 120_000;
const CACHE_KEY = 'rizinos.status.v1';

let _status = $state<PublicStatus | null>(null);
let _loading = $state(true);
let _error = $state(false);
let _fromCache = $state(false);
let _fetchedAt = $state<number | null>(null);
let _now = $state(Date.now());

export const statusStore = {
	get status() {
		return _status;
	},
	/** True until the first fetch settles. */
	get loading() {
		return _loading;
	},
	/** The last fetch failed. `status` may still hold older data. */
	get error() {
		return _error;
	},
	/** `status` was restored from this browser's cache, not freshly fetched. */
	get fromCache() {
		return _fromCache;
	},
	/** When the data on screen was last fetched, in ms. */
	get fetchedAt() {
		return _fetchedAt;
	},
	/** Ticks along so relative times stay fresh without refetching. */
	get now() {
		return _now;
	}
};

function readCache(): { status: PublicStatus; at: number } | null {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function writeCache(status: PublicStatus) {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify({ status, at: Date.now() }));
	} catch {
		/* private mode or quota: the cache is only a convenience */
	}
}

async function fetchOnce(signal: AbortSignal): Promise<boolean> {
	try {
		const timeout = AbortSignal.timeout(10_000);
		const status = await apiGet<PublicStatus>('/status', AbortSignal.any([signal, timeout]));
		_status = status;
		_error = false;
		_fromCache = false;
		_fetchedAt = Date.now();
		writeCache(status);
		return true;
	} catch {
		if (signal.aborted) return true;
		_error = true;
		if (!_status) {
			const cached = readCache();
			if (cached) {
				_status = cached.status;
				_fromCache = true;
				_fetchedAt = cached.at;
			}
		}
		return false;
	} finally {
		_loading = false;
	}
}

/** Starts polling and returns the stop function. Call from `onMount`. */
export function startStatusPolling(): () => void {
	if (!browser) return () => {};

	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	let failures = 0;

	const schedule = () => {
		clearTimeout(timer);
		if (controller.signal.aborted) return;
		const delay = failures ? Math.min(POLL_MS * 2 ** failures, MAX_BACKOFF_MS) : POLL_MS;
		timer = setTimeout(tick, delay);
	};

	const tick = async () => {
		if (document.hidden) return; // resumed by visibilitychange
		failures = (await fetchOnce(controller.signal)) ? 0 : failures + 1;
		schedule();
	};

	const onVisible = () => {
		if (!document.hidden) {
			clearTimeout(timer);
			void tick();
		}
	};

	const clock = setInterval(() => (_now = Date.now()), 15_000);
	document.addEventListener('visibilitychange', onVisible);
	void tick();

	return () => {
		controller.abort();
		clearTimeout(timer);
		clearInterval(clock);
		document.removeEventListener('visibilitychange', onVisible);
	};
}

/** Fetches immediately, e.g. after an admin changed something. */
export async function refreshStatus(): Promise<void> {
	await fetchOnce(new AbortController().signal);
}
