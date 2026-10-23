<script lang="ts">
	import { onMount } from 'svelte';
	import { Activity, Megaphone, RefreshCw, Server, Wrench } from '@lucide/svelte';
	import AdminPanel from '#lib/components/AdminPanel.svelte';
	import { type AdminTab } from '#lib/components/AdminTabs.svelte';
	import ComponentsTab from '#lib/components/admin/status/ComponentsTab.svelte';
	import IncidentsTab from '#lib/components/admin/status/IncidentsTab.svelte';
	import MaintenanceTab from '#lib/components/admin/status/MaintenanceTab.svelte';
	import SystemTab from '#lib/components/admin/status/SystemTab.svelte';
	import { adminGet, adminPost } from '#lib/adminApi.js';
	import { refreshStatus } from '#lib/status.svelte.js';
	import type { AdminStatus } from '#lib/status.js';

	// Shown in /admin and, for admins, below the public /status page (embedded).
	let { embedded = false }: { embedded?: boolean } = $props();

	const POLL_MS = 20_000;

	let active = $state('components');
	let data = $state<AdminStatus | null>(null);
	let error = $state('');
	let refreshing = $state(false);

	async function load() {
		refreshing = true;
		try {
			data = await adminGet<AdminStatus>('/status');
			error = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load';
		} finally {
			refreshing = false;
		}
	}

	/** Runs one admin action, then refreshes both the admin data and the public page. */
	async function act(body: Record<string, unknown>): Promise<boolean> {
		const result = await adminPost('/status', body);
		if (!result.ok) {
			error = result.error ?? 'Action failed';
			return false;
		}
		error = '';
		await Promise.all([load(), refreshStatus()]);
		return true;
	}

	onMount(() => {
		void load();
		const timer = setInterval(() => {
			if (!document.hidden) void load();
		}, POLL_MS);
		return () => clearInterval(timer);
	});

	const drafts = $derived(data?.incidents.filter((i) => !i.published).length ?? 0);
	const open = $derived(
		data?.incidents.filter((i) => i.published && i.status !== 'resolved').length ?? 0
	);

	const tabs = $derived<AdminTab[]>([
		{ id: 'components', label: 'Components', icon: Activity, count: data?.components.length },
		{ id: 'incidents', label: 'Incidents', icon: Megaphone, count: drafts + open },
		{ id: 'maintenance', label: 'Maintenance', icon: Wrench, count: data?.maintenance.length },
		{ id: 'system', label: 'System', icon: Server }
	]);
</script>

<AdminPanel {error} {tabs} bind:active>
	{#snippet toolbar()}
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-base font-semibold">
				{embedded ? 'Admin tools' : 'Status monitoring'}
				<span class="text-muted-foreground ml-2 text-xs font-normal">
					Only visible to administrators
				</span>
			</h2>
			<button
				type="button"
				class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs"
				onclick={load}
				disabled={refreshing}
			>
				<RefreshCw class="size-3.5 {refreshing ? 'animate-spin' : ''}" />
				Refresh
			</button>
		</div>
	{/snippet}

	{#if !data}
		<p class="text-muted-foreground py-8 text-center text-sm">{error ? '' : 'Loading...'}</p>
	{:else if active === 'components'}
		<ComponentsTab {data} {act} />
	{:else if active === 'incidents'}
		<IncidentsTab {data} {act} />
	{:else if active === 'maintenance'}
		<MaintenanceTab {data} {act} />
	{:else}
		<SystemTab {data} />
	{/if}
</AdminPanel>
