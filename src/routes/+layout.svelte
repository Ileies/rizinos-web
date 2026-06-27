<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$ui/homepage/Header.svelte';
	import Footer from '$ui/homepage/Footer.svelte';
	import { session, loadSession } from '$lib/session.svelte';

	let { children } = $props();

	onMount(loadSession);
</script>

<div class="flex min-h-screen flex-col">
	<Header loggedIn={session.loggedIn} sessionLoaded={session.loaded} />
	<main class="flex flex-grow">
		{@render children()}
	</main>
</div>
<Footer />
