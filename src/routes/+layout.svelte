<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$ui/homepage/Header.svelte';
	import Footer from '$ui/homepage/Footer.svelte';
	import { session, loadSession } from '$lib/session.svelte';
	import { PUBLIC_GOOGLE_ANALYTICS_ID } from '$env/static/public';

	let { children } = $props();

	onMount(() => {
		loadSession();
		if (PUBLIC_GOOGLE_ANALYTICS_ID) {
			const script = document.createElement('script');
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GOOGLE_ANALYTICS_ID}`;
			document.head.appendChild(script);
			window.dataLayer = window.dataLayer ?? [];
			function gtag(...args: unknown[]) {
				window.dataLayer.push(args);
			}
			gtag('js', new Date());
			gtag('config', PUBLIC_GOOGLE_ANALYTICS_ID);
		}
	});
</script>

<div class="flex min-h-screen flex-col">
	<Header loggedIn={session.loggedIn} sessionLoaded={session.loaded} />
	<main class="flex flex-grow">
		{@render children()}
	</main>
</div>
<Footer />
