<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { ArrowUpRight, CircleX, Table2 } from '@lucide/svelte';
	import { SiDiscord } from '@icons-pack/svelte-simple-icons';
	import Container from '#ui/homepage/Container.svelte';
	import OverallBanner from '#ui/status/OverallBanner.svelte';
	import ComponentRow from '#ui/status/ComponentRow.svelte';
	import IncidentCard from '#ui/status/IncidentCard.svelte';
	import MaintenanceCard from '#ui/status/MaintenanceCard.svelte';
	import StatsStrip from '#ui/status/StatsStrip.svelte';
	import StatusTable from '#ui/status/StatusTable.svelte';
	import { startStatusPolling, refreshStatus, statusStore } from '#lib/status.svelte.js';
	import { GROUPS, relativeTime } from '#lib/status.js';
	import { groupLabel } from '#lib/statusLabels.js';
	import { session, loadSession } from '#lib/session.svelte.js';
	import { localePath } from '#lib/i18n.svelte.js';
	import { discord } from '#lib/config.js';
	import { getLocale } from '#lib/messages.svelte.js';
	import * as m from '#lib/messages.svelte.js';

	const status = $derived(statusStore.status);
	const maintenance = $derived(status?.maintenance.filter((x) => x.phase !== 'completed') ?? []);
	const showTable = $state({ on: false });

	onMount(() => {
		void loadSession();
		return startStatusPolling();
	});

	// The admin tools are only fetched for admins, so the public page stays small.
	let AdminTools = $state<Component<{ embedded?: boolean }> | null>(null);
	$effect(() => {
		if (session.isAdmin && !AdminTools) {
			void import('#lib/components/admin/StatusSection.svelte').then((mod) => {
				AdminTools = mod.default as Component<{ embedded?: boolean }>;
			});
		}
	});
</script>

<Container>
	<div class="py-16 sm:py-24">
		<header class="mb-10 max-w-2xl">
			<p class="text-primary mb-4 text-sm font-semibold tracking-widest uppercase">{m.status()}</p>
			<h1 class="text-foreground mb-6 text-4xl font-black tracking-tight sm:text-5xl">
				{m.status_title()}
			</h1>
			<p class="text-muted-foreground text-lg leading-relaxed">{m.status_lead()}</p>
		</header>

		{#if statusStore.error}
			<div
				role="alert"
				class="bg-status-critical/10 border-status-critical/30 mb-6 flex items-start gap-3 rounded-2xl border p-5"
			>
				<CircleX class="text-status-critical mt-0.5 size-5 shrink-0" aria-hidden="true" />
				<div class="min-w-0 flex-1">
					<h2 class="text-foreground font-semibold">{m.status_error_title()}</h2>
					<p class="text-muted-foreground mt-1 text-sm leading-relaxed">
						{#if status && statusStore.fetchedAt}
							{m.status_error_cached({
								time: relativeTime(
									new Date(statusStore.fetchedAt).toISOString(),
									getLocale(),
									statusStore.now
								)
							})}
						{:else}
							{m.status_error_empty()}
						{/if}
					</p>
				</div>
				<button
					type="button"
					class="border-border hover:bg-muted focus-visible:ring-ring/50 shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-2"
					onclick={() => refreshStatus()}
				>
					{m.status_retry()}
				</button>
			</div>
		{/if}

		{#if status}
			{#if status.monitor.stale && !statusStore.error}
				<p
					role="status"
					class="bg-status-warning/10 border-status-warning/40 text-foreground mb-6 rounded-2xl border px-5 py-3 text-sm"
				>
					{m.status_stale()}
				</p>
			{/if}

			<div class="space-y-10">
				<OverallBanner
					overall={status.overall}
					updatedAt={statusStore.fromCache ? null : status.generatedAt}
					now={statusStore.now}
				/>

				{#if status.incidents.length}
					<section aria-labelledby="active-incidents" class="space-y-3">
						<h2 id="active-incidents" class="text-foreground text-lg font-semibold">
							{m.status_incidents_active()}
						</h2>
						{#each status.incidents as incident (incident.id)}
							<IncidentCard {incident} open now={statusStore.now} />
						{/each}
					</section>
				{/if}

				{#if maintenance.length}
					<section aria-labelledby="maintenance" class="space-y-3">
						<h2 id="maintenance" class="text-foreground text-lg font-semibold">
							{m.status_maintenance_heading()}
						</h2>
						{#each maintenance as item (item.id)}
							<MaintenanceCard maintenance={item} />
						{/each}
					</section>
				{/if}

				<div class="space-y-8">
					{#each GROUPS as group (group)}
						{@const items = status.components.filter((c) => c.group === group)}
						{#if items.length}
							<section aria-labelledby="group-{group}">
								<h2 id="group-{group}" class="text-foreground mb-3 text-lg font-semibold">
									{groupLabel(group)}
								</h2>
								{#if showTable.on}
									<StatusTable components={items} />
								{:else}
									<ul class="border-border bg-card divide-border divide-y rounded-2xl border">
										{#each items as component (component.slug)}
											<ComponentRow {component} now={statusStore.now} />
										{/each}
									</ul>
								{/if}
							</section>
						{/if}
					{/each}

					<button
						type="button"
						class="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-md text-sm outline-none focus-visible:ring-2"
						aria-pressed={showTable.on}
						onclick={() => (showTable.on = !showTable.on)}
					>
						<Table2 class="size-4" aria-hidden="true" />
						{showTable.on ? m.status_table_hide() : m.status_table_show()}
					</button>
				</div>

				<StatsStrip stats={status.stats} />

				<section aria-labelledby="history" class="space-y-3">
					<h2 id="history" class="text-foreground text-lg font-semibold">{m.status_history()}</h2>
					{#each status.history as incident (incident.id)}
						<IncidentCard {incident} now={statusStore.now} />
					{:else}
						<p class="text-muted-foreground text-sm">{m.status_history_none()}</p>
					{/each}
				</section>
			</div>
		{:else if statusStore.loading}
			<div class="space-y-6" aria-busy="true" aria-label={m.status_loading()}>
				<div class="bg-muted h-24 animate-pulse rounded-2xl"></div>
				<div class="bg-muted h-64 animate-pulse rounded-2xl"></div>
			</div>
		{/if}

		<footer
			class="border-border mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6 text-sm"
		>
			<a
				href={discord}
				target="_blank"
				rel="external noopener noreferrer"
				class="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 font-semibold"
			>
				<SiDiscord class="size-4" />
				{m.status_help_discord()}
			</a>
			<a
				href={localePath('/contact')}
				class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
			>
				{m.status_help_contact()}
				<ArrowUpRight class="size-3.5" aria-hidden="true" />
			</a>
		</footer>

		{#if AdminTools}
			<div class="border-border mt-12 border-t pt-8">
				<AdminTools embedded />
			</div>
		{/if}
	</div>
</Container>
