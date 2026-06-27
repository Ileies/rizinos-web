<script lang="ts">
	import type { Snippet } from 'svelte';
	import AdminTabs, { type AdminTab } from '$lib/components/AdminTabs.svelte';

	let {
		error = '',
		tabs,
		active = $bindable(),
		toolbar,
		children
	}: {
		error?: string;
		tabs: AdminTab[];
		active: string;
		/** Optional action row (e.g. an "Add" button) rendered above the content. */
		toolbar?: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="mx-auto max-w-7xl px-6 py-4">
	{#if error}
		<div class="bg-destructive/10 text-destructive mb-3 rounded px-3 py-2 text-sm">{error}</div>
	{/if}
	<AdminTabs {tabs} bind:active />
	{#if toolbar}
		<div class="mb-3">{@render toolbar()}</div>
	{/if}
	{@render children()}
</div>
