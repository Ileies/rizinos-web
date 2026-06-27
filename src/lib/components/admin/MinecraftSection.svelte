<script lang="ts">
	import { onMount } from 'svelte';
	import type { UserData } from '$lib/types';
	import { Plus, CheckCircle2, XCircle, Loader2 } from '@lucide/svelte';
	import * as Table from '$shadcn/table';
	import * as Button from '$shadcn/button';
	import * as Input from '$shadcn/input';
	import Modal from '$lib/components/Modal.svelte';
	import RestrictEditor from '$lib/components/RestrictEditor.svelte';
	import LocationEditor from '$lib/components/LocationEditor.svelte';
	import AdminPanel from '$lib/components/AdminPanel.svelte';
	import RowActions from '$lib/components/RowActions.svelte';
	import UserViewModal from '$lib/components/UserViewModal.svelte';
	import { type AdminTab } from '$lib/components/AdminTabs.svelte';
	import { Pickaxe, Wand2, Compass, Eye, Users, MapPin, Globe, Layers } from '@lucide/svelte';
	import { adminGet, adminPost } from '$lib/adminApi';

	interface Warp {
		name: string;
		location: string | null;
		restrict: string[] | null;
	}
	interface World {
		name: string;
		groupName: string;
		restrict: string[] | null;
	}
	interface Group {
		name: string;
		gameMode: number;
		restrict: string[] | null;
	}
	interface McUserRow {
		uuid: string;
		name: string;
		userId: string;
		permissions: string[];
		homeLocation: string | null;
		welcomeMessage: string | null;
		bannedUntil: string | Date | null;
		bannedReason: string | null;
		mutedUntil: string | Date | null;
		user: UserData;
	}
	interface SimpleUser {
		id: string;
		username: string;
	}

	let warps = $state<Warp[]>([]);
	let worlds = $state<World[]>([]);
	let groups = $state<Group[]>([]);
	let mcUsers = $state<McUserRow[]>([]);
	let users = $state<SimpleUser[]>([]);
	let unassignedUsers = $state<SimpleUser[]>([]);
	let loadError = $state('');
	let formError = $state('');

	async function load() {
		try {
			const data = await adminGet<{
				warps: Warp[];
				worlds: World[];
				groups: Group[];
				mcUsers: McUserRow[];
				users: SimpleUser[];
				unassignedUsers: SimpleUser[];
			}>('/minecraft');
			warps = data.warps;
			worlds = data.worlds;
			groups = data.groups;
			mcUsers = data.mcUsers;
			users = data.users;
			unassignedUsers = data.unassignedUsers;
		} catch (e) {
			loadError = e instanceof Error ? e.message : 'Failed to load';
		}
	}

	onMount(load);

	/** Submit a form's fields as an action; close + reload on success. */
	async function submitForm(e: SubmitEvent, action: string, close?: () => void) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const body = Object.fromEntries(new FormData(form).entries());
		formError = '';
		const res = await adminPost('/minecraft', { action, ...body });
		if (res.ok) {
			close?.();
			await load();
		} else {
			formError = res.error ?? 'Failed';
		}
	}

	async function remove(action: string, body: Record<string, unknown>) {
		const res = await adminPost('/minecraft', { action, ...body });
		if (res.ok) await load();
		else loadError = res.error ?? 'Failed to delete';
	}

	let currentTab = $state('players');
	let worldNames = $derived(worlds.map((w) => w.name));

	const mcTabs = $derived<AdminTab[]>([
		{ id: 'players', label: 'Players', icon: Users, count: mcUsers.length },
		{ id: 'warps', label: 'Warps', icon: MapPin, count: warps.length },
		{ id: 'worlds', label: 'Worlds', icon: Globe, count: worlds.length },
		{ id: 'groups', label: 'Groups', icon: Layers, count: groups.length }
	]);

	// --- Create Player validation ---
	type VState = 'idle' | 'loading' | 'valid' | 'invalid';
	let cpName = $state('');
	let cpUuid = $state('');
	let cpNameState = $state<VState>('idle');
	let cpUuidState = $state<VState>('idle');
	let cpValidateError = $state('');

	$effect(() => {
		if (!createPlayerOpen) {
			cpName = '';
			cpUuid = '';
			cpNameState = 'idle';
			cpUuidState = 'idle';
			cpValidateError = '';
		}
	});

	async function cpLookupByName(name: string) {
		name = name.trim();
		if (!name) return;
		cpNameState = 'loading';
		cpUuidState = 'idle';
		cpValidateError = '';
		try {
			const res = await fetch(
				`/api/admin/minecraft/validate?type=username&value=${encodeURIComponent(name)}`
			);
			const body = await res.json();
			if (res.ok) {
				cpName = body.name;
				cpUuid = body.uuid;
				cpNameState = 'valid';
				cpUuidState = 'valid';
			} else {
				cpNameState = 'invalid';
				cpValidateError = body.error ?? 'Player not found';
			}
		} catch {
			cpNameState = 'invalid';
			cpValidateError = 'Network error';
		}
	}

	async function cpLookupByUuid(uuid: string) {
		uuid = uuid.trim();
		if (!uuid) return;
		cpUuidState = 'loading';
		cpNameState = 'idle';
		cpValidateError = '';
		try {
			const res = await fetch(
				`/api/admin/minecraft/validate?type=uuid&value=${encodeURIComponent(uuid)}`
			);
			const body = await res.json();
			if (res.ok) {
				cpName = body.name;
				cpUuid = body.uuid;
				cpUuidState = 'valid';
				cpNameState = 'valid';
			} else {
				cpUuidState = 'invalid';
				cpValidateError = body.error ?? 'Player not found';
			}
		} catch {
			cpUuidState = 'invalid';
			cpValidateError = 'Network error';
		}
	}

	function cpHandleNamePaste(e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text') ?? '';
		const trimmed = text.trim();
		if (trimmed) {
			e.preventDefault();
			cpName = trimmed;
			cpLookupByName(trimmed);
		}
	}

	function cpHandleUuidPaste(e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text') ?? '';
		const trimmed = text.trim();
		if (trimmed) {
			e.preventDefault();
			cpUuid = trimmed;
			cpLookupByUuid(trimmed);
		}
	}

	function cpHandleNameBlur() {
		if (cpNameState === 'idle' && cpName.trim()) cpLookupByName(cpName);
	}

	function cpHandleUuidBlur() {
		if (cpUuidState === 'idle' && cpUuid.trim()) cpLookupByUuid(cpUuid);
	}

	// --- Players ---
	let editingPlayerUuid = $state<string | null>(null);
	let playerModalOpen = $state(false);
	let createPlayerOpen = $state(false);
	let editingPlayer = $derived(mcUsers.find((u) => u.uuid === editingPlayerUuid) ?? null);
	let permItems = $state<string[]>([]);

	function openPlayerEdit(uuid: string) {
		const player = mcUsers.find((u) => u.uuid === uuid);
		permItems = [...(player?.permissions ?? [])];
		editingPlayerUuid = uuid;
		formError = '';
		playerModalOpen = true;
	}

	$effect(() => {
		if (!playerModalOpen) editingPlayerUuid = null;
	});

	function handlePermKey(e: KeyboardEvent) {
		const input = e.target as HTMLInputElement;
		const last = input.value[input.value.length - 1];
		if (last === ',' || last === ' ') {
			e.preventDefault();
			const text = input.value.slice(0, -1).trim();
			if (text && !permItems.includes(text)) permItems.push(text);
			input.value = '';
		}
	}

	function removePerm(p: string) {
		permItems = permItems.filter((x) => x !== p);
	}

	// --- Warps ---
	let editingWarpName = $state<string | null>(null);
	let warpModalOpen = $state(false);
	let createWarpOpen = $state(false);
	let editingWarp = $derived(warps.find((w) => w.name === editingWarpName) ?? null);

	$effect(() => {
		if (!warpModalOpen) editingWarpName = null;
	});

	// --- Worlds ---
	let editingWorldName = $state<string | null>(null);
	let worldModalOpen = $state(false);
	let createWorldOpen = $state(false);
	let editingWorld = $derived(worlds.find((w) => w.name === editingWorldName) ?? null);

	$effect(() => {
		if (!worldModalOpen) editingWorldName = null;
	});

	// --- Groups ---
	let editingGroupName = $state<string | null>(null);
	let groupModalOpen = $state(false);
	let createGroupOpen = $state(false);
	let editingGroup = $derived(groups.find((g) => g.name === editingGroupName) ?? null);
	let editGroupGameMode = $state(0);
	let createGroupGameMode = $state(0);

	$effect(() => {
		if (!groupModalOpen) editingGroupName = null;
	});

	function openGroupEdit(name: string) {
		const group = groups.find((g) => g.name === name);
		editGroupGameMode = group?.gameMode ?? 0;
		editingGroupName = name;
		formError = '';
		groupModalOpen = true;
	}

	// --- User view ---
	let viewUserOpen = $state(false);
	let viewingUser = $state<UserData | null>(null);

	function openViewUser(user: UserData) {
		viewingUser = user;
		viewUserOpen = true;
	}

	// --- Helpers ---
	function fmtLoc(loc: string | null) {
		if (!loc) return '-';
		const get = (key: string) => {
			const m = loc.match(new RegExp(`(?:^|,)${key}=([^,]+)`));
			return m ? m[1] : null;
		};
		const world = get('world') ?? '';
		const x = Math.round(parseFloat(get('x') ?? '0') || 0);
		const y = Math.round(parseFloat(get('y') ?? '0') || 0);
		const z = Math.round(parseFloat(get('z') ?? '0') || 0);
		return world ? `${world} (${x}, ${y}, ${z})` : `${x}, ${y}, ${z}`;
	}

	const GM_ICON = { 0: Pickaxe, 1: Wand2, 2: Compass, 3: Eye } as const;
	const GM_LABEL = { 0: 'Survival', 1: 'Creative', 2: 'Adventure', 3: 'Spectator' } as const;
	const GM_KEYS = [0, 1, 2, 3] as const;

	function homeWorld(loc: string | null) {
		if (!loc) return null;
		const m = loc.match(/(?:^|,)world=([^,]+)/);
		return m ? m[1] : null;
	}
