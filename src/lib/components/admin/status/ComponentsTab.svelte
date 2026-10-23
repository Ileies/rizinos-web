<script lang="ts">
	import { Play, Save } from '@lucide/svelte';
	import StatusIcon from '#ui/status/StatusIcon.svelte';
	import LatencySpark from '#lib/components/admin/status/LatencySpark.svelte';
	import * as Button from '#shadcn/button';
	import {
		formatDateTime,
		formatUptime,
		relativeTime,
		type AdminComponent,
		type AdminStatus,
		type CheckLevel
	} from '#lib/status.js';

	let {
		data,
		act
	}: { data: AdminStatus; act: (body: Record<string, unknown>) => Promise<boolean> } = $props();

	const LEVEL_BG: Record<CheckLevel, string> = {
		ok: 'bg-status-good',
		slow: 'bg-status-warning',
		degraded: 'bg-status-serious',
		fail: 'bg-status-critical'
	};

	// Drafts of the editable thresholds, keyed by slug, so polling does not overwrite typing.
	let edits = $state<Record<string, { latency: number; interval: number }>>({});
	let busy = $state<string | null>(null);
	const now = $derived(Date.parse(data.generatedAt));

	const valueOf = (c: AdminComponent) =>
		edits[c.slug] ?? { latency: c.degradedLatencyMs, interval: c.intervalSec };
	const setEdit = (c: AdminComponent, patch: Partial<{ latency: number; interval: number }>) =>
		(edits[c.slug] = { ...valueOf(c), ...patch });
	const dirty = (c: AdminComponent) =>
		!!edits[c.slug] &&
		(edits[c.slug].latency !== c.degradedLatencyMs || edits[c.slug].interval !== c.intervalSec);

	async function run(key: string, body: Record<string, unknown>) {
		busy = key;
		await act(body);
		busy = null;
	}

	async function saveThresholds(c: AdminComponent) {
		const d = valueOf(c);
		await run(`save-${c.slug}`, {
			action: 'componentUpdate',
			slug: c.slug,
			degradedLatencyMs: Number(d.latency),
			intervalSec: Number(d.interval)
		});
		delete edits[c.slug];
	}

	const field =
		'border-input bg-background focus-visible:ring-ring/50 h-7 w-20 rounded-md border px-2 text-xs tabular-nums outline-none focus-visible:ring-2';
</script>

