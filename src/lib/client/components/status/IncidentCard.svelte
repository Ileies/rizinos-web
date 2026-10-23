<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import {
		IMPACT_BG,
		formatDateTime,
		formatDuration,
		relativeTime,
		type Incident
	} from '#lib/status.js';
	import { componentName, impactLabel, incidentStatusLabel } from '#lib/statusLabels.js';
	import { getLocale } from '#lib/messages.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	let {
		incident,
		open = false,
		now
	}: { incident: Incident; open?: boolean; now: number } = $props();

	// svelte-ignore state_referenced_locally
	let expanded = $state(open);

	const resolved = $derived(incident.status === 'resolved');
	const locale = $derived(getLocale());
	const affected = $derived(
		incident.components.map((slug) => componentName(slug, slug)).join(', ')
	);
</script>

<article class="border-border bg-card rounded-2xl border">
	<button
		type="button"
		class="focus-visible:ring-ring/50 flex w-full items-start gap-3 rounded-2xl p-5 text-left outline-none focus-visible:ring-2"
		aria-expanded={expanded}
		onclick={() => (expanded = !expanded)}
	>
		<span class="mt-1.5 size-2.5 shrink-0 rounded-full {IMPACT_BG[incident.impact]}"></span>
		<span class="min-w-0 flex-1">
			<span class="text-foreground block font-semibold">{incident.title}</span>
			<span class="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
				<span class="text-foreground font-medium">{incidentStatusLabel(incident.status)}</span>
				<span>{impactLabel(incident.impact)}</span>
				{#if affected}<span>{m.status_affects({ components: affected })}</span>{/if}
				<span>
					{#if resolved && incident.resolvedAt}
						{formatDateTime(incident.startedAt, locale)} · {m.status_resolved_after({
							duration: formatDuration(
								Date.parse(incident.resolvedAt) - Date.parse(incident.startedAt)
							)
						})}
					{:else}
						{m.status_started({ time: relativeTime(incident.startedAt, locale, now) })}
					{/if}
				</span>
			</span>
		</span>
		<ChevronDown
			class="text-muted-foreground mt-1 size-4 shrink-0 transition-transform {expanded
				? 'rotate-180'
				: ''}"
			aria-hidden="true"
		/>
	</button>

	{#if expanded}
		<ol class="border-border mx-5 mb-5 space-y-4 border-t pt-4">
			{#each incident.updates as update (update.id)}
				<li>
					<p class="text-sm">
						<span class="text-foreground font-semibold">{incidentStatusLabel(update.status)}</span>
						<span class="text-muted-foreground"> · {formatDateTime(update.createdAt, locale)}</span>
					</p>
					<p class="text-muted-foreground mt-1 text-sm leading-relaxed whitespace-pre-line">
						{update.body}
					</p>
				</li>
			{/each}
		</ol>
	{/if}
</article>
