<script lang="ts">
	import { onMount } from 'svelte';
	import * as Table from '$shadcn/table';
	import * as Button from '$shadcn/button';
	import { adminGet, adminPost } from '$lib/adminApi';

	interface UnbanRequest {
		id: number;
		type: 'minecraft' | 'discord' | 'rizinos';
		subjectId: string;
		banId: string;
		label: string;
		message: string;
		status: string;
		createdAt: string | Date;
	}

	let unbanRequests = $state<UnbanRequest[]>([]);
	let loadError = $state('');

	const TYPE_LABEL: Record<UnbanRequest['type'], string> = {
		minecraft: 'Minecraft',
		discord: 'Discord',
		rizinos: 'RizinOS'
	};

	async function load() {
		try {
			const data = await adminGet<{ unbanRequests: UnbanRequest[] }>('/unban-requests');
			unbanRequests = data.unbanRequests;
		} catch (e) {
			loadError = e instanceof Error ? e.message : 'Failed to load';
		}
	}

	onMount(load);

	async function resolve(id: number, approve: boolean) {
		const res = await adminPost('/unban-requests', { action: approve ? 'approve' : 'deny', id: String(id) });
		if (res.ok) await load();
		else loadError = res.error ?? 'Failed to resolve request';
	}
</script>

<div class="mx-auto max-w-7xl px-6 py-4">
	{#if loadError}
		<div class="bg-destructive/10 text-destructive mb-3 rounded px-3 py-2 text-sm">{loadError}</div>
	{/if}

	<h2 class="mb-3 text-lg font-semibold">Unban Requests</h2>

	<Table.Root class="w-full table-fixed">
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-28">System</Table.Head>
				<Table.Head class="w-32">Subject</Table.Head>
				<Table.Head>Message</Table.Head>
				<Table.Head class="w-40">Submitted</Table.Head>
				<Table.Head class="w-40"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each unbanRequests as req (req.id)}
				<Table.Row class="hover:bg-muted/40 group">
					<Table.Cell class="py-1.5">
						<span
							class="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
						>
							{TYPE_LABEL[req.type]}
						</span>
					</Table.Cell>
					<Table.Cell class="py-1.5 font-medium">
						{req.label}
						<span class="text-muted-foreground ml-1 font-mono text-xs">[{req.banId}]</span>
					</Table.Cell>
					<Table.Cell class="py-1.5 text-sm whitespace-pre-wrap">{req.message}</Table.Cell>
					<Table.Cell class="py-1.5 text-xs">{new Date(req.createdAt).toLocaleString()}</Table.Cell>
					<Table.Cell class="py-1.5">
						<div class="flex gap-1.5">
							<Button.Root onclick={() => resolve(req.id, true)} size="sm" class="h-7 px-2 text-xs"
								>Approve</Button.Root
							>
							<Button.Root
								onclick={() => resolve(req.id, false)}
								size="sm"
								variant="outline"
								class="h-7 px-2 text-xs">Deny</Button.Root
							>
						</div>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={5} class="text-muted-foreground py-4 text-center text-sm">
						No open requests.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
