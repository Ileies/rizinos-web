<script lang="ts">
	import { CircleCheck, CircleHelp, CircleX, TriangleAlert, Wrench } from '@lucide/svelte';
	import type { ComponentState } from '#lib/status.js';

	let { state, class: className = 'size-4' }: { state: ComponentState; class?: string } = $props();

	// Color is never the only signal: every state has its own icon shape, and a text label sits next to it.
	const COLOR: Record<ComponentState, string> = {
		operational: 'text-status-good',
		degraded: 'text-status-warning',
		down: 'text-status-critical',
		maintenance: 'text-status-maintenance',
		unknown: 'text-status-idle'
	};
</script>

{#if state === 'operational'}
	<CircleCheck class="{className} {COLOR[state]} shrink-0" aria-hidden="true" />
{:else if state === 'degraded'}
	<TriangleAlert class="{className} {COLOR[state]} shrink-0" aria-hidden="true" />
{:else if state === 'down'}
	<CircleX class="{className} {COLOR[state]} shrink-0" aria-hidden="true" />
{:else if state === 'maintenance'}
	<Wrench class="{className} {COLOR[state]} shrink-0" aria-hidden="true" />
{:else}
	<CircleHelp class="{className} {COLOR[state]} shrink-0" aria-hidden="true" />
{/if}
