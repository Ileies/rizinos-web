<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$ui/homepage/Header.svelte';
	import Footer from '$ui/homepage/Footer.svelte';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import { session, loadSession } from '$lib/session.svelte';
	import { PUBLIC_GOOGLE_ANALYTICS_ID } from '$env/static/public';

	let { children } = $props();

	let showBanner = $state(false);

	function getConsentCookie(): string | null {
		const match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/);
		return match ? match[1] : null;
	}

	function loadAnalytics() {
		if (!PUBLIC_GOOGLE_ANALYTICS_ID) return;
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

	function handleConsent(accepted: boolean) {
		showBanner = false;
		if (accepted) loadAnalytics();
	}

	onMount(() => {
		loadSession();
		const consent = getConsentCookie();
		if (consent === 'accepted') {
			loadAnalytics();
		} else if (consent === null) {
			showBanner = true;
		}
	});
</script>

<div class="flex min-h-screen flex-col">
	<Header loggedIn={session.loggedIn} sessionLoaded={session.loaded} isAdmin={session.isAdmin} />
	<main class="flex flex-grow">
		{@render children()}
	</main>
</div>
<Footer />
{#if showBanner}
	<CookieBanner onConsent={handleConsent} />
{/if}
