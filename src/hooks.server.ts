import type { Handle } from '@sveltejs/kit/hooks';
import { runWithLocale, locales } from '#lib/messages.svelte.js';

export const handle: Handle = async ({ event, resolve }) => {
	const segments = event.url.pathname.split('/').filter(Boolean);
	const first = segments[0] ?? '';
	const locale = (locales as readonly string[]).includes(first) ? first : 'en';
	return runWithLocale(locale, () => resolve(event));
};
