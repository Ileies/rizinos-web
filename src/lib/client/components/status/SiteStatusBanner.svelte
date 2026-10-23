<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { TriangleAlert, Wrench, X } from '@lucide/svelte';
	import { apiGet } from '#lib/api.js';
	import { localePath, pathWithoutLocale } from '#lib/i18n.svelte.js';
	import { formatDateTime, type StatusBannerData } from '#lib/status.js';
	import { getLocale } from '#lib/messages.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	// A thin strip above the header while an incident is open or maintenance is near. It stays
	// invisible, and never blocks the page, if the status endpoint cannot be reached.
	const POLL_MS = 120_000;
	const DISMISS_KEY = 'rizinos.status.dismissed';

	let data = $state<StatusBannerData | null>(null);
	let dismissed = $state<string[]>([]);

	function readDismissed(): string[] {
		try {
			return JSON.parse(sessionStorage.getItem(DISMISS_KEY) ?? '[]');
		} catch {
			return [];
		}
	}

	function dismiss(id: string) {
		dismissed = [...dismissed, id];
		try {
			sessionStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed));
		} catch {
			/* private mode: dismissal lasts until reload */
		}
	}

	async function load(signal: AbortSignal) {
		try {
			data = await apiGet<StatusBannerData>('/status/banner', signal);
		} catch {
			/* keep whatever we had */
		}
	}

	onMount(() => {
		dismissed = readDismissed();
		const controller = new AbortController();
		void load(controller.signal);
		const timer = setInterval(() => {
			if (!document.hidden) void load(controller.signal);
		}, POLL_MS);
		return () => {
			controller.abort();
			clearInterval(timer);
		};
	});

	const IMPACT_RANK = { minor: 0, major: 1, critical: 2 } as const;

	const item = $derived.by(() => {
		if (!data) return null;
		// Minor incidents stay on the status page: a site-wide banner is for things people will notice.
		const incident = data.incidents
			.filter((i) => i.impact !== 'minor')
			.sort((a, b) => IMPACT_RANK[b.impact] - IMPACT_RANK[a.impact])[0];
		if (incident && !dismissed.includes(incident.id)) {
			return {
				id: incident.id,
				kind: 'incident' as const,
				text: m.status_banner_incident({ title: incident.title })
			};
		}
		const maintenance = data.maintenance.find((x) => !dismissed.includes(x.id));
		if (maintenance) {
			return {
				id: maintenance.id,
				kind: 'maintenance' as const,
				text:
					maintenance.phase === 'in_progress'
						? m.status_banner_maint_now({ title: maintenance.title })
						: m.status_banner_maint_soon({
								time: formatDateTime(maintenance.startsAt, getLocale()),
								title: maintenance.title
							})
			};
		}
		return null;
	});

	// The status page already shows everything in full.
	const onStatusPage = $derived(pathWithoutLocale(page.url.pathname) === '/status/');
</script>

{#if item && !onStatusPage}
	<div
		role="status"
		class="border-b text-sm {item.kind === 'incident'
			? 'bg-status-critical/10 border-status-critical/30'
			: 'bg-status-maintenance/10 border-status-maintenance/30'}"
	>
		<div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
			{#if item.kind === 'incident'}
				<TriangleAlert class="text-status-critical size-4 shrink-0" aria-hidden="true" />
			{:else}
				<Wrench class="text-status-maintenance size-4 shrink-0" aria-hidden="true" />
			{/if}
			<p class="text-foreground min-w-0 flex-1 truncate">{item.text}</p>
			<a
				href={localePath('/status')}
				class="text-foreground shrink-0 font-semibold underline underline-offset-2"
			>
				{m.status_banner_details()}
			</a>
			<button
				type="button"
				class="text-muted-foreground hover:text-foreground shrink-0 rounded p-1"
				aria-label={m.status_banner_dismiss()}
				onclick={() => dismiss(item.id)}
			>
				<X class="size-4" aria-hidden="true" />
			</button>
		</div>
	</div>
{/if}
