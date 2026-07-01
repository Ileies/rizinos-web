<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getLocale } from '$lib/messages.svelte';

	if (browser) {
		goto(`/${getLocale()}/`, { replaceState: true });
	}
</script>

<svelte:head>
	<meta http-equiv="refresh" content="0; url=/en/" />
	<link rel="canonical" href="/en/" />
</svelte:head>
