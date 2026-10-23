<script lang="ts">
	import { formatDateTime, relativeTime, type AdminStatus } from '#lib/status.js';

	let { data }: { data: AdminStatus } = $props();

	interface Vitals {
		host?: {
			load: number[];
			cpus: number;
			memTotalBytes: number;
			memFreeBytes: number;
			uptimeSec: number;
		};
		disks?: { path: string; totalBytes: number; freeBytes: number }[];
		postgres?: { connections: number; maxConnections: number; sizeBytes: number } | null;
		accounts?: { online: number; total: number } | null;
		services?: {
			unit: string;
			active: string;
			sub: string;
			mainPid: number | null;
			restarts: number | null;
			since: string | null;
			memoryBytes: number | null;
		}[];
		prober?: { version: string; pid: number; uptimeSec: number; rssBytes: number };
	}

	const v = $derived((data.vitals ?? {}) as Vitals);
	const now = $derived(Date.parse(data.generatedAt));

	const gb = (bytes: number) => `${(bytes / 1024 ** 3).toFixed(1)} GB`;
	const mb = (bytes: number) => `${Math.round(bytes / 1024 ** 2)} MB`;
	const pct = (used: number, total: number) => Math.round((used / total) * 100);
	const days = (sec: number) => {
		const d = Math.floor(sec / 86400);
		const h = Math.floor((sec % 86400) / 3600);
		return d ? `${d}d ${h}h` : `${h}h ${Math.floor((sec % 3600) / 60)}m`;
	};

	const card = 'border-border bg-card rounded-lg border p-4';
	const h = 'mb-2 text-sm font-semibold';
</script>

{#if !data.vitals}
	<p class="text-muted-foreground text-sm">No vitals yet. The prober reports them once a minute.</p>
{:else}
	<p class="text-muted-foreground mb-4 text-xs">
		Reported {data.vitalsAt ? relativeTime(data.vitalsAt, 'en', now) : 'never'} by the prober on the server.
	</p>

	<div class="grid gap-4 md:grid-cols-2">
		{#if v.host}
			{@const used = v.host.memTotalBytes - v.host.memFreeBytes}
			<section class={card}>
				<h3 class={h}>Host</h3>
				<dl class="grid grid-cols-2 gap-y-1.5 text-sm">
					<dt class="text-muted-foreground">Load (1, 5, 15 min)</dt>
					<dd class="tabular-nums">{v.host.load.join(' / ')} on {v.host.cpus} cores</dd>
					<dt class="text-muted-foreground">Memory</dt>
					<dd class="tabular-nums">
						{gb(used)} of {gb(v.host.memTotalBytes)} ({pct(used, v.host.memTotalBytes)}%)
					</dd>
					<dt class="text-muted-foreground">Uptime</dt>
					<dd>{days(v.host.uptimeSec)}</dd>
				</dl>
			</section>
		{/if}

		{#if v.disks?.length}
			<section class={card}>
				<h3 class={h}>Disks</h3>
				<ul class="space-y-2.5 text-sm">
					{#each v.disks as disk (disk.path)}
						{@const used = disk.totalBytes - disk.freeBytes}
						{@const percent = pct(used, disk.totalBytes)}
						<li>
							<div class="flex justify-between">
								<code>{disk.path}</code>
								<span class="text-muted-foreground tabular-nums">
									{gb(disk.freeBytes)} free of {gb(disk.totalBytes)}
								</span>
							</div>
							<div class="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
								<div
									class="h-full rounded-full {percent > 90
										? 'bg-status-critical'
										: percent > 75
											? 'bg-status-warning'
											: 'bg-status-good'}"
									style:width="{percent}%"
								></div>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if v.postgres}
			<section class={card}>
				<h3 class={h}>Postgres</h3>
				<dl class="grid grid-cols-2 gap-y-1.5 text-sm">
					<dt class="text-muted-foreground">Connections</dt>
					<dd class="tabular-nums">{v.postgres.connections} of {v.postgres.maxConnections}</dd>
					<dt class="text-muted-foreground">Database size</dt>
					<dd class="tabular-nums">{gb(v.postgres.sizeBytes)}</dd>
					{#if v.accounts}
						<dt class="text-muted-foreground">Accounts</dt>
						<dd class="tabular-nums">{v.accounts.total} total, {v.accounts.online} online</dd>
					{/if}
				</dl>
			</section>
		{/if}

		{#if v.prober}
			<section class={card}>
				<h3 class={h}>Prober</h3>
				<dl class="grid grid-cols-2 gap-y-1.5 text-sm">
					<dt class="text-muted-foreground">Version</dt>
					<dd>{v.prober.version}</dd>
					<dt class="text-muted-foreground">Process</dt>
					<dd class="tabular-nums">
						pid {v.prober.pid}, up {days(v.prober.uptimeSec)}, {mb(v.prober.rssBytes)}
					</dd>
					<dt class="text-muted-foreground">Last heartbeat</dt>
					<dd class={data.monitor.stale ? 'text-status-critical font-semibold' : ''}>
						{data.monitor.lastBeatAt ? formatDateTime(data.monitor.lastBeatAt, 'en') : 'never'}
					</dd>
				</dl>
			</section>
		{/if}
	</div>

	{#if v.services?.length}
		<section class="{card} mt-4">
			<h3 class={h}>Services (systemd)</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="text-muted-foreground text-xs">
						<tr>
							<th class="py-1 pr-4 font-medium">Unit</th>
							<th class="py-1 pr-4 font-medium">State</th>
							<th class="py-1 pr-4 font-medium">Since</th>
							<th class="py-1 pr-4 font-medium">Restarts</th>
							<th class="py-1 font-medium">Memory</th>
						</tr>
					</thead>
					<tbody>
						{#each v.services as s (s.unit)}
							<tr class="border-border border-t">
								<td class="py-1.5 pr-4"><code>{s.unit}</code></td>
								<td class="py-1.5 pr-4">
									<span
										class={s.active === 'active'
											? 'text-status-good font-medium'
											: 'text-status-critical font-medium'}
									>
										{s.active} ({s.sub})
									</span>
								</td>
								<td class="py-1.5 pr-4 tabular-nums"
									>{s.since ? formatDateTime(s.since, 'en') : '-'}</td
								>
								<td class="py-1.5 pr-4 tabular-nums">{s.restarts ?? '-'}</td>
								<td class="py-1.5 tabular-nums">{s.memoryBytes ? mb(s.memoryBytes) : '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}
{/if}
