<script lang="ts">
	import { STATE_BG, formatDay, formatMinutes, formatUptime, type DayCell } from '#lib/status.js';
	import { getLocale } from '#lib/messages.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	let { days, name }: { days: DayCell[]; name: string } = $props();

	let active = $state<number | null>(null);

	const cell = $derived(active === null ? null : days[active]);

	function describe(d: DayCell): string {
		switch (d.state) {
			case 'nodata':
				return m.status_day_nodata();
			case 'maintenance':
				return m.status_day_maintenance();
			case 'operational':
				return m.status_day_ok();
			default: {
				const parts: string[] = [];
				if (d.downMinutes > 0)
					parts.push(m.status_day_down({ duration: formatMinutes(d.downMinutes) }));
				if (d.degradedMinutes > 0)
					parts.push(m.status_day_degraded({ duration: formatMinutes(d.degradedMinutes) }));
				return parts.join(' · ') || m.status_day_degraded({ duration: '<1m' });
			}
		}
	}

	function onKey(e: KeyboardEvent) {
		const last = days.length - 1;
		if (e.key === 'ArrowLeft') active = Math.max(0, (active ?? last) - 1);
		else if (e.key === 'ArrowRight') active = Math.min(last, (active ?? last - 1) + 1);
		else if (e.key === 'Home') active = 0;
		else if (e.key === 'End') active = last;
		else if (e.key === 'Escape') active = null;
		else return;
		e.preventDefault();
	}

	function onPointer(e: PointerEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const ratio = (e.clientX - rect.left) / rect.width;
		active = Math.min(days.length - 1, Math.max(0, Math.floor(ratio * days.length)));
	}

	// Keep the tooltip inside the bar near both edges.
	const tipLeft = $derived(
		active === null
			? '0'
			: `clamp(4.5rem, ${((active + 0.5) / days.length) * 100}%, calc(100% - 4.5rem))`
	);
</script>

<div class="relative">
	<!-- The bar is one focusable group: arrow keys step through days, the pointer maps to a day by x. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		role="group"
		tabindex="0"
		aria-label="{name}: {m.status_uptime_range()}"
		class="focus-visible:ring-ring/50 flex h-8 gap-px rounded-sm outline-none focus-visible:ring-2 sm:gap-[2px]"
		onpointermove={onPointer}
		onpointerleave={() => (active = null)}
		onblur={() => (active = null)}
		onkeydown={onKey}
	>
		{#each days as d, i (d.day)}
			<div
				class="min-w-0 flex-1 rounded-[2px] transition-opacity {STATE_BG[d.state]} {active !==
					null && active !== i
					? 'opacity-60'
					: ''}"
			></div>
		{/each}
	</div>

	{#if cell}
		<div
			class="border-border bg-popover text-popover-foreground pointer-events-none absolute bottom-full z-10 mb-2 w-max max-w-56 -translate-x-1/2 rounded-lg border px-3 py-2 text-xs shadow-lg"
			style:left={tipLeft}
		>
			<p class="font-semibold">{formatDay(cell.day, getLocale())}</p>
			<p class="text-muted-foreground mt-0.5 flex items-center gap-1.5">
				<span class="inline-block size-2 rounded-[2px] {STATE_BG[cell.state]}"></span>
				{describe(cell)}
			</p>
			{#if cell.uptime !== null}
				<p class="text-muted-foreground mt-0.5 tabular-nums">
					{m.status_uptime_value({ value: formatUptime(cell.uptime) })}
				</p>
			{/if}
		</div>
	{/if}

	<span class="sr-only" aria-live="polite">
		{#if cell}{formatDay(cell.day, getLocale())}: {describe(cell)}{/if}
	</span>
</div>
