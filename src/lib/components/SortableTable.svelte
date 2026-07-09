<script module lang="ts">
	export interface SortableColumn<T> {
		key: string;
		label: string;
		class?: string;
		sortable?: boolean;
		/** Required when `sortable` is true (ignored in serverSide mode). */
		accessor?: (row: T) => string | number | Date | null | undefined;
	}

	export interface SortState {
		field: string | null;
		dir: 'asc' | 'desc';
	}
</script>

<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from '@lucide/svelte';
	import * as Table from '$shadcn/table';
	import Pagination from '$lib/components/Pagination.svelte';

	interface Props {
		columns: SortableColumn<T>[];
		rows: T[];
		rowKey: (row: T) => string | number;
		pageSize?: number;
		emptyMessage?: string;
		/** When true, `rows` is already sorted+paginated by the server; `sort`/`page` only report clicks upward. */
		serverSide?: boolean;
		/** Server-reported total row count. Required (and used) when serverSide is true. */
		total?: number;
		sort?: SortState;
		page?: number;
		row: Snippet<[T]>;
		card: Snippet<[T]>;
	}

	let {
		columns,
		rows,
		rowKey,
		pageSize,
		emptyMessage,
		serverSide = false,
		total,
		sort = $bindable({ field: null, dir: 'asc' }),
		page = $bindable(1),
		row,
		card
	}: Props = $props();

	function toggleSort(key: string) {
		sort =
			sort.field === key
				? { field: key, dir: sort.dir === 'asc' ? 'desc' : 'asc' }
				: { field: key, dir: 'asc' };
	}

	function compareValues(a: unknown, b: unknown): number {
		if (a == null && b == null) return 0;
		if (a == null) return 1;
		if (b == null) return -1;
		if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
		if (typeof a === 'number' && typeof b === 'number') return a - b;
		return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
	}

	let sorted = $derived.by(() => {
		if (serverSide || !sort.field) return rows;
		const col = columns.find((c) => c.key === sort.field);
		if (!col?.accessor) return rows;
		const copy = [...rows].sort((a, b) => compareValues(col.accessor!(a), col.accessor!(b)));
		if (sort.dir === 'desc') copy.reverse();
		return copy;
	});

	// Reset to page 1 whenever the underlying data or sort changes (client mode only).
	$effect(() => {
		if (serverSide) return;
		void rows;
		void sort;
		page = 1;
	});

	let paged = $derived(
		serverSide ? rows : pageSize ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted
	);
	let effectiveTotal = $derived(serverSide ? (total ?? rows.length) : sorted.length);
</script>

<div class="hidden md:block">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				{#each columns as col (col.key)}
					{#if col.sortable}
						<Table.Head
							class="cursor-pointer select-none {col.class ?? ''}"
							onclick={() => toggleSort(col.key)}
						>
							<span class="inline-flex items-center gap-1">
								{col.label}
								{#if sort.field === col.key}
									{#if sort.dir === 'asc'}
										<ChevronUp size={12} />
									{:else}
										<ChevronDown size={12} />
									{/if}
								{:else}
									<ChevronsUpDown size={12} class="opacity-30" />
								{/if}
							</span>
						</Table.Head>
					{:else}
						<Table.Head class={col.class}>{col.label}</Table.Head>
					{/if}
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each paged as item (rowKey(item))}
				{@render row(item)}
			{/each}
			{#if paged.length === 0 && emptyMessage}
				<Table.Row>
					<Table.Cell
						colspan={columns.length}
						class="text-muted-foreground py-8 text-center text-sm"
					>
						{emptyMessage}
					</Table.Cell>
				</Table.Row>
			{/if}
		</Table.Body>
	</Table.Root>
</div>
<div class="flex flex-col gap-2 md:hidden">
	{#each paged as item (rowKey(item))}
		{@render card(item)}
	{/each}
	{#if paged.length === 0 && emptyMessage}
		<p class="text-muted-foreground py-8 text-center text-sm">{emptyMessage}</p>
	{/if}
</div>
{#if pageSize}
	<Pagination {page} total={effectiveTotal} {pageSize} onPageChange={(p) => (page = p)} />
{/if}
