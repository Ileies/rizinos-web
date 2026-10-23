<script lang="ts">
	import { Check, Copy } from '@lucide/svelte';
	import * as m from '#lib/messages.svelte.js';

	let { text, class: className = '' }: { text: string; class?: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1600);
	}
</script>

<button
	type="button"
	onclick={copy}
	class="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring/40 inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 {className}"
	aria-label={copied ? m.contact_copied() : m.contact_copy()}
	title={copied ? m.contact_copied() : m.contact_copy()}
>
	{#if copied}
		<Check class="size-4 text-green-600 dark:text-green-400" />
	{:else}
		<Copy class="size-4" />
	{/if}
	<span class="sr-only" aria-live="polite">{copied ? m.contact_copied() : ''}</span>
</button>
