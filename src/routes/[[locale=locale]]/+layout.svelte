<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { setLocale, locales } from '$lib/messages.svelte';

	let { data, children } = $props();

	$effect(() => {
		if (data.localeFromUrl) {
			setLocale(data.locale);
			return;
		}
		// No locale in URL - read cookie without overwriting it.
		// If cookie is non-English, redirect to the prefixed URL.
		const m = document.cookie.match(/(?:^|;\s*)LOCALE=([^;]+)/);
		const cookieLocale = m ? m[1] : null;
		if (
			cookieLocale &&
			(locales as readonly string[]).includes(cookieLocale) &&
			cookieLocale !== 'en'
		) {
			goto(`/${cookieLocale}${page.url.pathname}`, { replaceState: true });
		}
	});
</script>

{@render children()}
