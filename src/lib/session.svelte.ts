import { browser } from '$app/environment';
import { Role } from '$lib/types';

// Client-side session state for the static frontend. There is no server load
// here, so login status comes from the backend's `GET /api/auth/session`
// (same origin via the reverse proxy) and is exposed as a reactive rune.

let _user = $state<App.SessionUser | null>(null);
let _loaded = $state(false);
let _error = $state(false);

export const session = {
	get user() {
		return _user;
	},
	get loggedIn() {
		return !!_user;
	},
	get isAdmin() {
		return _user?.roles?.includes(Role.Admin) ?? false;
	},
	get loaded() {
		return _loaded;
	},
	/** true if the session fetch failed (network error or non-ok response) */
	get error() {
		return _error;
	}
};

let _promise: Promise<void> | null = null;

/** Fetch the current session once and cache it. Safe to call from any mount. */
export function loadSession(): Promise<void> {
	if (!browser) return Promise.resolve();
	if (_promise) return _promise;
	_promise = fetch('/api/auth/session')
		.then((r) => {
			if (!r.ok) {
				_error = true;
				return { user: null };
			}
			return r.json();
		})
		.then((d) => {
			_user = d.user ?? null;
		})
		.catch(() => {
			_user = null;
			_error = true;
		})
		.finally(() => {
			_loaded = true;
		});
	return _promise;
}

/** Clear the cached session and re-fetch. Call after login or logout. */
export function refreshSession(): Promise<void> {
	_promise = null;
	_user = null;
	_loaded = false;
	_error = false;
	return loadSession();
}
