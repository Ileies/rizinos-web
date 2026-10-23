<script lang="ts">
	import { onMount } from 'svelte';
	import { apiFetch } from '#lib/api.js';
	import { localePath } from '#lib/i18n.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	type State = { kind: 'checking' } | { kind: 'ok' | 'slow'; ms: number } | { kind: 'down' };

	const SLOW_MS = 2500;
	const TIMEOUT_MS = 6000;

	let status = $state<State>({ kind: 'checking' });

	// The backend verifies its database on every request, so a fast answer here means API and DB are up.
	onMount(() => {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
		const start = performance.now();

		apiFetch('/os/version', { signal: controller.signal, cache: 'no-store' })
			.then((res) => {
				if (!res.ok) throw new Error('unhealthy');
				const ms = Math.round(performance.now() - start);
				status = { kind: ms > SLOW_MS ? 'slow' : 'ok', ms };
			})
			.catch(() => {
				if (!controller.signal.aborted || status.kind === 'checking') status = { kind: 'down' };
			})
			.finally(() => clearTimeout(timer));

		return () => {
			controller.abort();
			clearTimeout(timer);
		};
	});

	const dot = $derived(
		status.kind === 'ok'
			? 'bg-green-500'
			: status.kind === 'slow'
				? 'bg-amber-500'
				: status.kind === 'down'
					? 'bg-red-500'
					: 'bg-muted-foreground/50'
	);

	const label = $derived(
		status.kind === 'ok'
			? m.contact_status_ok({ ms: status.ms })
			: status.kind === 'slow'
				? m.contact_status_slow({ ms: status.ms })
				: status.kind === 'down'
					? m.contact_status_down()
					: m.contact_status_checking()
	);
</script>

<div
	class="border-border bg-card/70 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border px-3.5 py-1.5 text-xs backdrop-blur"
>
	<span class="inline-flex items-center gap-2" role="status" aria-live="polite">
		<span class="relative flex size-2">
			{#if status.kind === 'ok'}
				<span
					class="absolute inline-flex size-full rounded-full bg-green-500/60 motion-safe:animate-ping"
				></span>
			{/if}
			<span class="relative inline-flex size-2 rounded-full {dot}"></span>
		</span>
		<span class="text-foreground font-medium tabular-nums">{label}</span>
	</span>
	<a
		href={localePath('/status')}
		class="text-muted-foreground hover:text-foreground underline-offset-2 transition-colors hover:underline"
	>
		{m.contact_status_link()}
	</a>
</div>
