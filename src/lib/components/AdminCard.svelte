<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		onclick,
		children
	}: {
		onclick?: () => void;
		children: Snippet;
	} = $props();
</script>

{#if onclick}
	<div
		class="hover:bg-muted/40 cursor-pointer space-y-1.5 rounded-lg border p-2.5"
		role="button"
		tabindex="0"
		{onclick}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onclick();
			}
		}}
	>
		{@render children()}
	</div>
{:else}
	<div class="space-y-1.5 rounded-lg border p-2.5">
		{@render children()}
	</div>
{/if}
