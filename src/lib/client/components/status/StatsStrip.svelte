<script lang="ts">
	import { formatDateTime, type PublicStatus } from '#lib/status.js';
	import { getLocale } from '#lib/messages.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	let { stats }: { stats: PublicStatus['stats'] } = $props();
</script>

<dl
	class="border-border bg-card grid grid-cols-1 divide-y rounded-2xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0"
>
	<div class="px-5 py-4">
		<dt class="text-muted-foreground text-xs">{m.status_stat_online()}</dt>
		<dd class="text-foreground mt-1 text-xl font-semibold tabular-nums">{stats.onlineUsers}</dd>
	</div>
	<div class="px-5 py-4">
		<dt class="text-muted-foreground text-xs">{m.status_stat_version()}</dt>
		<dd class="text-foreground mt-1 text-xl font-semibold">{stats.version ?? '-'}</dd>
	</div>
	<div class="px-5 py-4">
		<dt class="text-muted-foreground text-xs">{m.status_stat_running()}</dt>
		<dd class="text-foreground mt-1 text-xl font-semibold">
			{formatDateTime(stats.runningSince, getLocale())}
		</dd>
	</div>
</dl>
