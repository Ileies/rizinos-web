<script lang="ts">
	import { onMount } from 'svelte';
	import { Users, Webhook, Server, Pencil, Trash2, Plus } from '@lucide/svelte';
	import * as Table from '$shadcn/table';
	import * as Button from '$shadcn/button';
	import * as Input from '$shadcn/input';
	import Modal from '$lib/components/Modal.svelte';
	import { adminGet, adminPost } from '$lib/adminApi';

	interface McUser {
		minecraftUuid: string;
		discordUserId: string;
		minecraftName: string;
		token: string | null;
	}
	interface McHook {
		webhookId: string;
		channelId: string;
		token: string;
		minecraftServerId: string;
		prefix: string;
		server?: { serverId: string; ip: string } | null;
	}
	interface McServer {
		serverId: string;
		ip: string;
		hook?: { webhookId: string } | null;
	}

	let users = $state<McUser[]>([]);
	let hooks = $state<McHook[]>([]);
	let servers = $state<McServer[]>([]);
	let loadError = $state('');
	let formError = $state('');
	let submitting = $state(false);

	async function load() {
		try {
			const data = await adminGet<{ users: McUser[]; hooks: McHook[]; servers: McServer[] }>(
				'/minechat'
			);
			users = data.users;
			hooks = data.hooks;
			servers = data.servers;
		} catch (e) {
			loadError = e instanceof Error ? e.message : 'Failed to load';
		}
	}

	onMount(load);

	let currentTab = $state('users');

	const innerTabs = [
		{ id: 'users', label: 'Users', icon: Users, count: () => users.length },
		{ id: 'hooks', label: 'Hooks', icon: Webhook, count: () => hooks.length },
		{ id: 'servers', label: 'Servers', icon: Server, count: () => servers.length }
	];

	/** POST an action, close the given modal + reload on success. */
	async function run(action: string, body: Record<string, unknown>, close: () => void) {
		submitting = true;
		formError = '';
		const res = await adminPost('/minechat', { action, ...body });
		submitting = false;
		if (res.ok) {
			close();
			await load();
		} else {
			formError = res.error ?? 'Failed';
		}
	}

	async function remove(action: string, body: Record<string, unknown>) {
		const res = await adminPost('/minechat', { action, ...body });
		if (res.ok) await load();
		else loadError = res.error ?? 'Failed to delete';
	}

	// --- Users ---
	let userModalOpen = $state(false);
	let userModalMode = $state<'create' | 'edit'>('create');
	let uUuid = $state('');
	let uDiscordId = $state('');
	let uMcName = $state('');
	let uToken = $state('');

	function openUserCreate() {
		userModalMode = 'create';
		uUuid = '';
		uDiscordId = '';
		uMcName = '';
		uToken = '';
		formError = '';
		userModalOpen = true;
	}

	function openUserEdit(u: McUser) {
		userModalMode = 'edit';
		uUuid = u.minecraftUuid;
		uDiscordId = u.discordUserId;
		uMcName = u.minecraftName;
		uToken = u.token ?? '';
		formError = '';
		userModalOpen = true;
	}

	function submitUser(e: SubmitEvent) {
		e.preventDefault();
		run(
			userModalMode === 'create' ? 'userCreate' : 'userUpdate',
			{ minecraftUuid: uUuid, minecraftName: uMcName, discordUserId: uDiscordId, token: uToken },
			() => (userModalOpen = false)
		);
	}

	// --- Hooks ---
	let hookModalOpen = $state(false);
	let hookModalMode = $state<'create' | 'edit'>('create');
	let hWebhookId = $state('');
	let hChannelId = $state('');
	let hToken = $state('');
	let hServerId = $state('');
	let hPrefix = $state('<%1> ');

	function openHookCreate() {
		hookModalMode = 'create';
		hWebhookId = '';
		hChannelId = '';
		hToken = '';
		hServerId = servers[0]?.serverId ?? '';
		hPrefix = '<%1> ';
		formError = '';
		hookModalOpen = true;
	}

	function openHookEdit(h: McHook) {
		hookModalMode = 'edit';
		hWebhookId = h.webhookId;
		hChannelId = h.channelId;
		hToken = h.token;
		hServerId = h.minecraftServerId;
		hPrefix = h.prefix;
		formError = '';
		hookModalOpen = true;
	}

	function submitHook(e: SubmitEvent) {
		e.preventDefault();
		run(
			hookModalMode === 'create' ? 'hookCreate' : 'hookUpdate',
			{
				webhookId: hWebhookId,
				channelId: hChannelId,
				token: hToken,
				minecraftServerId: hServerId,
				prefix: hPrefix
			},
			() => (hookModalOpen = false)
		);
	}

	// --- Servers ---
	let serverModalOpen = $state(false);
	let serverModalMode = $state<'create' | 'edit'>('create');
	let sId = $state('');
	let sIp = $state('');

	function openServerCreate() {
		serverModalMode = 'create';
		sId = '';
		sIp = '';
		formError = '';
		serverModalOpen = true;
	}

	function openServerEdit(s: McServer) {
		serverModalMode = 'edit';
		sId = s.serverId;
		sIp = s.ip;
		formError = '';
		serverModalOpen = true;
	}

	function submitServer(e: SubmitEvent) {
		e.preventDefault();
		run(
			serverModalMode === 'create' ? 'serverCreate' : 'serverUpdate',
			{ serverId: sId, ip: sIp },
			() => (serverModalOpen = false)
		);
	}
