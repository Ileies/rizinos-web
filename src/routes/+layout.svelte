<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Header from '$ui/homepage/Header.svelte';
	import Footer from '$ui/homepage/Footer.svelte';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import { session, loadSession } from '$lib/session.svelte';
	import { getLocale } from '$lib/messages.svelte';
	import { PUBLIC_GOOGLE_ANALYTICS_ID, PUBLIC_ORIGIN } from '$env/static/public';

	const LANG_TAG: Record<string, string> = { de: 'de', en: 'en', cn: 'zh-CN', ru: 'ru' };
	const OG_LOCALE: Record<string, string> = { de: 'de_DE', en: 'en_US', cn: 'zh_CN', ru: 'ru_RU' };

	const htmlLang = $derived(LANG_TAG[getLocale()] ?? 'en');
	const ogLocale = $derived(OG_LOCALE[getLocale()] ?? 'en_US');

	$effect(() => {
		document.documentElement.lang = htmlLang;
	});

	const SEO_DEFAULTS = {
		robots: 'index, follow',
		ogImage: '/socialcard.jpeg',
		ogType: 'website'
	};

	const seo = $derived({ ...SEO_DEFAULTS, ...page.data.seo });

	function jsonLdTag(data: string) {
		return '<script type="application/ld+json">' + data + '</' + 'script>';
	}

	const ldSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': `https://${PUBLIC_ORIGIN}/#organization`,
				name: 'RizinOS',
				url: `https://${PUBLIC_ORIGIN}/`,
				logo: {
					'@type': 'ImageObject',
					url: `https://${PUBLIC_ORIGIN}/icon-512.png`
				}
			},
			{
				'@type': 'WebSite',
				'@id': `https://${PUBLIC_ORIGIN}/#website`,
				name: 'RizinOS',
				url: `https://${PUBLIC_ORIGIN}/`,
				publisher: { '@id': `https://${PUBLIC_ORIGIN}/#organization` }
			}
		]
	});

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

	const breadcrumbSchema = $derived.by(() => {
		const segments = page.url.pathname.split('/').filter(Boolean);
		if (segments.length === 0) return null;
		const items = [{ name: 'Home', item: `https://${PUBLIC_ORIGIN}/` }];
		let path = '';
		for (const seg of segments) {
			path += `/${seg}`;
			const name = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
			items.push({ name, item: `https://${PUBLIC_ORIGIN}${path}/` });
		}
		return JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items.map((bc, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: bc.name,
				item: bc.item
			}))
		});
	});
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<meta name="robots" content={seo.robots} />
	<link rel="canonical" href="https://{PUBLIC_ORIGIN}{page.url.pathname}" />
	<meta property="og:type" content={seo.ogType} />
	<meta property="og:url" content="https://{PUBLIC_ORIGIN}{page.url.pathname}" />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:image" content="https://{PUBLIC_ORIGIN}{seo.ogImage}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="RizinOS" />
	<meta property="og:locale" content={ogLocale} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@rizinos" />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content="https://{PUBLIC_ORIGIN}{seo.ogImage}" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdTag(ldSchema)}
	{#if breadcrumbSchema}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html jsonLdTag(breadcrumbSchema)}
	{/if}
	{#if seo.jsonLd}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html jsonLdTag(JSON.stringify(seo.jsonLd))}
	{/if}
</svelte:head>

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
