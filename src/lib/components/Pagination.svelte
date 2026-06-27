<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	interface Props {
		page: number;
		total: number;
		pageSize: number;
		onPageChange: (page: number) => void;
	}

	let { page, total, pageSize, onPageChange }: Props = $props();

	let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	let from = $derived(total === 0 ? 0 : (page - 1) * pageSize + 1);
	let to = $derived(Math.min(page * pageSize, total));
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-between border-t px-1 pt-2 mt-1">
		<span class="text-muted-foreground text-xs">{from}-{to} of {total}</span>
		<div class="flex items-center gap-1">
			<button
				onclick={() => onPageChange(page - 1)}
				disabled={page <= 1}
				class="rounded p-1 transition-colors disabled:pointer-events-none disabled:opacity-40 hover:bg-muted"
				aria-label="Previous page"
			>
				<ChevronLeft size={14} />
			</button>
			<span class="text-muted-foreground min-w-[4rem] text-center text-xs tabular-nums">
				{page} / {totalPages}
			</span>
			<button
				onclick={() => onPageChange(page + 1)}
				disabled={page >= totalPages}
				class="rounded p-1 transition-colors disabled:pointer-events-none disabled:opacity-40 hover:bg-muted"
				aria-label="Next page"
			>
				<ChevronRight size={14} />
			</button>
		</div>
	</div>
{/if}