</script>

<div class="mx-auto max-w-7xl px-6 py-4">
	{#if loadError}
		<div class="bg-destructive/10 text-destructive mb-3 rounded px-3 py-2 text-sm">{loadError}</div>
	{/if}
	<div class="mb-4 flex gap-1 border-b">
		{#each innerTabs as tab (tab.id)}
			{@const Icon = tab.icon}
			<button
				class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors {currentTab ===
				tab.id
					? 'border-primary text-primary border-b-2'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (currentTab = tab.id)}
			>
				<Icon class="h-3.5 w-3.5" />
				{tab.label}
				<span
					class="text-xs {currentTab === tab.id ? 'text-primary/70' : 'text-muted-foreground/60'}"
					>({tab.count()})</span
				>
			</button>
		{/each}
	</div>

	<!-- USERS -->
	{#if currentTab === 'users'}
		<div class="mb-3">
			<Button.Root size="sm" onclick={openUserCreate}>
				<Plus size={14} />
				Add User
			</Button.Root>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>MC Name</Table.Head>
					<Table.Head>MC UUID</Table.Head>
					<Table.Head>Discord User ID</Table.Head>
					<Table.Head class="w-24">Token</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each users as user (user.minecraftUuid)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5 font-medium">{user.minecraftName}</Table.Cell>
						<Table.Cell class="py-1.5">
							<button
								onclick={() => openUserEdit(user)}
								class="text-muted-foreground hover:text-foreground font-mono text-xs hover:underline"
							>
								{user.minecraftUuid}
							</button>
						</Table.Cell>
						<Table.Cell class="text-muted-foreground py-1.5 font-mono text-xs"
							>{user.discordUserId}</Table.Cell
						>
						<Table.Cell class="py-1.5">
							{#if user.token}
								<span
									class="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
									>set</span
								>
							{:else}
								<span class="text-muted-foreground/40 text-xs">-</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<div class="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
								<button
									onclick={() => openUserEdit(user)}
									class="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5"
									title="Edit"
								>
									<Pencil size={13} />
								</button>
								<button
									onclick={() => remove('userDelete', { minecraftUuid: user.minecraftUuid })}
									class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1.5"
									title="Delete"
								>
									<Trash2 size={13} />
								</button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if users.length === 0}
					<Table.Row>
						<Table.Cell colspan={5} class="text-muted-foreground py-8 text-center text-sm"
							>No users</Table.Cell
						>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	{/if}

	<!-- HOOKS -->
	{#if currentTab === 'hooks'}
		<div class="mb-3">
			<Button.Root size="sm" onclick={openHookCreate}>
				<Plus size={14} />
				Add Hook
			</Button.Root>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Webhook ID</Table.Head>
					<Table.Head>Channel ID</Table.Head>
					<Table.Head>Server</Table.Head>
					<Table.Head class="w-32">Prefix</Table.Head>
					<Table.Head class="w-24">Token</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each hooks as hook (hook.webhookId)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="text-muted-foreground py-1.5 font-mono text-xs"
							>{hook.webhookId}</Table.Cell
						>
						<Table.Cell class="text-muted-foreground py-1.5 font-mono text-xs"
							>{hook.channelId}</Table.Cell
						>
						<Table.Cell class="py-1.5 text-sm"
							>{hook.server?.ip ?? hook.minecraftServerId}</Table.Cell
						>
						<Table.Cell class="py-1.5 font-mono text-xs">{hook.prefix}</Table.Cell>
						<Table.Cell class="text-muted-foreground py-1.5 font-mono text-xs">
							<span class="block max-w-[80px] truncate" title={hook.token}>{hook.token}</span>
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<div class="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
								<button
									onclick={() => openHookEdit(hook)}
									class="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5"
									title="Edit"
								>
									<Pencil size={13} />
								</button>
								<button
									onclick={() => remove('hookDelete', { webhookId: hook.webhookId })}
									class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1.5"
									title="Delete"
								>
									<Trash2 size={13} />
								</button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if hooks.length === 0}
					<Table.Row>
						<Table.Cell colspan={6} class="text-muted-foreground py-8 text-center text-sm"
							>No hooks</Table.Cell
						>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	{/if}

	<!-- SERVERS -->
	{#if currentTab === 'servers'}
		<div class="mb-3">
			<Button.Root size="sm" onclick={openServerCreate}>
				<Plus size={14} />
				Add Server
			</Button.Root>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Server ID</Table.Head>
					<Table.Head>IP</Table.Head>
					<Table.Head class="w-32">Hook</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each servers as server (server.serverId)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5 font-mono text-sm">{server.serverId}</Table.Cell>
						<Table.Cell class="py-1.5 text-sm">{server.ip}</Table.Cell>
						<Table.Cell class="py-1.5">
							{#if server.hook}
								<span
									class="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
									>linked</span
								>
							{:else}
								<span class="text-muted-foreground/40 text-xs">none</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<div class="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
								<button
									onclick={() => openServerEdit(server)}
									class="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5"
									title="Edit"
								>
									<Pencil size={13} />
								</button>
								<button
									onclick={() => remove('serverDelete', { serverId: server.serverId })}
									class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1.5"
									title="Delete"
								>
									<Trash2 size={13} />
								</button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if servers.length === 0}
					<Table.Row>
						<Table.Cell colspan={4} class="text-muted-foreground py-8 text-center text-sm"
							>No servers</Table.Cell
						>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	{/if}
</div>

<!-- USER MODAL -->
<Modal
	bind:open={userModalOpen}
	title={userModalMode === 'create' ? 'Add Minechat User' : 'Edit Minechat User'}
>
	<form onsubmit={submitUser} class="space-y-3">
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div>
			<label for="u-uuid" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Minecraft UUID</label
			>
			<Input.Root
				id="u-uuid"
				name="minecraftUuid"
				bind:value={uUuid}
				placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
				required
				readonly={userModalMode === 'edit'}
			/>
		</div>
		<div>
			<label for="u-mcname" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Minecraft Name</label
			>
			<Input.Root
				id="u-mcname"
				name="minecraftName"
				bind:value={uMcName}
				placeholder="Steve"
				required
			/>
		</div>
		<div>
			<label for="u-dc" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Discord User ID</label
			>
			<Input.Root
				id="u-dc"
				name="discordUserId"
				bind:value={uDiscordId}
				placeholder="123456789012345678"
				required
			/>
		</div>
		<div>
			<label for="u-token" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Token (optional)</label
			>
			<Input.Root
				id="u-token"
				name="token"
				bind:value={uToken}
				placeholder="leave blank to clear"
			/>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button.Root type="button" variant="outline" size="sm" onclick={() => (userModalOpen = false)}
				>Cancel</Button.Root
			>
			<Button.Root type="submit" size="sm" disabled={submitting}
				>{userModalMode === 'create' ? 'Create' : 'Save'}</Button.Root
			>
		</div>
	</form>
</Modal>

<!-- HOOK MODAL -->
<Modal bind:open={hookModalOpen} title={hookModalMode === 'create' ? 'Add Hook' : 'Edit Hook'}>
	<form onsubmit={submitHook} class="space-y-3">
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div>
			<label for="h-wid" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Webhook ID</label
			>
			<Input.Root
				id="h-wid"
				name="webhookId"
				bind:value={hWebhookId}
				required
				readonly={hookModalMode === 'edit'}
			/>
		</div>
		<div>
			<label for="h-ch" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Channel ID</label
			>
			<Input.Root id="h-ch" name="channelId" bind:value={hChannelId} required />
		</div>
		<div>
			<label for="h-tok" class="text-muted-foreground mb-1 block text-xs font-medium">Token</label>
			<Input.Root id="h-tok" name="token" bind:value={hToken} required />
		</div>
		<div>
			<label for="h-srv" class="text-muted-foreground mb-1 block text-xs font-medium">Server</label>
			{#if servers.length > 0}
				<select
					id="h-srv"
					name="minecraftServerId"
					bind:value={hServerId}
					class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
					required
				>
					{#each servers as s (s.serverId)}
						<option value={s.serverId}>{s.ip} ({s.serverId})</option>
					{/each}
				</select>
			{:else}
				<Input.Root
					id="h-srv"
					name="minecraftServerId"
					bind:value={hServerId}
					placeholder="server-id"
					required
				/>
			{/if}
		</div>
		<div>
			<label for="h-pfx" class="text-muted-foreground mb-1 block text-xs font-medium">Prefix</label>
			<Input.Root id="h-pfx" name="prefix" bind:value={hPrefix} placeholder="&lt;%1&gt; " />
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button.Root type="button" variant="outline" size="sm" onclick={() => (hookModalOpen = false)}
				>Cancel</Button.Root
			>
			<Button.Root type="submit" size="sm" disabled={submitting}
				>{hookModalMode === 'create' ? 'Create' : 'Save'}</Button.Root
			>
		</div>
	</form>
</Modal>

<!-- SERVER MODAL -->
<Modal
	bind:open={serverModalOpen}
	title={serverModalMode === 'create' ? 'Add Server' : 'Edit Server'}
>
	<form onsubmit={submitServer} class="space-y-3">
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div>
			<label for="s-id" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Server ID</label
			>
			<Input.Root
				id="s-id"
				name="serverId"
				bind:value={sId}
				placeholder="my-server"
				required
				readonly={serverModalMode === 'edit'}
			/>
		</div>
		<div>
			<label for="s-ip" class="text-muted-foreground mb-1 block text-xs font-medium">IP</label>
			<Input.Root id="s-ip" name="ip" bind:value={sIp} placeholder="play.example.com" required />
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button.Root
				type="button"
				variant="outline"
				size="sm"
				onclick={() => (serverModalOpen = false)}>Cancel</Button.Root
			>
			<Button.Root type="submit" size="sm" disabled={submitting}
				>{serverModalMode === 'create' ? 'Create' : 'Save'}</Button.Root
			>
		</div>
	</form>
</Modal>