</script>

{#snippet gameModePicker(current: number, set: (v: number) => void, inputName: string)}
	<input type="hidden" name={inputName} value={current} />
	<div class="flex overflow-hidden rounded-md border">
		{#each GM_KEYS as val (val)}
			{@const Icon = GM_ICON[val]}
			<button
				type="button"
				onclick={() => set(val)}
				class="flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 text-xs transition-colors {current ===
				val
					? 'bg-primary text-primary-foreground'
					: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
				title={GM_LABEL[val]}
			>
				<Icon size={12} />
				{GM_LABEL[val]}
			</button>
		{/each}
	</div>
{/snippet}

<AdminPanel error={loadError} tabs={mcTabs} bind:active={currentTab}>
	{#snippet toolbar()}
		{#if currentTab === 'players'}
			<Button.Root onclick={() => (createPlayerOpen = true)} size="sm" class="gap-1.5">
				<Plus size={14} /> New Player
			</Button.Root>
		{:else if currentTab === 'warps'}
			<Button.Root onclick={() => (createWarpOpen = true)} size="sm" class="gap-1.5">
				<Plus size={14} /> New Warp
			</Button.Root>
		{:else if currentTab === 'worlds'}
			<Button.Root onclick={() => (createWorldOpen = true)} size="sm" class="gap-1.5">
				<Plus size={14} /> New World
			</Button.Root>
		{:else if currentTab === 'groups'}
			<Button.Root onclick={() => (createGroupOpen = true)} size="sm" class="gap-1.5">
				<Plus size={14} /> New Group
			</Button.Root>
		{/if}
	{/snippet}

	<!-- PLAYERS -->
	{#if currentTab === 'players'}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-36">MC Name</Table.Head>
					<Table.Head class="w-32">Account</Table.Head>
					<Table.Head class="w-20 text-center">Perms</Table.Head>
					<Table.Head class="w-28">Home</Table.Head>
					<Table.Head class="w-32">Sanctions</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each mcUsers as mc (mc.uuid)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5 font-medium">{mc.name}</Table.Cell>
						<Table.Cell class="py-1.5 text-xs">
							<button
								onclick={() => openViewUser(mc.user)}
								class="text-muted-foreground hover:text-foreground hover:underline"
							>
								{mc.user.username}
							</button>
						</Table.Cell>
						<Table.Cell class="py-1.5 text-center text-sm">{mc.permissions.length}</Table.Cell>
						<Table.Cell class="py-1.5 text-xs">
							{@const hw = homeWorld(mc.homeLocation)}
							{#if hw && worlds.some((w) => w.name === hw)}
								<button
									onclick={() => {
										editingWorldName = hw;
										worldModalOpen = true;
									}}
									class="text-muted-foreground hover:text-foreground hover:underline"
								>
									{hw}
								</button>
							{:else}
								<span class="text-muted-foreground">{hw ?? '-'}</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<div class="flex gap-1">
								{#if mc.bannedUntil}
									<span
										class="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
										>banned</span
									>
								{/if}
								{#if mc.mutedUntil}
									<span
										class="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500"
										>muted</span
									>
								{/if}
								{#if !mc.bannedUntil && !mc.mutedUntil}
									<span class="text-muted-foreground text-xs">-</span>
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<RowActions
								onEdit={() => openPlayerEdit(mc.uuid)}
								onDelete={() => remove('mcUserDelete', { uuid: mc.uuid })}
							/>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}

	<!-- WARPS -->
	{#if currentTab === 'warps'}
		<Table.Root class="w-full table-fixed">
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-32">Name</Table.Head>
					<Table.Head class="w-52">Location</Table.Head>
					<Table.Head>Restrictions</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each warps as warp (warp.name)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5 font-medium">{warp.name}</Table.Cell>
						<Table.Cell class="py-1.5" title={warp.location ?? ''}>
							{@const ww = homeWorld(warp.location)}
							{#if ww && worlds.some((w) => w.name === ww)}
								<button
									onclick={() => {
										editingWorldName = ww;
										worldModalOpen = true;
									}}
									class="text-muted-foreground hover:text-foreground font-mono text-xs hover:underline"
								>
									{fmtLoc(warp.location)}
								</button>
							{:else}
								<span class="text-muted-foreground font-mono text-xs">{fmtLoc(warp.location)}</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="overflow-hidden py-1.5">
							<RestrictEditor value={warp.restrict ?? []} readonly {users} />
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<RowActions
								onEdit={() => {
									editingWarpName = warp.name;
									formError = '';
									warpModalOpen = true;
								}}
								onDelete={() => remove('warpDelete', { name: warp.name })}
							/>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}

	<!-- WORLDS -->
	{#if currentTab === 'worlds'}
		<Table.Root class="w-full table-fixed">
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-32">Name</Table.Head>
					<Table.Head class="w-36">Group</Table.Head>
					<Table.Head>Restrictions</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each worlds as world (world.name)}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5 font-medium">{world.name}</Table.Cell>
						<Table.Cell class="py-1.5">
							<button
								onclick={() => openGroupEdit(world.groupName)}
								class="text-muted-foreground hover:text-foreground text-sm hover:underline"
							>
								{world.groupName}
							</button>
						</Table.Cell>
						<Table.Cell class="overflow-hidden py-1.5">
							<RestrictEditor value={world.restrict ?? []} readonly {users} />
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<RowActions
								onEdit={() => {
									editingWorldName = world.name;
									formError = '';
									worldModalOpen = true;
								}}
								onDelete={() => remove('worldDelete', { name: world.name })}
							/>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}

	<!-- GROUPS -->
	{#if currentTab === 'groups'}
		<Table.Root class="w-full table-fixed">
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-32">Name</Table.Head>
					<Table.Head class="w-32">Mode</Table.Head>
					<Table.Head>Restrictions</Table.Head>
					<Table.Head class="w-16"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each groups as group (group.name)}
					{@const GmIcon = GM_ICON[group.gameMode as keyof typeof GM_ICON] ?? Pickaxe}
					<Table.Row class="hover:bg-muted/40 group">
						<Table.Cell class="py-1.5 font-medium">{group.name}</Table.Cell>
						<Table.Cell class="py-1.5">
							<span class="text-muted-foreground flex items-center gap-1.5 text-sm">
								<GmIcon size={13} />
								{GM_LABEL[group.gameMode as keyof typeof GM_LABEL] ?? group.gameMode}
							</span>
						</Table.Cell>
						<Table.Cell class="overflow-hidden py-1.5">
							<RestrictEditor value={group.restrict ?? []} readonly {users} />
						</Table.Cell>
						<Table.Cell class="py-1.5">
							<RowActions
								onEdit={() => openGroupEdit(group.name)}
								onDelete={() => remove('groupDelete', { name: group.name })}
							/>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</AdminPanel>

<!-- Player Edit Modal -->
{#if editingPlayer}
	<Modal bind:open={playerModalOpen} title="Edit Player: {editingPlayer.name}" wide>
		<div class="space-y-5">
			{#if formError}
				<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
			{/if}
			<p class="text-muted-foreground text-xs">
				UUID: <span class="font-mono">{editingPlayer.uuid}</span>
			</p>

			<form onsubmit={(e) => submitForm(e, 'mcUserUpdate')} class="space-y-3">
				<input type="hidden" name="uuid" value={editingPlayer.uuid} />
				<div>
					<label for="plr-welcome" class="text-muted-foreground mb-1 block text-xs font-medium"
						>Welcome Message</label
					>
					<Input.Root
						id="plr-welcome"
						name="welcomeMessage"
						value={editingPlayer.welcomeMessage ?? ''}
						placeholder="None"
					/>
				</div>
				<div>
					<p class="text-muted-foreground mb-1 text-xs font-medium">Home Location</p>
					<LocationEditor
						name="homeLocation"
						value={editingPlayer.homeLocation}
						worlds={worldNames}
					/>
				</div>
				<Button.Root type="submit" size="sm">Save</Button.Root>
			</form>

			<div class="border-t pt-4">
				<form onsubmit={(e) => submitForm(e, 'mcUserUpdatePermissions')} class="space-y-2">
					<input type="hidden" name="uuid" value={editingPlayer.uuid} />
					<input type="hidden" name="permissions" value={permItems.join(',')} />
					<p class="text-muted-foreground text-xs font-medium">Permissions ({permItems.length})</p>
					<div class="flex min-h-10 flex-wrap gap-1.5 rounded-md border p-2">
						{#each permItems as perm (perm)}
							<span
								class="bg-primary text-primary-foreground flex items-center gap-1 rounded px-2 py-0.5 text-xs"
							>
								{perm}
								<button
									type="button"
									onclick={() => removePerm(perm)}
									class="opacity-70 hover:opacity-100">×</button
								>
							</span>
						{/each}
						<input
							type="text"
							placeholder="Type and press space or comma…"
							class="min-w-32 flex-1 bg-transparent text-xs outline-none"
							onkeydown={handlePermKey}
						/>
					</div>
					<Button.Root type="submit" size="sm" variant="outline">Save Permissions</Button.Root>
				</form>
			</div>

			<div class="space-y-2 border-t pt-4">
				<p class="text-muted-foreground text-xs font-medium">Ban</p>
				{#if editingPlayer.bannedUntil}
					<div
						class="flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-xs dark:border-red-800 dark:bg-red-950/20"
					>
						<div>
							<span class="font-medium text-red-700 dark:text-red-400">Until:</span>
							<span class="ml-1 text-red-600"
								>{new Date(editingPlayer.bannedUntil).toLocaleString()}</span
							>
							{#if editingPlayer.bannedReason}
								<span class="ml-1 text-red-500">- {editingPlayer.bannedReason}</span>
							{/if}
						</div>
						<form onsubmit={(e) => submitForm(e, 'mcUserBan')} class="ml-3 shrink-0">
							<input type="hidden" name="uuid" value={editingPlayer.uuid} />
							<input type="hidden" name="until" value="" />
							<Button.Root
								type="submit"
								size="sm"
								variant="outline"
								class="h-6 border-red-300 px-2 text-xs text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400"
								>Lift</Button.Root
							>
						</form>
					</div>
				{/if}
				<form onsubmit={(e) => submitForm(e, 'mcUserBan')} class="flex items-end gap-2">
					<input type="hidden" name="uuid" value={editingPlayer.uuid} />
					<div class="flex-1">
						<label for="ban-until" class="text-muted-foreground mb-1 block text-xs">Until</label>
						<Input.Root id="ban-until" type="datetime-local" name="until" required />
					</div>
					<div class="flex-1">
						<label for="ban-reason" class="text-muted-foreground mb-1 block text-xs">Reason</label>
						<Input.Root id="ban-reason" name="reason" placeholder="Optional" />
					</div>
					<Button.Root type="submit" size="sm" variant="destructive" class="shrink-0"
						>Ban</Button.Root
					>
				</form>
			</div>

			<div class="space-y-2 border-t pt-4">
				<p class="text-muted-foreground text-xs font-medium">Mute</p>
				{#if editingPlayer.mutedUntil}
					<div
						class="flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs dark:border-yellow-800 dark:bg-yellow-950/20"
					>
						<div>
							<span class="font-medium text-yellow-700 dark:text-yellow-400">Until:</span>
							<span class="ml-1 text-yellow-600"
								>{new Date(editingPlayer.mutedUntil).toLocaleString()}</span
							>
						</div>
						<form onsubmit={(e) => submitForm(e, 'mcUserMute')} class="ml-3 shrink-0">
							<input type="hidden" name="uuid" value={editingPlayer.uuid} />
							<input type="hidden" name="until" value="" />
							<Button.Root
								type="submit"
								size="sm"
								variant="outline"
								class="h-6 border-yellow-300 px-2 text-xs text-yellow-700 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-400"
								>Lift</Button.Root
							>
						</form>
					</div>
				{/if}
				<form onsubmit={(e) => submitForm(e, 'mcUserMute')} class="flex items-end gap-2">
					<input type="hidden" name="uuid" value={editingPlayer.uuid} />
					<div>
						<label for="mute-until" class="text-muted-foreground mb-1 block text-xs">Until</label>
						<Input.Root id="mute-until" type="datetime-local" name="until" required />
					</div>
					<Button.Root
						type="submit"
						size="sm"
						variant="outline"
						class="shrink-0 border-yellow-400 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400"
						>Mute</Button.Root
					>
				</form>
			</div>
		</div>
	</Modal>
{/if}

<!-- Warp Edit Modal -->
{#if editingWarp}
	<Modal bind:open={warpModalOpen} title="Edit Warp: {editingWarp.name}" wide>
		<form
			onsubmit={(e) => submitForm(e, 'warpUpdate', () => (warpModalOpen = false))}
			class="space-y-4"
		>
			{#if formError}
				<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
			{/if}
			<input type="hidden" name="oldName" value={editingWarp.name} />
			<div>
				<label for="warp-name" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Name</label
				>
				<Input.Root id="warp-name" name="name" value={editingWarp.name} required />
			</div>
			<div>
				<p class="text-muted-foreground mb-1 text-xs font-medium">Location</p>
				<LocationEditor name="location" value={editingWarp.location} worlds={worldNames} />
			</div>
			<div>
				<p class="text-muted-foreground mb-1 text-xs font-medium">Restrictions</p>
				<RestrictEditor name="restrict" value={editingWarp.restrict ?? []} {users} />
			</div>
			<Button.Root type="submit" size="sm">Save</Button.Root>
		</form>
	</Modal>
{/if}

<!-- World Edit Modal -->
{#if editingWorld}
	<Modal bind:open={worldModalOpen} title="Edit World: {editingWorld.name}">
		<form
			onsubmit={(e) => submitForm(e, 'worldUpdate', () => (worldModalOpen = false))}
			class="space-y-4"
		>
			{#if formError}
				<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
			{/if}
			<input type="hidden" name="oldName" value={editingWorld.name} />
			<div>
				<label for="world-name" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Name</label
				>
				<Input.Root id="world-name" name="name" value={editingWorld.name} required />
			</div>
			<div>
				<label for="world-group" class="text-muted-foreground mb-1 block text-xs font-medium"
					>World Group</label
				>
				<select
					id="world-group"
					name="groupName"
					class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
					required
				>
					{#each groups as g (g.name)}
						<option value={g.name} selected={g.name === editingWorld.groupName}>{g.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<p class="text-muted-foreground mb-1 text-xs font-medium">Restrictions</p>
				<RestrictEditor name="restrict" value={editingWorld.restrict ?? []} {users} />
			</div>
			<Button.Root type="submit" size="sm">Save</Button.Root>
		</form>
	</Modal>
{/if}

<!-- Group Edit Modal -->
{#if editingGroup}
	<Modal bind:open={groupModalOpen} title="Edit Group: {editingGroup.name}">
		<form
			onsubmit={(e) => submitForm(e, 'groupUpdate', () => (groupModalOpen = false))}
			class="space-y-4"
		>
			{#if formError}
				<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
			{/if}
			<input type="hidden" name="oldName" value={editingGroup.name} />
			<div>
				<label for="group-name" class="text-muted-foreground mb-1 block text-xs font-medium"
					>Name</label
				>
				<Input.Root id="group-name" name="name" value={editingGroup.name} required />
			</div>
			<div>
				<p class="text-muted-foreground mb-1 text-xs font-medium">Game Mode</p>
				{@render gameModePicker(editGroupGameMode, (v) => (editGroupGameMode = v), 'gameMode')}
			</div>
			<div>
				<p class="text-muted-foreground mb-1 text-xs font-medium">Restrictions</p>
				<RestrictEditor name="restrict" value={editingGroup.restrict ?? []} {users} />
			</div>
			<Button.Root type="submit" size="sm">Save</Button.Root>
		</form>
	</Modal>
{/if}

<!-- Create Player Modal -->
<Modal bind:open={createPlayerOpen} title="New Player">
	<form
		onsubmit={(e) => submitForm(e, 'mcUserCreate', () => (createPlayerOpen = false))}
		class="space-y-4"
	>
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div>
			<label for="cp-user" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Account</label
			>
			<select
				id="cp-user"
				name="userId"
				class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
				required
			>
				<option value="">Select user</option>
				{#each unassignedUsers as u (u.id)}
					<option value={u.id}>{u.username}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="cp-name" class="text-muted-foreground mb-1 block text-xs font-medium"
				>MC Username</label
			>
			<div class="relative">
				<input
					id="cp-name"
					name="name"
					placeholder="Steve"
					required
					value={cpName}
					oninput={(e) => {
						cpName = e.currentTarget.value;
						cpNameState = 'idle';
						cpValidateError = '';
					}}
					onpaste={cpHandleNamePaste}
					onblur={cpHandleNameBlur}
					class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none {cpNameState ===
					'invalid'
						? 'border-destructive'
						: cpNameState === 'valid'
							? 'border-green-500'
							: ''}"
				/>
				{#if cpNameState === 'loading'}
					<Loader2
						size={14}
						class="text-muted-foreground absolute top-2.5 right-2.5 animate-spin"
					/>
				{:else if cpNameState === 'valid'}
					<CheckCircle2 size={14} class="absolute top-2.5 right-2.5 text-green-500" />
				{:else if cpNameState === 'invalid'}
					<XCircle size={14} class="text-destructive absolute top-2.5 right-2.5" />
				{/if}
			</div>
		</div>
		<div>
			<label for="cp-uuid" class="text-muted-foreground mb-1 block text-xs font-medium">UUID</label>
			<div class="relative">
				<input
					id="cp-uuid"
					name="uuid"
					placeholder="00000000-0000-0000-0000-000000000000"
					required
					value={cpUuid}
					oninput={(e) => {
						cpUuid = e.currentTarget.value;
						cpUuidState = 'idle';
						cpValidateError = '';
					}}
					onpaste={cpHandleUuidPaste}
					onblur={cpHandleUuidBlur}
					class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 pr-8 font-mono text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none {cpUuidState ===
					'invalid'
						? 'border-destructive'
						: cpUuidState === 'valid'
							? 'border-green-500'
							: ''}"
				/>
				{#if cpUuidState === 'loading'}
					<Loader2
						size={14}
						class="text-muted-foreground absolute top-2.5 right-2.5 animate-spin"
					/>
				{:else if cpUuidState === 'valid'}
					<CheckCircle2 size={14} class="absolute top-2.5 right-2.5 text-green-500" />
				{:else if cpUuidState === 'invalid'}
					<XCircle size={14} class="text-destructive absolute top-2.5 right-2.5" />
				{/if}
			</div>
			{#if cpValidateError}
				<p class="text-destructive mt-1 text-xs">{cpValidateError}</p>
			{/if}
			{#if cpNameState === 'valid'}
				<p class="text-muted-foreground mt-1 text-xs">Verified with Mojang</p>
			{/if}
		</div>
		<Button.Root
			type="submit"
			size="sm"
			disabled={cpNameState === 'loading' || cpUuidState === 'loading'}>Create</Button.Root
		>
	</form>
</Modal>

<!-- Create Warp Modal -->
<Modal bind:open={createWarpOpen} title="New Warp" wide>
	<form
		onsubmit={(e) => submitForm(e, 'warpCreate', () => (createWarpOpen = false))}
		class="space-y-4"
	>
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div>
			<label for="cw-name" class="text-muted-foreground mb-1 block text-xs font-medium">Name</label>
			<Input.Root id="cw-name" name="name" placeholder="spawn" required />
		</div>
		<div>
			<p class="text-muted-foreground mb-1 text-xs font-medium">Location</p>
			<LocationEditor name="location" worlds={worldNames} />
		</div>
		<div>
			<p class="text-muted-foreground mb-1 text-xs font-medium">Restrictions</p>
			<RestrictEditor name="restrict" {users} />
		</div>
		<Button.Root type="submit" size="sm">Create</Button.Root>
	</form>
</Modal>

<!-- Create World Modal -->
<Modal bind:open={createWorldOpen} title="New World">
	<form
		onsubmit={(e) => submitForm(e, 'worldCreate', () => (createWorldOpen = false))}
		class="space-y-4"
	>
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div>
			<label for="cwld-name" class="text-muted-foreground mb-1 block text-xs font-medium"
				>Name</label
			>
			<Input.Root id="cwld-name" name="name" placeholder="world" required />
		</div>
		<div>
			<label for="cwld-group" class="text-muted-foreground mb-1 block text-xs font-medium"
				>World Group</label
			>
			<select
				id="cwld-group"
				name="groupName"
				class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
				required
			>
				<option value="">Select group</option>
				{#each groups as g (g.name)}
					<option value={g.name}>{g.name}</option>
				{/each}
			</select>
		</div>
		<div>
			<p class="text-muted-foreground mb-1 text-xs font-medium">Restrictions</p>
			<RestrictEditor name="restrict" {users} />
		</div>
		<Button.Root type="submit" size="sm">Create</Button.Root>
	</form>
</Modal>

<!-- User View Modal -->
{#if viewingUser}
	<UserViewModal bind:open={viewUserOpen} user={viewingUser} />
{/if}

<!-- Create Group Modal -->
<Modal bind:open={createGroupOpen} title="New World Group">
	<form
		onsubmit={(e) => submitForm(e, 'groupCreate', () => (createGroupOpen = false))}
		class="space-y-4"
	>
		{#if formError}
			<div class="bg-destructive/10 text-destructive rounded px-3 py-2 text-sm">{formError}</div>
		{/if}
		<div>
			<label for="cg-name" class="text-muted-foreground mb-1 block text-xs font-medium">Name</label>
			<Input.Root id="cg-name" name="name" placeholder="survival" required />
		</div>
		<div>
			<p class="text-muted-foreground mb-1 text-xs font-medium">Game Mode</p>
			{@render gameModePicker(createGroupGameMode, (v) => (createGroupGameMode = v), 'gameMode')}
		</div>
		<div>
			<p class="text-muted-foreground mb-1 text-xs font-medium">Restrictions</p>
			<RestrictEditor name="restrict" {users} />
		</div>
		<Button.Root type="submit" size="sm">Create</Button.Root>
	</form>
</Modal>
