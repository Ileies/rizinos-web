<script lang="ts">
	import { formatTime } from '#lib/status.js';

	// Hourly average latency over the last 24 hours. One series, so no legend: the card names it.
	let { series }: { series: { at: string; avg: number | null; fails: number }[] } = $props();

	const W = 240;
	const H = 56;
	const PAD_X = 4;
	const PAD_TOP = 8;
	const PAD_BOTTOM = 10;

	const points = $derived(
		series.filter((s) => s.avg !== null) as { at: string; avg: number; fails: number }[]
	);
	const max = $derived(Math.max(10, ...points.map((p) => p.avg)));

	const x = (i: number) =>
		series.length <= 1 ? W / 2 : PAD_X + (i / (series.length - 1)) * (W - PAD_X * 2);
	const y = (v: number) => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOTTOM);

	const path = $derived(
		series
			.map((s, i) => (s.avg === null ? null : `${x(i)},${y(s.avg)}`))
			.filter(Boolean)
			.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`)
			.join(' ')
	);
	const last = $derived.by(() => {
		for (let i = series.length - 1; i >= 0; i--) if (series[i].avg !== null) return i;
		return -1;
	});
</script>

{#if points.length}
	<svg
		viewBox="0 0 {W} {H}"
		class="h-14 w-full max-w-60"
		role="img"
		aria-label="Average latency per hour, last 24 hours. Peak {max} ms."
	>
		<line
			x1={PAD_X}
			x2={W - PAD_X}
			y1={H - PAD_BOTTOM}
			y2={H - PAD_BOTTOM}
			class="stroke-border"
			stroke-width="1"
		/>
		<text x={PAD_X} y="7" class="fill-muted-foreground text-[8px]">{max} ms</text>
		{#each series as s, i (s.at)}
			{#if s.fails > 0}
				<rect
					x={x(i) - 1.5}
					y={H - PAD_BOTTOM}
					width="3"
					height="6"
					rx="1"
					class="fill-status-critical"
				>
					<title>{formatTime(s.at, 'en')}: {s.fails} failed</title>
				</rect>
			{/if}
		{/each}
		<path
			d={path}
			fill="none"
			class="stroke-primary"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		{#if last >= 0}
			<circle
				cx={x(last)}
				cy={y(series[last].avg!)}
				r="4"
				class="fill-primary stroke-card"
				stroke-width="2"
			/>
		{/if}
		{#each series as s, i (s.at)}
			{#if s.avg !== null}
				<rect x={x(i) - 4} y="0" width="8" height={H} fill="transparent">
					<title>{formatTime(s.at, 'en')}: {s.avg} ms avg</title>
				</rect>
			{/if}
		{/each}
	</svg>
{:else}
	<p class="text-muted-foreground text-xs">No latency data yet</p>
{/if}
