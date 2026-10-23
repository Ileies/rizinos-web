<script lang="ts">
	import { Wrench } from '@lucide/svelte';
	import { formatDateTime, type Maintenance } from '#lib/status.js';
	import { componentName, maintenancePhaseLabel } from '#lib/statusLabels.js';
	import { getLocale } from '#lib/messages.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	let { maintenance }: { maintenance: Maintenance } = $props();

	const locale = $derived(getLocale());
	const affected = $derived(
		maintenance.components.map((slug) => componentName(slug, slug)).join(', ')
	);
	const active = $derived(maintenance.phase === 'in_progress');
</script>

<article
	class="rounded-2xl border p-5 {active
		? 'bg-status-maintenance/10 border-status-maintenance/30'
		: 'border-border bg-card'}"
>
	<div class="flex items-start gap-3">
		<Wrench class="text-status-maintenance mt-0.5 size-4 shrink-0" aria-hidden="true" />
		<div class="min-w-0">
			<h3 class="text-foreground font-semibold">{maintenance.title}</h3>
			<p class="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
				<span class="text-foreground font-medium">{maintenancePhaseLabel(maintenance.phase)}</span>
				<span>
					{m.status_maintenance_window({
						start: formatDateTime(maintenance.startsAt, locale),
						end: formatDateTime(maintenance.endsAt, locale)
					})}
				</span>
				{#if affected}<span>{m.status_affects({ components: affected })}</span>{/if}
			</p>
			{#if maintenance.description}
				<p class="text-muted-foreground mt-2 text-sm leading-relaxed whitespace-pre-line">
					{maintenance.description}
				</p>
			{/if}
		</div>
	</div>
</article>
