<script lang="ts">
	import { setLocale } from '$lib/messages.svelte';

	let { data, children } = $props();

	$effect(() => {
		setLocale(data.locale);
	});
</script>

{@render children()}
