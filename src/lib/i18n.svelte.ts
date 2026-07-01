import { getLocale, locales } from '$lib/messages.svelte';

export function localePath(path: string): string {
	const locale = getLocale();
	const clean = path.startsWith('/') ? path : `/${path}`;
	if (locale === 'en') return clean;
	return `/${locale}${clean}`;
}

export function switchLocalePath(targetLocale: string, pathname: string): string {
	const segments = pathname.split('/').filter(Boolean);
	const firstIsLocale = segments.length > 0 && (locales as readonly string[]).includes(segments[0]);
	const rest = firstIsLocale ? segments.slice(1) : segments;
	const path = rest.length > 0 ? `/${rest.join('/')}/` : '/';
	if (targetLocale === 'en') return path;
	return `/${targetLocale}${path}`;
}

export function pathWithoutLocale(pathname: string): string {
	const segments = pathname.split('/').filter(Boolean);
	const firstIsLocale = segments.length > 0 && (locales as readonly string[]).includes(segments[0]);
	const rest = firstIsLocale ? segments.slice(1) : segments;
	return rest.length > 0 ? `/${rest.join('/')}/` : '/';
}