<div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
	<Button.Root
		size="sm"
		variant="outline"
		disabled={busy === 'all'}
		onclick={() => run('all', { action: 'probeNow' })}
	>
		<Play /> Probe everything now
	</Button.Root>
	<p class="text-muted-foreground text-xs">
		Monitor
		{#if data.monitor.lastBeatAt}
			<span class={data.monitor.stale ? 'text-status-critical font-semibold' : ''}>
				last heartbeat {relativeTime(data.monitor.lastBeatAt, 'en', now)}
			</span>
			{#if data.monitor.version}(prober v{data.monitor.version}){/if}
		{:else}
			<span class="text-status-critical font-semibold"
				>never reported. Is rizinos-status running?</span
			>
		{/if}
	</p>
</div>

<ul class="space-y-3">
	{#each data.components as c (c.slug)}
		{@const d = valueOf(c)}
		<li class="border-border bg-card rounded-lg border p-4">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div class="flex min-w-0 items-center gap-2">
					<StatusIcon state={c.state} />
					<h3 class="font-semibold">{c.name}</h3>
					<code class="text-muted-foreground text-xs">{c.slug}</code>
					{#if c.paused}
						<span class="bg-muted rounded px-1.5 py-0.5 text-[11px] font-medium">Paused</span>
					{/if}
					{#if !c.autoIncident}
						<span class="bg-muted rounded px-1.5 py-0.5 text-[11px] font-medium"
							>No auto incidents</span
						>
					{/if}
					{#if c.probeState !== c.state}
						<span class="text-muted-foreground text-xs">probe says {c.probeState}</span>
					{/if}
				</div>
				<div class="text-muted-foreground text-right text-xs tabular-nums">
					{#if c.lastCheckedAt}
						checked {relativeTime(c.lastCheckedAt, 'en', now)}
						{#if c.lastLatencyMs !== null}· {c.lastLatencyMs} ms{/if}
					{:else}
						not checked yet
					{/if}
					<br />
					uptime {formatUptime(c.uptime90)}
				</div>
			</div>

			<div class="mt-3 grid gap-4 md:grid-cols-[minmax(0,15rem)_1fr]">
				<div>
					<LatencySpark series={c.latency.series} />
					<p class="text-muted-foreground mt-1 text-xs tabular-nums">
						24h p50 {c.latency.p50 ?? '-'} · p95 {c.latency.p95 ?? '-'} · p99 {c.latency.p99 ?? '-'} ms
					</p>
				</div>

				<div class="min-w-0 space-y-3">
					<div>
						<p class="text-muted-foreground mb-1 text-xs">
							Last {c.recent.length} probes (newest left) · streaks: fail {c.failStreak}, ok {c.okStreak},
							slow {c.slowStreak}
						</p>
						<div class="flex gap-px">
							{#each c.recent as r (r.at)}
								<span
									class="h-4 min-w-0 flex-1 rounded-[2px] {LEVEL_BG[r.level]}"
									title="{formatDateTime(r.at, 'en')} - {r.level}{r.latencyMs !== null
										? `, ${r.latencyMs} ms`
										: ''}{r.error ? `, ${r.error}` : ''}"
								></span>
							{:else}
								<span class="text-muted-foreground text-xs">No probes in the last hour</span>
							{/each}
						</div>
					</div>

					<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
						<label class="flex items-center gap-1.5">
							<input
								type="checkbox"
								checked={c.paused}
								disabled={busy === `paused-${c.slug}`}
								onchange={(e) =>
									run(`paused-${c.slug}`, {
										action: 'componentUpdate',
										slug: c.slug,
										paused: e.currentTarget.checked
									})}
							/>
							Pause probe
						</label>
						<label class="flex items-center gap-1.5">
							<input
								type="checkbox"
								checked={!c.autoIncident}
								disabled={busy === `auto-${c.slug}`}
								onchange={(e) =>
									run(`auto-${c.slug}`, {
										action: 'componentUpdate',
										slug: c.slug,
										autoIncident: !e.currentTarget.checked
									})}
							/>
							Mute auto incidents
						</label>
						<label class="flex items-center gap-1.5">
							Slow above
							<input
								type="number"
								min="100"
								max="60000"
								step="100"
								class={field}
								value={d.latency}
								oninput={(e) => setEdit(c, { latency: e.currentTarget.valueAsNumber })}
							/>
							ms
						</label>
						<label class="flex items-center gap-1.5">
							Every
							<input
								type="number"
								min="15"
								max="3600"
								step="15"
								class={field}
								value={d.interval}
								oninput={(e) => setEdit(c, { interval: e.currentTarget.valueAsNumber })}
							/>
							s
						</label>
						{#if dirty(c)}
							<Button.Root
								size="sm"
								disabled={busy === `save-${c.slug}`}
								onclick={() => saveThresholds(c)}
							>
								<Save /> Save
							</Button.Root>
						{/if}
						<Button.Root
							size="sm"
							variant="ghost"
							disabled={busy === `probe-${c.slug}`}
							onclick={() => run(`probe-${c.slug}`, { action: 'probeNow', slug: c.slug })}
						>
							<Play /> Probe now
						</Button.Root>
					</div>

					<details class="text-xs">
						<summary class="text-muted-foreground hover:text-foreground cursor-pointer">
							Raw details of the last run
						</summary>
						<pre
							class="bg-muted mt-2 max-h-48 overflow-auto rounded-md p-2 text-[11px] leading-snug">{JSON.stringify(
								c.info,
								null,
								2
							)}</pre>
					</details>
				</div>
			</div>
		</li>
	{/each}
</ul>
