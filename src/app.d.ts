// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		// Minimal session user as returned by the backend `GET /api/auth/session`.
		type SessionUser = import('$lib/types').UserData;
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Google Analytics gtag pushes onto this.
	interface Window {
		dataLayer: unknown[];
	}
}

export {};
