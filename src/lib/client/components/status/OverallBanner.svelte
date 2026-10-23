<script lang="ts">
	import StatusIcon from '#ui/status/StatusIcon.svelte';
	import { OVERALL_AS_STATE, STATE_TINT, relativeTime, type OverallState } from '#lib/status.js';
	import { overallLabel } from '#lib/statusLabels.js';
	import { getLocale } from '#lib/messages.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	let {
		overall,
		updatedAt,
		now
	}: { overall: OverallState; updatedAt: string | null; now: number } = $props();

	const state = $derived(OVERALL_AS_STATE[overall]);
</script>

<section
	role="status"
	aria-live="polite"
	class="flex items-center gap-4 rounded-2xl border p-5 sm:p-6 {STATE_TINT[state]}"
>
	<StatusIcon {state} class="size-9 sm:size-10" />
	<div class="min-w-0">
		<h2 class="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
			{overallLabel(overall)}
		</h2>
		{#if updatedAt}
			<p class="text-muted-foreground mt-1 text-sm">
				{m.status_overall_sub_ok({ time: relativeTime(updatedAt, getLocale(), now) })}
			</p>
		{/if}
	</div>
</section>
