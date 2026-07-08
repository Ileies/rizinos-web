<script lang="ts">
	import type { Snippet } from 'svelte';

	let { center = false, children }: { center?: boolean; children: Snippet } = $props();
</script>

<div
	class="border-border bg-card relative w-full max-w-sm rounded-2xl border p-8 shadow-sm {center
		? 'text-center'
		: ''}"
>
	{@render children()}
</div>
