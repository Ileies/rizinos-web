<script lang="ts">
	import StatusIcon from '#ui/status/StatusIcon.svelte';
	import UptimeBar from '#ui/status/UptimeBar.svelte';
	import { formatUptime, relativeTime, type StatusComponent } from '#lib/status.js';
	import { componentDescription, componentName, stateLabel } from '#lib/statusLabels.js';
	import { getLocale } from '#lib/messages.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	let { component, now }: { component: StatusComponent; now: number } = $props();

	const name = $derived(componentName(component.slug, component.name));
	// "Since" is when the probe state changed, so it only makes sense for real problems, not for
	// planned maintenance (which has its own window on the page).
	const unhealthy = $derived(component.state === 'degraded' || component.state === 'down');
</script>

<li class="px-5 py-4 sm:px-6 sm:py-5">
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0">
			<h3 class="text-foreground font-semibold">{name}</h3>
			<p class="text-muted-foreground mt-0.5 text-sm">
				{componentDescription(component.slug, component.description)}
			</p>
		</div>
		<div class="shrink-0 text-right">
			<p class="text-foreground flex items-center justify-end gap-1.5 text-sm font-medium">
				<StatusIcon state={component.state} />
				{stateLabel(component.state)}
			</p>
			{#if unhealthy && component.since}
				<p class="text-muted-foreground mt-0.5 text-xs">
					{m.status_since({ time: relativeTime(component.since, getLocale(), now) })}
				</p>
			{/if}
		</div>
	</div>

	<div class="mt-4">
		<UptimeBar days={component.days} {name} />
		<div class="text-muted-foreground mt-2 flex items-center justify-between text-xs">
			<span>{m.status_days_ago()}</span>
			<span class="tabular-nums">
				{m.status_uptime_value({ value: formatUptime(component.uptime90) })}
			</span>
			<span>{m.status_today()}</span>
		</div>
	</div>
</li>
