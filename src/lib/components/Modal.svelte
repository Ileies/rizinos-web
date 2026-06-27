<script lang="ts">
	import { X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		wide = false,
		children
	}: {
		open: boolean;
		title?: string;
		wide?: boolean;
		children?: Snippet;
	} = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (!dialog) return;
		if (open) dialog.showModal();
		else if (dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	onclose={() => (open = false)}
	class="bg-background text-foreground border-border m-auto max-h-[90vh] overflow-y-auto rounded-lg border p-0 shadow-2xl backdrop:bg-black/60 {wide
		? 'w-full max-w-2xl'
		: 'w-full max-w-md'}"
>
	<div class="bg-background sticky top-0 z-10 flex items-center justify-between border-b px-5 py-3">
		<h2 class="text-sm font-semibold">{title}</h2>
		<button
			onclick={() => (open = false)}
			class="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
		>
			<X size={14} />
		</button>
	</div>
	<div class="px-5 py-4">
		{@render children?.()}
	</div>
</dialog>
