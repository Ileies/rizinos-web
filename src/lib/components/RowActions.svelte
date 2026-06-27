<script lang="ts">
	import { Pencil, Trash2 } from '@lucide/svelte';

	let { onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void } = $props();
</script>

<div class="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
	{#if onEdit}
		<button
			onclick={onEdit}
			class="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5"
			title="Edit"
		>
			<Pencil size={13} />
		</button>
	{/if}
	{#if onDelete}
		<button
			onclick={onDelete}
			class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1.5"
			title="Delete"
		>
			<Trash2 size={13} />
		</button>
	{/if}
</div>
