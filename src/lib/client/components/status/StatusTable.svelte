<script lang="ts">
	import StatusIcon from '#ui/status/StatusIcon.svelte';
	import { formatUptime, type StatusComponent } from '#lib/status.js';
	import { componentName, stateLabel } from '#lib/statusLabels.js';
	import * as m from '#lib/messages.svelte.js';

	let { components }: { components: StatusComponent[] } = $props();
</script>

<div class="border-border bg-card overflow-x-auto rounded-2xl border">
	<table class="w-full text-left text-sm">
		<thead class="text-muted-foreground border-border border-b text-xs">
			<tr>
				<th scope="col" class="px-5 py-3 font-medium">{m.status_table_component()}</th>
				<th scope="col" class="px-5 py-3 font-medium">{m.status_table_status()}</th>
				<th scope="col" class="px-5 py-3 text-right font-medium">{m.status_table_uptime()}</th>
			</tr>
		</thead>
		<tbody class="divide-border divide-y">
			{#each components as c (c.slug)}
				<tr>
					<th scope="row" class="text-foreground px-5 py-3 font-medium">
						{componentName(c.slug, c.name)}
					</th>
					<td class="px-5 py-3">
						<span class="inline-flex items-center gap-1.5">
							<StatusIcon state={c.state} />
							{stateLabel(c.state)}
						</span>
					</td>
					<td class="px-5 py-3 text-right tabular-nums">{formatUptime(c.uptime90)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
